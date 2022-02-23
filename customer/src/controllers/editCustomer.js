const db = require("../models/index");
const axios = require("axios");
const { NotAuthorisedError } = require("@bc_tickets/common");
const AUTH_URL = "https://linx-rds.herokuapp.com/api/v1/auth/authenticate";
const { validateUpdate } = require("../helper/validateCustomer");

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

    // customer data validation
    const { error } = validateUpdate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.message);
    }

    const { customerId } = req.params;
    const existingCustomer = await db.customer.findOne({
      where: { id: customerId },
    });

    if (!existingCustomer) {
      throw new Error("customer cannot be found");
    }
    const updatedCustomer = await db.customer.update(req.body, {
      where: { id: customerId },
      returning: true,
      plain: true,
    });

    res.status(200).send({
      message: "Customer updated successfully",
      statuscode: 200,
      data: {
        customer: updatedCustomer[1],
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
