const db = require("../models/index");
const axios = require("axios");
const { NotAuthorisedError } = require("@bc_tickets/common");
const AUTH_URL = "https://linx-rds.herokuapp.com/api/v1/auth/authenticate";
const { decryptWalletPin } = require("../helper/pinHash");
const { validatePin } = require("../helper/validatePin");

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
    const { error } = validatePin(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.message);
    }

    const { walletId, userType, alias, walletPin } = req.body;

    const { ownerId } = req.params;

    if (userType.toLowerCase() == "business") {
      //CHECK IF WALLET EXIST
      const wallet = await db.wallet.findAll({
        where: { category: userType.toLowerCase(), alias, businessId: ownerId },
      });

      if (!wallet) {
        throw new Error("Wallet(s) cannot be found");
      }

      //CHECK IF PIN EXIST
      const pin = await db.pin.findOne({
        where: { userType, alias, ownerId, walletId },
      });

      if (!pin) {
        throw new Error("You don't have a PIN yet");
      }

      //COMPARE ENTERED PIN WITH HASHED PIN
      if (!(await decryptWalletPin(walletPin, pin.dataValues.walletPin))) {
        throw new Error("Incorrect PIN entered!");
      }

      res.status(200).send({
        message: "PIN validated successfully",
        statuscode: 200,
        type: "success",
        data: {
          wallet: { wallet },
        },
      });
    }

    if (userType.toLowerCase() == "staff") {
      //CHECK IF WALLET EXIST
      const wallet = await db.wallet.findAll({
        where: { category: userType.toLowerCase(), alias, staffId: ownerId },
      });

      if (!wallet) {
        throw new Error("Wallet(s) cannot be found");
      }

      //CHECK IF PIN EXIST
      const pin = await db.pin.findOne({
        where: { userType, alias, ownerId, walletId },
      });

      if (!pin) {
        throw new Error("You don't have a PIN yet");
      }

      //COMPARE ENTERED PIN WITH HASHED PIN
      if (!(await decryptWalletPin(walletPin, pin.dataValues.walletPin))) {
        throw new Error("Incorrect PIN entered!");
      }

      res.status(200).send({
        message: "PIN validated successfully",
        statuscode: 200,
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
