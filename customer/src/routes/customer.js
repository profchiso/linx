const express = require('express');

const createCustomer = require('../controllers/createCustomer');
const updateCustomer = require('../controllers/editCustomer');
const getAllCustomers = require('../controllers/getAllCustomers');
const getCustomer = require('../controllers/getCustomer');

const { uploadCompanyLogo } = require('../helper/upload');
const { processCompanyLogo } = require('../middlewares/processUploads')


const customerRouter = express.Router();



customerRouter.post('/api/v1/customer', uploadCompanyLogo, processCompanyLogo, createCustomer);
customerRouter.patch('/api/v1/customer/:customerId', updateCustomer);
customerRouter.get('/api/v1/customer', getAllCustomers);
customerRouter.get('/api/v1/customer/:customerId', getCustomer);

module.exports = customerRouter;
