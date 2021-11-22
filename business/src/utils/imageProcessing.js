const fs = require("fs");
const path = require("path")
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, '/public')
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

const storage1 = multer.memoryStorage()




const multerStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        if (file.mimetype.startsWith("image")) {
            cb(null, path.join(__dirname, "public"));
        } else {
            cb(new Error("Not an image"), false);
        }
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    },
});

const filterFileType = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        cb(new Error("Not an image"), false);
    }
};





exports.upload = multer({ storage: multerStorage, fileFilter: filterFileType });
//exports.upload = multer({ storage: storage1 });
exports.cloudinary = cloudinary;