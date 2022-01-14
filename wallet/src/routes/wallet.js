const express = require("express");

const createSecondaryWallet = require("../controllers/createSecondaryWallet");
const creditOtherWallet = require("../controllers/creditOtherWallet");
const getWallet = require("../controllers/getWallet");
const getAllWalletForABusiness = require("../controllers/getAllWalletForABusiness");
const saveBeneficiaryForAWallet = require("../controllers/saveBeneficiaryForAWallet");
const getBeneficiaryForAWallet = require("../controllers/getBeneficiaryForAWallet");
const getAllCreditTransactions = require("../controllers/getAllCreditTransactions");
const getAllDebitTransactions = require("../controllers/getAllDebitTransactions");
const getASingleCreditTransaction = require("../controllers/getASingleCreditTransaction");
const getASingleDebitTransaction = require("../controllers/getASingleDebitTransaction");

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
walletRouter.get("/api/v1/wallet/credit/:walletId", getAllCreditTransactions);
walletRouter.get("/api/v1/wallet/debit/:walletId", getAllDebitTransactions);
walletRouter.get(
  "/api/v1/wallet/credit/:walletId/:id",
  getASingleCreditTransaction
);
walletRouter.get(
  "/api/v1/wallet/debit/:walletId/:id",
  getASingleDebitTransaction
);
walletRouter.post("/api/v1/create-secondary-wallet", createSecondaryWallet);
walletRouter.post("/api/v1/wallet/credit/:walletId/wallet", creditOtherWallet);
walletRouter.post(
  "/api/v1/wallet/:walletId/beneficiary",
  saveBeneficiaryForAWallet
);

module.exports = walletRouter;
