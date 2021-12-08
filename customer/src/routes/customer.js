const express = require('express');

const createCustomer = require('../controllers/createCustomer');
const updateCustomer = require('../controllers/editCustomer');
const getAllCustomers = require('../controllers/getAllCustomers');
const getCustomer = require('../controllers/getCustomer');
const blacklistCustomer = require('../controllers/blacklistCustomer');

const { uploadCompanyLogo } = require('../helper/upload');
const { processCompanyLogo } = require('../middlewares/processUploads')


const customerRouter = express.Router();





customerRouter.get('/api/v1/customer/:businessId', getAllCustomers);
customerRouter.get('/api/v1/customer/:customerId', getCustomer);
customerRouter.post('/api/v1/customer', uploadCompanyLogo, processCompanyLogo, createCustomer);
customerRouter.patch('/api/v1/customer/blacklist/:customerId', blacklistCustomer);
customerRouter.patch('/api/v1/customer/:customerId', updateCustomer);

module.exports = customerRouter;