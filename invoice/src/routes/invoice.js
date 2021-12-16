const express = require('express');

const createInvoice = require('../controllers/createInvoice');
const sendDraftInvoice = require('../controllers/sendDraftInvoice');
const previewInvoice = require('../controllers/previewInvoice');

const invoiceRouter = express.Router();


invoiceRouter.post('/api/v1/:businessId/:customerId/invoice', createInvoice);
invoiceRouter.post('/api/v1/draft/invoice/:id', sendDraftInvoice);
invoiceRouter.get('/api/v1/invoice/preview/:id', previewInvoice);

module.exports = invoiceRouter;