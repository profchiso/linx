const express = require('express');

const createWallet = require('../controllers/createWallet');


const walletRouter = express.Router();



walletRouter.post('/api/v1/auth/signup', createWallet);

module.exports = walletRouter;
