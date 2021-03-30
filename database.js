const path = require(`path`);
const pgp = require(`pg-promise`)();
const db = pgp(process.env.DB_URL);

const {DbTable} = require(path.resolve(__dirname, `const.js`));

// Возвращает массив объектов студентов из таблицы DbTable.STUDENTS
const getStudents = (onSuccess, onFail) => {
  db.query(`SELECT * FROM ${DbTable.STUDENTS};`)
  .then((students) => onSuccess(students))
  .catch((error) => onFail(error));
};

// Добавляет студента в таблицу DbTable.STUDENTS
const postStudent = (student, onSuccess, onFail) => {
  db.query(`INSERT INTO ${DbTable.STUDENTS} (
    name,
    email,
    rating,
    age,
    avatar,
    spec,
    "group",
    sex,
    favcolor
  ) VALUES (
  '${student.name}',
  '${student.email}',
  ${student.rating},
  ${student.age},
  '${student.avatar}',
  '${student.spec}',
  '${student.group}',
  '${student.sex}',
  '${student.favcolor}'
  ) RETURNING *;`, student)
.then((students) => onSuccess(students))
.catch((error) => onFail(error));
};

// Удаляет студента с переданным id из таблицы DbTable.STUDENTS
const deleteStudent = (studentId, onSuccess, onFail) => {
  db.query(`DELETE FROM ${DbTable.STUDENTS} WHERE id = ${studentId} RETURNING id, avatar;`, studentId)
  .then(async (students) => onSuccess(students))
  .catch((error) => onFail(error));
};

// Возвращает последний refresh_token в таблице DbTable.TOKENS или null, если токенов нет
const getToken = async () => {
  const tokens = await db.query(`SELECT * FROM ${DbTable.TOKENS} ORDER BY id DESC LIMIT 1;`);
  const hasToken = tokens.length !== 0;
  return (hasToken) ? tokens[0][`refresh_token`] : null;
};

// Сохраняет refresh_token в таблицу DbTable.TOKENS
const saveToken = (newTokens, onSuccess, onFail) => {
  db.query(`INSERT INTO ${DbTable.TOKENS} (
  creation_date,
  refresh_token
  ) VALUES (
  CURRENT_TIMESTAMP,
  '${newTokens[`refresh_token`]}'
  );`, newTokens)
  .then(() => onSuccess())
  .catch((error) => onFail(error));
};

const database = {getStudents, postStudent, deleteStudent, getToken, saveToken};

module.exports = database;
