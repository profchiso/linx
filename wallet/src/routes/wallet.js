const express = require("express");

const createSecondaryWallet = require("../controllers/createSecondaryWallet");
const creditAWallet = require("../controllers/creditAWallet");
const creditMultipleWallets = require("../controllers/creditMultipleWallets");
const getWallet = require("../controllers/getWallet");
const getAllWalletForABusiness = require("../controllers/getAllWalletForABusiness");
const saveBeneficiaryForAWallet = require("../controllers/saveBeneficiaryForAWallet");
const saveMultipleBeneficiariesForAWallet = require("../controllers/saveMultipleBeneficiariesForAWallet");
const getAllCreditTransactions = require("../controllers/getAllCreditTransactions");
const getAllDebitTransactions = require("../controllers/getAllDebitTransactions");
const getAllTransactionsForABusiness = require("../controllers/getAllTransactionsForABusiness");
const getASingleCreditTransaction = require("../controllers/getASingleCreditTransaction");
const getASingleDebitTransaction = require("../controllers/getASingleDebitTransaction");
const getASingleBeneficiary = require("../controllers/getASingleBeneficiary");
const getAllBeneficiariesForAWallet = require("../controllers/getAllBeneficiariesForAWallet");

const walletRouter = express.Router();

walletRouter.get("/api/v1/wallet/:walletId", getWallet);
walletRouter.get(
  "/api/v1/wallet/business/:businessId",
  getAllWalletForABusiness
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
walletRouter.get(
  "/api/v1/wallet/transactions/:businessId",
  getAllTransactionsForABusiness
);
walletRouter.get(
  "/api/v1/wallet/:walletId/beneficiary/:id",
  getASingleBeneficiary
);
walletRouter.get(
  "/api/v1/wallet/:walletId/beneficiary",
  getAllBeneficiariesForAWallet
);
walletRouter.post("/api/v1/create-secondary-wallet", createSecondaryWallet);
walletRouter.post("/api/v1/wallet/credit/:walletId/wallet", creditAWallet);
walletRouter.post(
  "/api/v1/wallet/credit/:walletId/wallet/multiple",
  creditMultipleWallets
);
walletRouter.post(
  "/api/v1/wallet/:walletId/beneficiary",
  saveBeneficiaryForAWallet
);
walletRouter.post(
  "/api/v1/wallet/:walletId/beneficiary/multiple",
  saveMultipleBeneficiariesForAWallet
);

module.exports = walletRouter;
