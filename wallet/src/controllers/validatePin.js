const db = require("../models/index");
const axios = require("axios");
const { NotAuthorisedError } = require("@bc_tickets/common");
const AUTH_URL = "https://linx-rds.herokuapp.com/api/v1/auth/authenticate";
const { decryptWalletPin } = require("../helper/pinHash");
const { decryptWalletPin } = require("../helper/validatePin");

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

    const { walletId, ownerId, userType, alias, walletPin } = req.body;

    //CHECK IF PIN EXIST
    const wallet = await db.wallet.findOne({
      where: { walletId, category: userType.toLowerCase(), alias },
    });

    if (!wallet) {
      throw new Error("Wallet cannot be found");
    }

    //COMPARE ENTERED PIN WITH HASHED PIN
    if (!(await decryptWalletPin(walletPin, wallet.walletPin))) {
      throw new Error("Incorrect PIN entered!");
    }

    res.status(200).send({
      message: "PIN validated successfully",
      statuscode: 200,
      type: "success",
      data: {
        wallet,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
      statuscode: 500,
      errors: [{ message: error.message || "internal server error" }],
    });
  }
};
