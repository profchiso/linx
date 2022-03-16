const db = require("../models/index");
const axios = require("axios");
const { NotAuthorisedError } = require("@bc_tickets/common");
const AUTH_URL = process.env.AUTH_URL;
const STAFF_AUTH_URL = process.env.STAFF_AUTH_URL;
const { decryptWalletPin } = require("../helper/pinHash");
const { validatePin } = require("../helper/validatePin");

module.exports = async (req, res) => {
  try {
    //authenticate user
    let authUser;
    if (!req.headers.authsource) {
      return res.status(400).send({
        message: `authSource header required`,
        statuscode: 400,
        errors: [{ message: `authSource header required` }],
      });
    }

    if (req.headers.authsource.toLowerCase() === "user") {
      const { data } = await axios.get(`${AUTH_URL}`, {
        headers: {
          authorization: req.headers.authorization,
        },
      });
      //check if user is not authenticated
      if (!data.user) {
        return res.status(401).send({
          message: `Access denied, you are not authenticated`,
          statuscode: 401,
          errors: [{ message: `Access denied, you are not authenticated` }],
        });
      }
      authUser = data.user;
    } else if (req.headers.authsource.toLowerCase() === "staff") {
      const { data } = await axios.get(`${STAFF_AUTH_URL}`, {
        headers: {
          authorization: req.headers.authorization,
        },
      });
      //check if user is not authenticated
      if (!data.user) {
        return res.status(401).send({
          message: `Access denied, you are not authenticated`,
          statuscode: 401,
          errors: [{ message: `Access denied, you are not authenticated` }],
        });
      }
      authUser = data.user;
    } else {
      return res.status(400).send({
        message: `Invalid authSource in headers value, can only be staff or user`,
        statuscode: 400,
        errors: [
          {
            message: `Invalid authSource query parameter value, can only be staff or user`,
          },
        ],
      });
    }

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
