const db = require("../models/index")
const { validate } = require("../helper/validateWallet")

module.exports = async (req, res) => {
    // wallet validation
  const { error } = validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.message);
  }

  const { name, ownerId } = req.body;

  await db.Wallet.create({
      name,
      ownerId,
      credit: 0,
      debit: 0,
      balance: 0
  })
  .then((walletCreated) => {
    res.status(201).json({
      message: 'Wallet Created Successfully',
      walletCreated,
    });
  })
  .catch(error => res.status(500).json({
    message: 'Unsuccessful',
    error: error.toString(),
  }));
}