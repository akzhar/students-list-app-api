const fs = require(`fs`);
const path = require(`path`);
const {Path} = require(path.resolve(__dirname, `const.js`));

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

const logAction = (message) => log(message, Path.LOG_ACTION);

const logError = (error) => {
  const message = `Caught exception\nErr msg: ${error.message}\nErr name: ${error.name}\nErr stack: ${error.stack}`;
  log(message, Path.LOG_ERROR);
};

const readFile = (filename, encoding) => {
  try {
    return fs.readFileSync(filename, encoding);
  } catch (_error) {
    return null;
  }
};

module.exports = {getTimeStamp, getFileExtension, logAction, logError, readFile};
