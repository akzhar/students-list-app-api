const path = require(`path`);
const isProduction = process.env.NODE_ENV === `production`;
if (!isProduction) {
  require(`dotenv`).config({path: path.resolve(__dirname, `.env`)});
}
const fs = require(`fs`);
const {google} = require(`googleapis`);
const {HttpCode} = require(path.resolve(__dirname, `const.js`));

// Создает OAuth2, используя credentials из process.env
// Возвращает OAuth2
const getOAuth2Client = () => {
  const clientId = process.env.GDRIVE_CLIENT_ID;
  const clientSecret = process.env.GDRIVE_CLIENT_SECRET;
  const redirectUri = process.env.GDRIVE_REDIRECT_URI;
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

// Передает OAuth2 токены авторизации, после чего выполняет переданный callback с параметрами options
// Возвращает результат выполнения callback
async function authorize(callback, options) {
  const oAuth2Client = getOAuth2Client();
  oAuth2Client.setCredentials({
    "refresh_token": process.env.GDRIVE_REFRESH_TOKEN
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

const gDriveApi = {getOAuth2Client, uploadAvatar, removeAvatar};

module.exports = gDriveApi;
