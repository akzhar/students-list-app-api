const path = require(`path`);
const isProduction = process.env.NODE_ENV === `production`;
if (!isProduction) {
  require(`dotenv`).config({path: path.resolve(__dirname, `.env`)});
}
const fs = require(`fs`);
const express = require(`express`);
const cors = require(`cors`);
const marked = require(`marked`);
const database = require(path.resolve(__dirname, `database.js`));
const upload = require(path.resolve(__dirname, `upload.js`));
const gDriveApi = require(path.resolve(__dirname, `google-drive-api.js`));
const {logAction, logError, getApiUrl, getPort} = require(path.resolve(__dirname, `utils.js`));
const {ID_PARAM_REGEXP, Path, HttpCode} = require(path.resolve(__dirname, `const.js`));

const port = getPort();
const apiUrl = getApiUrl();
const api = express();

const apiRun = () => {
  api.use(express.static(path.resolve(__dirname, `./`)));
  api.use(express.json());
  api.use(cors());
  // Возвращает описание API в формате markdown
  api.get(`/`, (_req, res) => {
    const md = fs.readFileSync(path.resolve(__dirname, Path.MD_API_DESCRIPTION), `utf8`);
    res.send(marked(md));
  });
  // Возвращает массив объектов студентов в формате json
  api.get(`/students`, (_req, res) => {
    const onSuccess = (students) => res.json(students);
    const onFail = (error) => {
      const errMsg = `БД недоступна\n${error}`;
      logError(errMsg);
      res.status(HttpCode.UNAVAILABLE).send(errMsg);
    };
    logAction(`GET /students`);
    database.getStudents(onSuccess, onFail);
  });
  // Возвращает объект нового студента, добавленного в БД, в формате json
  api.post(`/student`, upload.single(`avatar`), async (req, res) => {
    const {file: avatar, body: studentData} = req;
    let urlToAvatar = ``;
    if (avatar) {
      const options = {
        fileName: avatar.filename,
        gDriveFolderId: process.env.GDRIVE_FOLDER_ID,
        mimeType: avatar.mimetype,
        filePath: avatar.path
      };
      urlToAvatar = await gDriveApi.uploadAvatar(options);
    } else {
      urlToAvatar = `${apiUrl}/${Path.DEFAULT_AVATAR}`;
    }
    const student = {...studentData, avatar: urlToAvatar};
    const onSuccess = (students) => {
      logAction(`Студент добавлен в БД - (${students[0].name})`);
      res.json(students[0]);
    };
    const onFail = (error) => {
      const errMsg = `Не удалось добавить студента в БД\n${error}`;
      logError(errMsg);
      res.status(HttpCode.BAD_REQUEST).send(errMsg);
    };
    logAction(`POST /student`);
    database.postStudent(student, onSuccess, onFail);
  });
  // Возвращает id удаленного студента или ошибку 404, если студента с таким id в БД нет
  api.delete(`/student/:id`, (req, res) => {
    const {id: studentId} = req.params;
    const onSuccess = async (students) => {
      const student = students[0];
      if (student) {
        const avatarUrl = student.avatar;
        const isDefaultAvatar = avatarUrl.indexOf(apiUrl) !== -1;
        if (!isDefaultAvatar) {
          const avatarId = avatarUrl.match(ID_PARAM_REGEXP)[0];
          const options = {
            fileId: avatarId
          };
          const isRemoved = await gDriveApi.removeAvatar(options);
          logAction(`Аватар студента с id ${student.id}${!isRemoved ? ` НЕ` : ``} удален с Google Drive`);
        }
        logAction(`Студент с id ${student.id} удален из БД`);
        res.send(student.id.toString());
      } else {
        const errMsg = `Студент с id ${studentId} не найден в БД`;
        logError(errMsg);
        res.status(HttpCode.NOT_FOUND).send(errMsg);
      }
    };
    const onFail = (error) => {
      const errMsg = `Не удалось удалить студента из БД\n${error}`;
      logError(errMsg);
      res.status(HttpCode.BAD_REQUEST).send(errMsg);
    };
    logAction(`DELETE /student/:${studentId}`);
    database.deleteStudent(studentId, onSuccess, onFail);
  });
  // Проверяет наличие токена в БД, если токена нет, генерирует ссылку для запроса кода авторизации у Google API
  api.get(`/oauth2`, async (_req, res) => {
    logAction(`GET /oauth2`);
    const token = await database.getToken();
    if (token) {
      const msg = `Приложение уже авторизовано`;
      logAction(`${msg} (в БД уже сохранен токен)`);
      res.send(`${msg}<br><br><a href="/">Вернуться на главную</a>`);
    } else {
      const authUrl = gDriveApi.getAuthUrl();
      const folderUrl = gDriveApi.getGDriveFolderUrl(process.env.GDRIVE_FOLDER_ID);
      logAction(`Запрос кода авторизации у Google API для получения нового токена`);
      res.send(`Разрешите этому приложению использовать вашу <a href="${folderUrl}" target="_blank">папку Google Drive</a> в качестве хранилища для аватаров студентов...<br><br><a href="${authUrl}">Авторизовать приложение</a>`);
    }
  });
  // Получает код авторизации от Google API и обновляет токен
  api.get(`/oauth2callback`, async (req, res) => {
    logAction(`GET /oauth2callback`);
    const {code: authorizationCode} = req.query;
    gDriveApi.getNewToken(authorizationCode);
    res.redirect(`/`);
  });
  api.listen(port);
  logAction(`API URL: ${apiUrl}`);
};

process.on(`uncaughtException`, (error) => {
  logError(error);
  throw new Error(error);
});

apiRun();
