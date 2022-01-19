const express = require("express");

const createInvoice = require("../controllers/createInvoice");
const sendDraftInvoice = require("../controllers/sendDraftInvoice");
const previewInvoice = require("../controllers/previewInvoice");
const getAllInvoiceForABusiness = require("../controllers/getAllInvoiceForABusiness");
const editInvoice = require("../controllers/editInvoice");

const invoiceRouter = express.Router();

invoiceRouter.post("/api/v1/:businessId/:customerId/invoice", createInvoice);
invoiceRouter.post(
  "/api/v1/:businessId/:customerId/draft/invoice/:id",
  sendDraftInvoice
);
invoiceRouter.patch("/api/v1/invoice/:id", editInvoice);
invoiceRouter.get(
  "/api/v1/:businessId/:customerId/invoice/preview/:id",
  previewInvoice
);
invoiceRouter.get(
  "/api/v1/invoice/:businessId/preview",
  getAllInvoiceForABusiness
);

module.exports = invoiceRouter;
