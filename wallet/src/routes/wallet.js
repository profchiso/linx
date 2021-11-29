const express = require('express');

const createSecondaryWallet = require('../controllers/createSecondaryWallet');


const walletRouter = express.Router();



walletRouter.post('/api/v1/create-secondary-wallet', createSecondaryWallet);

module.exports = walletRouter;
