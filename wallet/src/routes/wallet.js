const express = require("express");

const createSecondaryWallet = require("../controllers/createSecondaryWallet");
const creditOtherWallet = require("../controllers/creditOtherWallet");

const walletRouter = express.Router();

walletRouter.post("/api/v1/create-secondary-wallet", createSecondaryWallet);
walletRouter.post("api/v1/wallet/credit/:walletId/wallet", creditOtherWallet);

module.exports = walletRouter;
