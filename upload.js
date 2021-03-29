const path = require(`path`);
const multer = require(`multer`);
const {getFileExtension} = require(path.resolve(__dirname, `utils.js`));
const {VALID_AVATAR_EXTENSIONS} = require(path.resolve(__dirname, `const.js`));

const storage = multer.diskStorage({
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

module.exports = upload;
