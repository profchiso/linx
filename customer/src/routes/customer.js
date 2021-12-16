const express = require('express');

const createCustomer = require('../controllers/createCustomer');
const updateCustomer = require('../controllers/editCustomer');
const getAllCustomersForBusiness = require('../controllers/getAllCustomersForBusiness');
const getCustomer = require('../controllers/getCustomer');
const blacklistCustomer = require('../controllers/blacklistCustomer');

// const { uploadCompanyLogo } = require('../helper/upload');
// const { processCompanyLogo } = require('../middlewares/processUploads')
const { uploadBase64CompanyLogo } = require('../helper/upload');
const { processBase64CompanyLogo } = require('../middlewares/processUploads')


const customerRouter = express.Router();





customerRouter.get('/api/v1/customer/business/:businessId', getAllCustomersForBusiness);
customerRouter.get('/api/v1/customer/:customerId', getCustomer);
customerRouter.post('/api/v1/customer', uploadBase64CompanyLogo, processBase64CompanyLogo, createCustomer);
customerRouter.patch('/api/v1/customer/blacklist/:customerId', blacklistCustomer);
customerRouter.patch('/api/v1/customer/:customerId', updateCustomer);

module.exports = customerRouter;