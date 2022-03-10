const { Invoice } = require("../models/invoice");
const axios = require("axios");
const { NotAuthorisedError } = require("@bc_tickets/common");
const AUTH_URL = "https://linx-rds.herokuapp.com/api/v1/auth/authenticate";

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

    const invoice = await Invoice.find({ businessId: req.params.businessId });

    if (!invoice) {
      res.status(404);
      throw new Error("No invoice found");
    }

    res.status(200).send({
      message: "Invoice(s) found successfully",
      statuscode: 200,
      type: "success",
      data: {
        invoice,
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
