const db = require("../models/index");
const axios = require("axios");
const { NotAuthorisedError } = require("@bc_tickets/common");
const AUTH_URL = "https://linx-rds.herokuapp.com/api/v1/auth/authenticate";
const { validateBeneficiariesData } = require("../helper/validateWallet");

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

    //authenticate user
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

    // beneficiaries validation
    const { error } = validateBeneficiariesData(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.message);
    }

    let createdBeneficiaries = [];
    const { beneficiaries } = req.body;

    for (let beneficiary of beneficiaries) {
      let createdBeneficiary = await db.beneficiary.create({
        bankName: beneficiary.bankName,
        accountNumber: beneficiary.accountNumber,
        beneficiaryWalletId: beneficiary.beneficiaryWalletId,
        ownersWalletId: req.params.walletId,
      });

      let returnData = { ...createdBeneficiary.dataValues };
      createdBeneficiaries.push(returnData);
    }

    res.status(201).send({
      message: "Beneficiaries saved",
      statuscode: 201,
      type: "success",
      data: {
        beneficiaries: createdBeneficiaries,
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
