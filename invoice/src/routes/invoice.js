const express = require('express');

const createInvoice = require('../controllers/createInvoice');
const sendDraftInvoice = require('../controllers/sendDraftInvoice');

const invoiceRouter = express.Router();


invoiceRouter.post('/api/v1/:businessId/:customerId/invoice', createInvoice);
invoiceRouter.post('/api/v1/draft/invoice/:id', sendDraftInvoice);

module.exports = invoiceRouter;