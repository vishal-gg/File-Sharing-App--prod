const multer = require('multer')

// Use memory storage to avoid writing to the file system
const storage = multer.memoryStorage(); 

module.exports = multer({ storage, limits: { fileSize: 1000000 * 500 } }).single('file');
