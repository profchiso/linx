const express = require("express");

const createInvoice = require("../controllers/createInvoice");
const sendCreatedInvoice = require("../controllers/sendCreatedInvoice");
const previewInvoice = require("../controllers/previewInvoice");
const getAllInvoiceForABusiness = require("../controllers/getAllInvoiceForABusiness");
const editInvoice = require("../controllers/editInvoice");
const deactivateInvoice = require("../controllers/deactivateInvoice");
const saveInvoiceAsDraft = require("../controllers/saveInvoiceAsDraft");

const invoiceRouter = express.Router();

invoiceRouter.post("/api/v1/:businessId/:customerId/invoice", createInvoice);
invoiceRouter.post(
  "/api/v1/:businessId/:customerId/send/invoice/:id",
  sendCreatedInvoice
);
invoiceRouter.patch("/api/v1/:businessId/:customerId/invoice/:id", editInvoice);
invoiceRouter.patch(
  "/api/v1/:businessId/:customerId/invoice/:id/draft",
  saveInvoiceAsDraft
);
invoiceRouter.patch(
  "/api/v1/:businessId/:customerId/invoice/:id/deactivate",
  deactivateInvoice
);
invoiceRouter.get(
  "/api/v1/:businessId/:customerId/invoice/preview/:id",
  previewInvoice
);
invoiceRouter.get(
  "/api/v1/invoice/:businessId/preview",
  getAllInvoiceForABusiness
);

module.exports = invoiceRouter;
