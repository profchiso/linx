const express = require("express");

const createClient = require("../controllers/createClient");
const updateClient = require("../controllers/editClient");
const getAllClientsForBusiness = require("../controllers/getAllClientsForBusiness");
const getAllClientsForStaff = require("../controllers/getAllClientsForStaff");
const getClient = require("../controllers/getClient");
const blacklistClient = require("../controllers/blacklistClient");

// const { uploadCompanyLogo } = require('../helper/upload');
// const { processCompanyLogo } = require('../middlewares/processUploads')
//const { uploadBase64CompanyLogo } = require('../helper/upload');
const { processBase64CompanyLogo } = require("../middlewares/processUploads");

const clientRouter = express.Router();

clientRouter.get(
  "/api/v1/client/business/:businessId",
  getAllClientsForBusiness
);
clientRouter.get(
  "/api/v1/client/business/:businessId/staff/:staffId",
  getAllClientsForStaff
);
clientRouter.get("/api/v1/client/:clientId", getClient);
clientRouter.post("/api/v1/client", processBase64CompanyLogo, createClient);
clientRouter.patch("/api/v1/client/blacklist/:clientId", blacklistClient);
clientRouter.patch("/api/v1/client/:clientId", updateClient);

module.exports = clientRouter;
