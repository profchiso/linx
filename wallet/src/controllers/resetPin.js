const db = require("../models/index");
const axios = require("axios");
const { NotAuthorisedError } = require("@bc_tickets/common");
const AUTH_URL = "https://linx-rds.herokuapp.com/api/v1/auth/authenticate";
const { hashWalletPin } = require("../helper/pinHash");
const { validatePinReset } = require("../helper/validatePin");

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

    // //authenticate user
    // const { data } = await axios.get(`${AUTH_URL}`, {
    //   headers: {
    //     authorization: req.headers.authorization,
    //   },
    // });
    // //check if user is not authenticated
    // if (!data.user) {
    //   return res.status(401).send({
    //     message: `Access denied, you are not authenticated`,
    //     statuscode: 401,
    //     errors: [{ message: `Access denied, you are not authenticated` }],
    //   });
    // }

    // PIN reset Validation
    const { error } = validatePinReset(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.message);
    }

    const { newWalletPin, userType, alias, emailOtp } = req.body;

    const { ownerId } = req.params;

    if (userType.toLowerCase() == "business") {
      //CHECK IF WALLET EXIST
      const wallet = await db.wallet.findOne({
        where: {
          category: userType.toLowerCase(),
          alias,
          businessId: ownerId,
          walletType: "Primary",
        },
      });

      if (!wallet) {
        throw new Error("Wallet(s) cannot be found");
      }

      //CHECK IF PIN EXIST
      const pin = await db.pin.findAll({
        where: { userType, alias, ownerId },
      });

      if (pin.length == 0) {
        throw new Error("You don't have a PIN yet");
      }

      //Hash new Wallet PIN
      let hashedPin = await hashWalletPin(newWalletPin);

      // Reset wallet pin
      for (let eachPin of pin) {
        if (eachPin.dataValues.emailOtp !== Number(emailOtp)) {
          throw new Error("Incorrect OTP");
        }

        let resetPin = await db.pin.update(
          {
            walletPin: hashedPin,
          },
          {
            where: {
              alias,
              ownerId,
            },
            returning: true,
            plain: true,
          }
        );
      }

      res.status(200).send({
        message: "PIN reset successful",
        statuscode: 200,
        type: "success",
        data: {
          wallet: { wallet },
        },
      });
    }

    if (userType.toLowerCase() == "staff") {
      //CHECK IF WALLET EXIST
      const wallet = await db.wallet.findOne({
        where: {
          category: userType.toLowerCase(),
          alias,
          staffId: ownerId,
          walletType: "Primary",
        },
      });

      if (!wallet) {
        throw new Error("Wallet(s) cannot be found");
      }

      //CHECK IF PIN EXIST
      const pin = await db.pin.findAll({
        where: { userType, alias, ownerId },
      });

      if (pin.length == 0) {
        throw new Error("You don't have a PIN yet");
      }

      //Hash new Wallet PIN
      let hashedPin = await hashWalletPin(newWalletPin);

      // Reset wallet pin
      for (let eachPin of pin) {
        if (eachPin.dataValues.emailOtp !== Number(emailOtp)) {
          throw new Error("Incorrect OTP");
        }

        let resetPin = await db.pin.update(
          {
            walletPin: hashedPin,
          },
          {
            where: {
              alias,
              ownerId,
            },
            returning: true,
            plain: true,
          }
        );
      }

      res.status(200).send({
        message: "PIN reset successful",
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
