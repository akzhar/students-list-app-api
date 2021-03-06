const path = require(`path`);
const isProduction = process.env.NODE_ENV === `production`;
if (!isProduction) {
  require(`dotenv`).config({path: path.resolve(__dirname, `.env`)});
}
const fs = require(`fs`);
const {google} = require(`googleapis`);
const database = require(path.resolve(__dirname, `database.js`));
const {HttpCode} = require(path.resolve(__dirname, `const.js`));
const {getApiUrl, logAction} = require(path.resolve(__dirname, `utils.js`));

const GOOGLE_DRIVE_SCOPE = `https://www.googleapis.com/auth/drive`;

// Возвращает ссылку на папку на Google Drive
const getGDriveFolderUrl = (gDriveFolderId) => `https://drive.google.com/drive/folders/${gDriveFolderId}`;

// Возвращает ссылку на сохраненный на Google Drive файл
const getGDriveFileUrl = (id) => `https://drive.google.com/uc?export=view&id=${id}`;

// Создает объект OAuth2, используя credentials из process.env
// Назначает обработчик получения нового токена для сохранения его в БД
// Возвращает объект OAuth2
const getOAuth2Client = () => {
  const clientId = process.env.GDRIVE_CLIENT_ID;
  const clientSecret = process.env.GDRIVE_CLIENT_SECRET;
  const redirectUri = `${getApiUrl()}/oauth2callback`;
  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  // обработчик экшена 'tokens' сработает при вызове oAuth2Client.getToken (запрос на авторизацию пользователя)
  oAuth2Client.on(`tokens`, (newTokens) => {
    if (newTokens[`refresh_token`]) {
      const onSuccess = () => logAction(`Новый токен был успешно сохранен в БД`);
      const onFail = (error) => logAction(`Не удалось сохранить токен в базу данных\n${error}`);
      database.saveToken(newTokens, onSuccess, onFail);
    }
  });
  return oAuth2Client;
};

const oAuth2Client = getOAuth2Client();

// Генерирует и возвращает ссылку для авторизации
const getAuthUrl = () => {
  return oAuth2Client.generateAuthUrl({
    "access_type": `offline`,
    "scope": [GOOGLE_DRIVE_SCOPE],
    "prompt": `consent`
  });
};

// Получает новый токен авторизации и передает его OAuth2
async function getNewToken(authorizationCode) {
  const {tokens} = await oAuth2Client.getToken(authorizationCode);
  oAuth2Client.setCredentials(tokens);
}

// Передает OAuth2 сохраненный в БД токен авторизации, после чего выполняет переданный callback с параметрами options
// Возвращает результат выполнения callback
async function authorize(callback, options) {
  const token = await database.getToken();
  oAuth2Client.setCredentials({
    "refresh_token": token
  });
  const result = await callback(oAuth2Client, options);
  return result;
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

// Удаляет файл c указанным fileId с Google Drive, используя метод google.drive.delete
// Возвращает true, если файл был удален с Google Drive, false, если нет
async function deleteFile(authClient, options) {
  const drive = google.drive({version: `v3`, auth: authClient});
  const response = await drive.files.delete({
    fileId: options.fileId
  });
  return response.status === HttpCode.NO_CONTENT;
}

// Вызывает uploadFile с параметрами options, предварительно авторизуя oAuth2Client
// Возвращает ссылку на сохраненный на Google Drive файл
async function uploadAvatar(options) {
  const avatarId = await authorize(uploadFile, options);
  return getGDriveFileUrl(avatarId);
}

// Вызывает deleteFile с параметрами options, предварительно авторизуя oAuth2Client
// Возвращает true, если файл был удален с Google Drive, false, если нет
async function removeAvatar(options) {
  const isRemoved = await authorize(deleteFile, options);
  return isRemoved;
}

const gDriveApi = {getGDriveFolderUrl, getAuthUrl, getNewToken, uploadAvatar, removeAvatar};

module.exports = gDriveApi;
