const db = require("../models/index");
const axios = require("axios");
const { NotAuthorisedError } = require("@bc_tickets/common");
const AUTH_URL = "https://linx-rds.herokuapp.com/api/v1/auth/authenticate";
const { validate } = require("../helper/validateCustomer");

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
