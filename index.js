const path = require(`path`);
const isProduction = process.env.NODE_ENV === `production`;
if (!isProduction) {
  require(`dotenv`).config({path: path.resolve(__dirname, `.env`)});
}
const fs = require(`fs`);
const express = require(`express`);
const cors = require(`cors`);
const pgp = require(`pg-promise`)();
const multer = require(`multer`);
const marked = require(`marked`);
const {getFileExtension, getApiUrl, logAction, logError} = require(path.resolve(__dirname, `utils.js`));

const HOST = process.env.HOST || `localhost`;
const PORT = process.env.PORT || 3000;
const TABLE = process.env.DB_TABLE_NAME;
const API_URL = (isProduction) ? `https://${process.env.APP_NAME}.herokuapp.com` : `http://${HOST}:${PORT}`;
const {AVATARS_FOLDER, VALID_AVATAR_EXTENSIONS, HttpCodes} = require(path.resolve(__dirname, `const.js`));

const api = express();
const db = pgp(process.env.DB_URL);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(__dirname, `./${AVATARS_FOLDER}`));
  },
  filename: (_req, file, cb) => {
    cb(null, `student-${file.fieldname}-${Date.now()}.${getFileExtension(file)}`);
  }
});

const fileFilter = (_req, file, cb) => {
  const fileExtension = getFileExtension(file);
  const isValid = VALID_AVATAR_EXTENSIONS.includes(fileExtension);
  cb(null, isValid);
};

const upload = multer({storage, fileFilter});

const apiRun = () => {
  api.use(express.static(path.resolve(__dirname, `./`)));
  api.use(express.json());
  api.use(cors());
  // возвращает описание API
  api.get(`/`, (_req, res) => {
    const md = fs.readFileSync(path.resolve(__dirname, `API.md`), `utf8`);
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
      res.status(HttpCodes.UNAVAILABLE).send(`База данных недоступна\n${error}`);
    });
  });
  // возвращает объект нового студента, добавленного в БД (без валидации переданных данных)
  api.post(`/student`, upload.single(`avatar`), (req, res) => {
    const avatar = req.file;
    const student = req.body;
    const apiAUrl = getApiUrl(req);
    const avatarFileName = (avatar) ? avatar.filename : `default.svg`;
    const urlToAvatar = `${apiAUrl}/${AVATARS_FOLDER}/${avatarFileName}`;
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
      res.status(HttpCodes.BAD_REQUEST).send(`Не удалось добавить студента\n${error}`);
    });
  });
  // возвращает id удаленного студента (или ошибку 404, если студента с таким id в БД нет)
  api.delete(`/student/:id`, (req, res) => {
    const id = req.params.id;
    db.query(`DELETE FROM ${TABLE} WHERE id = ${id} RETURNING id, avatar;`, id)
    .then((students) => {
      const student = students[0];
      if (student) {
        const avatarUrl = student.avatar;
        const apiAUrl = getApiUrl(req);
        const avatarFileName = avatarUrl.slice(apiAUrl.length + 1);
        res.send(student.id.toString());
        fs.unlink(
            path.resolve(__dirname, `./${AVATARS_FOLDER}/${avatarFileName}`),
            (error) => {
              if (error) {
                logAction(`Не удалось удалить файл ${avatarFileName}\n ${error}`);
              } else {
                logAction(`Файл ${avatarFileName} удален`);
              }
            }
        );
        logAction(`DELETE /student/:${student.id})`);
      } else {
        res.status(HttpCodes.NOT_FOUND).send(`Студент с id ${id} не найден`);
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
