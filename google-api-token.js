const path = require(`path`);
const fs = require(`fs`);
const {Path} = require(path.resolve(__dirname, `const.js`));
const readlineSync = require(`readline-sync`);
const {getOAuth2Client} = require(path.resolve(__dirname, `google-drive-api.js`));
const {logAction, logError} = require(path.resolve(__dirname, `utils.js`));

const SCOPES = [`https://www.googleapis.com/auth/drive`];

// Получает новый refresh_token после авторизации пользователя
// Сохраняет новый refresh_token в файл Path.TOKEN
// https://github.com/googleapis/google-api-nodejs-client#handling-refresh-tokens
async function getNewToken() {
  const oAuth2Client = getOAuth2Client();
  const authUrl = oAuth2Client.generateAuthUrl({
    "access_type": `offline`,
    "scope": SCOPES,
  });
  logAction(`Получите код авторизации по ссылке:\n${authUrl}`);
  const code = readlineSync.question(`Auth code:`);
  logAction(`Код авторизации введен`);
  const {tokens} = await oAuth2Client.getToken(code);
  const token = JSON.stringify(tokens[`refresh_token`]);
  fs.writeFile(Path.TOKEN, token, (error) => {
    if (error) {
      logError(error);
    }
    logAction(`Токен сохранен в файл ${Path.TOKEN}`);
  });
}

getNewToken();
