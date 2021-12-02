const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'customer',
    allowed_formats: ['png', 'jpeg', 'jpg', 'pdf'],
    public_id: (req, file) => file.originalname.split('.').slice(0, -1).join('.'),
  },
});

const cloudUpload = multer({
  storage,
});


exports.uploadCompanyLogo = cloudUpload.single('companyLogo');



exports.cloudUpload = cloudUpload;
