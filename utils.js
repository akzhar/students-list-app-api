const fs = require(`fs`);
const path = require(`path`);
const File = {
  ACTION: path.resolve(__dirname, `./logs/actions.txt`),
  ERROR: path.resolve(__dirname, `./logs/errors.txt`)
};
const isProduction = process.env.NODE_ENV === `production`;

const getTimeStamp = () => {
  const date = new Date();
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
};

const getFileExtension = (file) => {
  const fileName = file.originalname.toLowerCase();
  return fileName.slice(fileName.indexOf(`.`) + 1);
};

const log = (message, logFile) => {
  const line = `${getTimeStamp()}: ${message}\n`;
  // eslint-disable-next-line no-console
  console.log(line);
  if (!isProduction) {
    fs.appendFile(logFile, line, (error) => {
      if (error) {
        throw error;
      }
    });
  }
};

const getApiUrl = (req) => `${req.protocol}://${req.get(`host`)}`;

const logAction = (message) => log(message, File.ACTION);

const logError = (error) => {
  const message = `Caught exception\nErr msg: ${error.message}\nErr name: ${error.name}\nErr stack: ${error.stack}`;
  log(message, File.ERROR);
};

module.exports = {getTimeStamp, getFileExtension, getApiUrl, logAction, logError};
