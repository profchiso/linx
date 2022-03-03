const db = require("../models/index");
const axios = require("axios");
const { NotAuthorisedError } = require("@bc_tickets/common");
const AUTH_URL = "https://linx-rds.herokuapp.com/api/v1/auth/authenticate";
const { validateBeneficiaryData } = require("../helper/validateWallet");

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

    // beneficiary validation
    const { error } = validateBeneficiaryData(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.message);
    }

    const beneficiary = await db.beneficiary.findOne({
      where: {
        beneficiaryWalletId: req.body.beneficiaryWalletId,
        accountNumber: req.body.accountNumber,
      },
    });

    if (beneficiary) {
      throw new Error("You already have this beneficiary saved in your list");
    }

    let createdBeneficiary = await db.beneficiary.create({
      bankName: req.body.bankName,
      accountNumber: req.body.accountNumber,
      beneficiaryWalletId: req.body.beneficiaryWalletId,
      ownersWalletId: req.params.walletId,
    });

    res.status(201).send({
      message: "Beneficiary saved",
      statuscode: 201,
      type: "success",
      data: {
        beneficiary: createdBeneficiary,
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
