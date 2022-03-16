const db = require("../models/index");
const axios = require("axios");
const { NotAuthorisedError } = require("@bc_tickets/common");
const AUTH_URL = process.env.AUTH_URL;
const STAFF_AUTH_URL = process.env.STAFF_AUTH_URL;
const { validate } = require("../helper/validateCustomer");

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
    const { error } = validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.message);
    }

    let createdCustomer = await db.customer.create({
      ...req.body,
      status: "active",
    });
    //   businessName: req.body.businessName,
    //   businessEmail: req.body.businessEmail,
    //   businessPhoneNumber: req.body.businessPhoneNumber,
    //   website: req.body.website,
    //   companyLogo: req.body.companyLogo,
    //   address: req.body.address,
    //   country: req.body.country,
    //   state: req.body.state,
    //   lga: req.body.lga,
    //   firstName: req.body.firstName,
    //   lastName: req.body.lastName,
    //   email: req.body.email,
    //   phoneNumber: req.body.phoneNumber,
    //   alias: req.body.alias,
    //   businessId: req.body.businessId,
    //   status: "active",
    // });

    res.status(201).send({
      message: "Customer Created",
      statuscode: 201,
      type: "success",
      data: {
        customer: createdCustomer,
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
