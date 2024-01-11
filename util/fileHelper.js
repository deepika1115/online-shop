const fs = require('fs');

exports.deleteFile = (filePath) => {
  fs.unlink(filePath, (err) =>{
      console.log(err)
  })
 }