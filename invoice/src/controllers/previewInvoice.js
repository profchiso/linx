const { Invoice } = require("../models/invoice");
const axios = require("axios");
const { NotAuthorisedError } = require("@bc_tickets/common");
const AUTH_URL = process.env.AUTH_URL;
const STAFF_AUTH_URL = process.env.STAFF_AUTH_URL;

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

    const invoice = await Invoice.findOne({
      id: req.params.id,
      businessId: req.params.businessId,
      customerId: req.params.customerId,
    });

    if (!invoice) {
      throw new Error("No invoice found");
    }

    res.status(200).send({
      message: "Invoice found successfully",
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
