const express = require('express');

const createdCustomer = require('../controllers/createCustomer');

const { uploadCompanyLogo } = require('../helper/upload');
const { processCompanyLogo } = require('../middlewares/processUploads')


const customerRouter = express.Router();



customerRouter.post('/api/v1/customer', uploadCompanyLogo, processCompanyLogo, createdCustomer);

module.exports = customerRouter;
