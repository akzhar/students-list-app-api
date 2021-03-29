const path = require(`path`);
const fs = require(`fs`);
const readlineSync = require(`readline-sync`);
const {logAction, logError, readFile} = require(path.resolve(__dirname, `utils.js`));
const {google} = require(`googleapis`);

const {HttpCode, Path} = require(path.resolve(__dirname, `const.js`));

// If modifying these scopes, delete token.json
const SCOPES = [`https://www.googleapis.com/auth/drive`];

// Создает OAuth2, используя credentials из process.env, после чего выполняет переданный callback с параметрами options
async function authorize(callback, options) {
  const clientId = process.env.GDRIVE_CLIENT_ID;
  const clientSecret = process.env.GDRIVE_CLIENT_SECRET;
  const redirectUri = `urn:ietf:wg:oauth:2.0:oob`;
  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  let tokens = ``;
  const tokensData = readFile(path.resolve(__dirname, Path.TOKEN), `utf8`);
  if (tokensData) {
    tokens = JSON.parse(tokensData).tokens;
  } else {
    const token = await getAccessToken(oAuth2Client);
    tokens = token.tokens;
  }
  oAuth2Client.setCredentials(tokens);
  const result = await callback(oAuth2Client, options);
  return result;
}

// Получает и сохраняет новый токен после запроса на авторизацию пользователя
// Возвращает новый токен
async function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    "access_type": `offline`,
    "scope": SCOPES,
  });
  logAction(`Authorize this app by visiting this url: ${authUrl}`);
  const code = readlineSync.question(`Enter the code from that page here: `);
  const token = await oAuth2Client.getToken(code);
  fs.writeFile(Path.TOKEN, JSON.stringify(token), (error) => {
    if (error) {
      logError(error);
    }
    logAction(`Token stored to ${Path.TOKEN}`);
  });
  return token;
}

// Загружает файл, описанный в media и metaData, на Google Drive, используя метод google.drive.create
// Возвращает ссылку на сохраненный в Google Drive файл
async function uploadFile(authClient, options) {
  const {fileName, gDriveFolderId, mimeType, filePath} = options;
  const drive = google.drive({version: `v3`, auth: authClient});
  const fileMetadata = {
    name: fileName,
    mimeType,
    parents: [gDriveFolderId]
  };
  const media = {
    mimeType,
    body: fs.createReadStream(filePath)
  };
  const res = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: `id`
  });
  return res.data.id;
}

// Удаляет с Google Drive файл c указанным fileId, используя метод google.drive.delete
// Возвращает true, если файл был удален с Google Drive, false, если нет
async function deleteFile(authClient, options) {
  const drive = google.drive({version: `v3`, auth: authClient});
  const response = await drive.files.delete({
    fileId: options.fileId
  });
  return response.headers.status === HttpCode.NO_CONTENT;
}

// Возвращает ссылку на сохраненный в Google Drive файл
const getGDriveFileUrl = (id) => `https://drive.google.com/uc?export=view&id=${id}`;

// Авторизует клиента с помощью credentials.json для выполнения ф-ции uploadFile с параметами options
// Возвращает ссылку на сохраненный в Google Drive файл
async function uploadAvatar(options) {
  const avatarId = await authorize(uploadFile, options);
  return getGDriveFileUrl(avatarId);
}

// Авторизует клиента с помощью credentials.json для выполнения ф-ции deleteFile с параметами options
// Возвращает true, если файл был удален с Google Drive, false, если нет
async function removeAvatar(options) {
  const isRemoved = await authorize(deleteFile, options);
  return isRemoved;
}

const gDrive = {uploadAvatar, removeAvatar};

module.exports = gDrive;
