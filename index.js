const path = require(`path`);
const isProduction = process.env.NODE_ENV === `production`;
if (!isProduction) {
  require(`dotenv`).config({path: path.resolve(__dirname, `.env`)});
}
const fs = require(`fs`);
const express = require(`express`);
const cors = require(`cors`);
const pgp = require(`pg-promise`)();
const upload = require(path.resolve(__dirname, `upload.js`));
const gDriveApi = require(path.resolve(__dirname, `google-drive-api.js`));
const marked = require(`marked`);
const {logAction, logError} = require(path.resolve(__dirname, `utils.js`));

const HOST = process.env.HOST || `localhost`;
const PORT = process.env.PORT || 3000;
const TABLE = process.env.DB_TABLE_NAME;
const API_URL = (isProduction) ? `https://${process.env.APP_NAME}.herokuapp.com` : `http://${HOST}:${PORT}`;
const {ID_PARAM_REGEXP, Path, HttpCode} = require(path.resolve(__dirname, `const.js`));

const api = express();
const db = pgp(process.env.DB_URL);

const apiRun = () => {
  api.use(express.static(path.resolve(__dirname, `./`)));
  api.use(express.json());
  api.use(cors());
  // возвращает описание API в md формате
  api.get(`/`, (_req, res) => {
    const md = fs.readFileSync(path.resolve(__dirname, Path.MD_API_DESCRIPTION), `utf8`);
    res.send(marked(md));
  });
  // возвращает массив объектов студентов
  api.get(`/students`, (_req, res) => {
    db.query(`SELECT * FROM ${TABLE};`)
    .then((students) => {
      res.json(students);
      logAction(`GET /students`);
    })
    .catch((error) => {
      res.status(HttpCode.UNAVAILABLE).send(`База данных недоступна\n${error}`);
    });
  });
  // возвращает объект нового студента, добавленного в БД (без валидации переданных данных)
  api.post(`/student`, upload.single(`avatar`), async (req, res) => {
    const {file: avatar, body: student} = req;
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
      urlToAvatar = `${API_URL}/${Path.DEFAULT_AVATAR}`;
    }
    db.query(`INSERT INTO ${TABLE}
      (name, email, rating, age, avatar, spec, "group", sex, favcolor)
      VALUES ('${student.name}',
      '${student.email}',
      ${student.rating},
      ${student.age},
      '${urlToAvatar}',
      '${student.spec}',
      '${student.group}',
      '${student.sex}',
      '${student.favcolor}'
      ) RETURNING *;`, student)
    .then((students) => {
      res.json(students[0]);
      logAction(`POST /student (${students[0].name})`);
    })
    .catch((error) => {
      res.status(HttpCode.BAD_REQUEST).send(`Не удалось добавить студента\n${error}`);
    });
  });
  // возвращает id удаленного студента (или ошибку 404, если студента с таким id в БД нет)
  api.delete(`/student/:id`, (req, res) => {
    const id = req.params.id;
    db.query(`DELETE FROM ${TABLE} WHERE id = ${id} RETURNING id, avatar;`, id)
    .then(async (students) => {
      const student = students[0];
      if (student) {
        const avatarUrl = student.avatar;
        const isDefaultAvatar = avatarUrl.indexOf(API_URL) !== -1;
        if (!isDefaultAvatar) {
          const avatarId = avatarUrl.match(ID_PARAM_REGEXP)[0];
          const options = {
            fileId: avatarId
          };
          const isRemoved = await gDriveApi.removeAvatar(options);
          logAction(`Аватар студента с id ${student.id}${!isRemoved ? ` НЕ` : ``} удален с Google Drive`);
        }
        res.send(student.id.toString());
        logAction(`DELETE /student/:${student.id}`);
      } else {
        res.status(HttpCode.NOT_FOUND).send(`Студент с id ${id} не найден`);
      }
    })
    .catch((error) => logError(error));
  });
  api.listen(PORT);
  logAction(`API URL: ${API_URL}`);
};

process.on(`uncaughtException`, (error) => {
  logError(error);
  throw new Error();
});

apiRun();
