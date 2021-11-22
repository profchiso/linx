const express = require('express');

const createWallet = require('../controllers/createWallet');


const walletRouter = express.Router();



walletRouter.post('/api/v1/create-wallet', createWallet);

module.exports = walletRouter;
