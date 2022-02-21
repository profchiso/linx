const db = require("../models/index");
const axios = require("axios");
const { NotAuthorisedError } = require("@bc_tickets/common");
const AUTH_URL = "https://linx-rds.herokuapp.com/api/v1/auth/authenticate";
const { hashWalletPin } = require("../helper/pinHash");
const { validate } = require("../helper/validatePin");

module.exports = async (req, res) => {
  try {
    //authenticate user
    // const { data } = await axios.get(`${AUTH_URL}`, {
    //         headers: {
    //             authorization: req.headers.authorization
    //         }
    //     })
    //     //check if user is not authenticated
    // if (!data.user) {
    //     throw new NotAuthorisedError()
    // }
    // customer validation
    const { error } = validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.message);
    }

    const { walletId, userType, alias, walletPin, walletType } = req.body;

    const { ownerId } = req.params;

    //check if usertype is business
    if (userType.toLowerCase() == "business") {
      //CHECK IF WALLET EXIST
      const wallet = await db.wallet.findAll({
        where: { category: userType.toLowerCase(), alias, businessId: ownerId },
      });

      if (wallet.length == 0) {
        throw new Error("Wallet(s) cannot be found");
      }

      //Hash Wallet Pin
      let hashedPin = await hashWalletPin(walletPin);

      //create same pin for each walllet of the business
      for (let eachWallet of wallet) {
        let createdPin = await db.pin.create({
          walletId: eachWallet.dataValues.walletId,
          ownerId,
          userId: req.body.userId || 0,
          userType,
          alias,
          walletPin: hashedPin,
          walletType: eachWallet.dataValues.walletType,
        });

        await db.wallet.update(
          { hasPin: true },
          {
            where: {
              category: userType.toLowerCase(),
              alias,
              businessId: ownerId,
              walletType: eachWallet.dataValues.walletType,
              walletId: eachWallet.dataValues.walletId,
            },
            returning: true,
            plain: true,
          }
        );
      }
      res.status(201).send({
        message: "A PIN has been created for your wallet transactions",
        statuscode: 201,
        type: "success",
        data: {
          wallet: { wallet },
        },
      });
    }

    // check if the usertype is staff
    if (userType.toLowerCase() == "staff") {
      //CHECK IF WALLET EXIST
      const wallet = await db.wallet.findAll({
        where: { category: userType.toLowerCase(), alias, staffId: ownerId },
      });

      if (wallet.length == 0) {
        throw new Error("Wallet(s) cannot be found");
      }

      //Hash Wallet Pin
      let hashedPin = await hashWalletPin(walletPin);

      for (let eachWallet of wallet) {
        let createdPin = await db.pin.create({
          walletId: eachWallet.dataValues.walletId,
          ownerId,
          userId: req.body.userId || 0,
          userType,
          alias,
          walletPin: hashedPin,
          walletType: eachWallet.dataValues.walletType,
        });

        await db.wallet.update(
          { hasPin: true },
          {
            where: {
              category: userType.toLowerCase(),
              alias: alias || null,
              staffId: ownerId,
              walletType: eachWallet.dataValues.walletType,
              walletId: eachWallet.dataValues.walletId,
            },
            returning: true,
            plain: true,
          }
        );
      }
      res.status(201).send({
        message: "A PIN has been created for your wallet transactions",
        statuscode: 201,
        type: "success",
        data: {
          wallet: { wallet },
        },
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
      statuscode: 500,
      errors: [{ message: error.message || "internal server error" }],
    });
  }
};
