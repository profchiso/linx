const db = require("../models/index");
const axios = require("axios");
const { NotAuthorisedError } = require("@bc_tickets/common");
const AUTH_URL = "https://linx-rds.herokuapp.com/api/v1/auth/authenticate";
const { hashWalletPin } = require("../helper/pinHash");
const { validate } = require("../helper/validatePin");
const { generateOtp } = require("../helper/generateOtpCode");
const { sendMailWithSendGrid } = require("../helper/emailTransport");

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

    // wallet body validation
    const { error } = validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.message);
    }

    const { walletId, userType, alias } = req.body;

    const { ownerId } = req.params;

    if (userType.toLowerCase() == "business") {
      //CHECK IF WALLET EXIST
      const wallet = await db.wallet.findOne({
        where: {
          category: userType.toLowerCase(),
          alias,
          businessId: ownerId,
          walletId,
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

      let generatePhoneOtp = generateOtp();

      console.log("====>", generatePhoneOtp);

      // Update OTP field in PIN table
      for (let eachPin of pin) {
        let setOtp = await db.pin.update(
          {
            emailOtp: generatePhoneOtp,
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

      // transport object
      const mailOptions = {
        to: wallet.dataValues.email,
        from: process.env.SENDER_EMAIL,
        subject: "OTP",
        html: `<p>Here is your OTP ${generatePhoneOtp}</p>`,
      };

      await sendMailWithSendGrid(mailOptions);

      res.status(200).send({
        message: `An OTP has been sent to ${wallet.dataValues.email}`,
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
          walletId,
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

      let generatePhoneOtp = generateOtp();

      // Update OTP field in PIN table
      for (let eachPin of pin) {
        let setOtp = await db.pin.update(
          {
            emailOtp: generatePhoneOtp,
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

      // transport object
      const mailOptions = {
        to: wallet.dataValues.email,
        from: process.env.SENDER_EMAIL,
        subject: "OTP",
        html: `<p>Here is your OTP ${generatePhoneOtp}</p>`,
      };

      await sendMailWithSendGrid(mailOptions);

      res.status(200).send({
        message: `An OTP has been sent to ${wallet.dataValues.email}`,
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
