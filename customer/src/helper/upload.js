// const cloudinary = require('cloudinary').v2;
// const multer = require('multer');
// const { CloudinaryStorage } = require('multer-storage-cloudinary');

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const storage = new CloudinaryStorage({
//     cloudinary,
//     params: {
//         folder: 'customer',
//         allowed_formats: ['png', 'jpeg', 'jpg', 'pdf'],
//         public_id: (req, file) => file.originalname.split('.').slice(0, -1).join('.'),
//     },
// });

// const base64Storage = new CloudinaryStorage({
//     cloudinary,
//     params: {
//         folder: 'customer',
//         public_id: `customer/companyLogo`,
//     },
// });

// const cloudUpload = multer({
//     storage,
// });

// const base64CloudUpload = multer({
//     base64Storage,
// })


// exports.uploadCompanyLogo = cloudUpload.single('companyLogo');

// exports.uploadBase64CompanyLogo = base64CloudUpload.single('companyLogo');



// exports.cloudUpload = cloudUpload;
// exports.cloudUpload = base64CloudUpload;

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
        if (file.mimetype.includes("jpeg") || file.mimetype.includes("png") || file.mimetype.includes("pdf") || file.mimetype.includes("svg") || file.mimetype.includes("jpg") || file.mimetype.includes("doc") || file.mimetype.includes("docx")) {
            cb(null, path.join(__dirname, "public"));
        } else {
            cb(new Error("File type not supported"), false);
        }
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    },
});

const filterFileType = (req, file, cb) => {
    if (file.mimetype.includes("jpeg") || file.mimetype.includes("png") || file.mimetype.includes("pdf") || file.mimetype.includes("svg") || file.mimetype.includes("jpg") || file.mimetype.includes("doc") || file.mimetype.includes("docx")) {
        cb(null, true);
    } else {
        cb(new Error("File type not supported"), false);
    }
};





exports.upload = multer({ storage: multerStorage, fileFilter: filterFileType, limits: { fieldSize: 25 * 1024 * 1024 } });
//exports.upload = multer({ storage: storage1 });
exports.cloudinary = cloudinary;