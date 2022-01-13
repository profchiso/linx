const express = require("express");

const createSecondaryWallet = require("../controllers/createSecondaryWallet");
const creditOtherWallet = require("../controllers/creditOtherWallet");
const getWallet = require("../controllers/getWallet");
const getAllWalletForABusiness = require("../controllers/getAllWalletForABusiness");
const saveBeneficiaryForAWallet = require("../controllers/saveBeneficiaryForAWallet");
const getBeneficiaryForAWallet = require("../controllers/getBeneficiaryForAWallet");

const walletRouter = express.Router();

walletRouter.get("/api/v1/wallet/:walletId", getWallet);
walletRouter.get(
  "/api/v1/wallet/business/:businessId",
  getAllWalletForABusiness
);
walletRouter.get(
  "/api/v1/wallet/:walletId/beneficiary",
  getBeneficiaryForAWallet
);
walletRouter.post("/api/v1/create-secondary-wallet", createSecondaryWallet);
walletRouter.post("/api/v1/wallet/credit/:walletId/wallet", creditOtherWallet);
walletRouter.post(
  "/api/v1/wallet/:walletId/beneficiary",
  saveBeneficiaryForAWallet
);

module.exports = walletRouter;
