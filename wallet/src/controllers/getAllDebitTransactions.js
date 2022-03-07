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

    const { walletId } = req.params;
    const transactions = await db.transaction.findAll({
      where: { ownersWalletId: walletId, transactionType: "Debit" },
    });
    if (transactions.length == 0) {
      throw new Error("There are no transactions found");
    }

    res.status(200).send({
      message: "Transactions found successfully",
      statuscode: 200,
      data: { transactions },
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
