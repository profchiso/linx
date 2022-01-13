const db = require("../models/index");
const axios = require("axios");
const { NotAuthorisedError } = require("@bc_tickets/common");
const AUTH_URL = "https://linx-rds.herokuapp.com/api/v1/auth/authenticate";

module.exports = async (req, res) => {
  //authenticate user
  try {
    // const { data } = await axios.get(`${AUTH_URL}`, {
    //         headers: {
    //             authorization: req.headers.authorization
    //         }
    //     })
    //     //check if user is not authenticated
    // if (!data.user) {
    //     throw new NotAuthorisedError()
    // }
    const { walletId } = req.params;
    const wallet = await db.wallet.findOne({
      where: { walletId: walletId },
      // include: [{ model: "beneficiaries", as: "beneficiaries" }],
    });

    if (!wallet) {
      throw new Error("wallet cannot be found");
    }

    res.status(200).send({
      message: "Wallet found successfully",
      statuscode: 200,
      data: { wallet },
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
