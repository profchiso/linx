const express = require('express');

const createInvoice = require('../controllers/createInvoice');

const invoiceRouter = express.Router();


invoiceRouter.get('/api/v1/:businessId/:customerId/invoice', createInvoice);

module.exports = invoiceRouter;