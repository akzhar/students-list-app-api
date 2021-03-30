const ID_PARAM_REGEXP = /(?<=&id=).+$/;
const VALID_AVATAR_EXTENSIONS = [`png`, `jpg`, `jpeg`];
const Path = {
  DEFAULT_AVATAR: `./default.svg`,
  MD_API_DESCRIPTION: `./API.md`,
  LOG_ACTION: `./logs/actions.txt`,
  LOG_ERROR: `./logs/errors.txt`
};
const DbTable = {
  STUDENTS: `students`,
  TOKENS: `google_drive_tokens`
};
const HttpCode = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  UNAVAILABLE: 503,
  NO_CONTENT: 204
};

module.exports = {ID_PARAM_REGEXP, VALID_AVATAR_EXTENSIONS, Path, DbTable, HttpCode};
