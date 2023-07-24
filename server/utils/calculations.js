const expiresIn = (creationTime) => {
    const createdAt = new Date(creationTime);
    const expirationDate = new Date(createdAt.getTime() + (24 * 60 * 60 * 1000));
    const timeDifference = expirationDate.getTime() - new Date().getTime();
    const remainingHours = Math.floor(timeDifference / (1000 * 60 * 60));
    return remainingHours;
}

const parseFileSize = (fileSizeInBytes) => {

let downloadSize;
let unit;

if (fileSizeInBytes < 1024 * 1024) {
  downloadSize = (fileSizeInBytes / 1024).toFixed(2);
  unit = "KB";
} else if (fileSizeInBytes < 1024 * 1024 * 1024) {
  downloadSize = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
  unit = "MB";
} else {
  downloadSize = (fileSizeInBytes / (1024 * 1024 * 1024)).toFixed(2);
  unit = "GB";
}

return {downloadSize, unit}

}

module.exports = {expiresIn, parseFileSize}