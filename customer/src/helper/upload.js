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

const base64Storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'customer',
    public_id: `customer/companyLogo`,
  },
});

const cloudUpload = multer({
  storage,
});

const base64CloudUpload = multer({
  base64Storage,
})


exports.uploadCompanyLogo = cloudUpload.single('companyLogo');

exports.uploadBase64CompanyLogo = base64CloudUpload.single('companyLogo');



exports.cloudUpload = cloudUpload;
exports.cloudUpload = base64CloudUpload;