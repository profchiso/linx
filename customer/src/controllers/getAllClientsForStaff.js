const db = require("../models/index");
const axios = require("axios");
const { NotAuthorisedError } = require("@bc_tickets/common");
const AUTH_URL = process.env.AUTH_URL;
const STAFF_AUTH_URL = process.env.STAFF_AUTH_URL;
//const { validateClientType } = require("../helper/validateClient");

module.exports = async (req, res) => {
  //authenticate user
  try {
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

    // // client validation
    // const { error } = validateClientType(req.body);
    // if (error) {
    //   res.status(400);
    //   throw new Error(error.message);
    // }

    const { businessId, staffId } = req.params;

    let message, clients;

    if (Object.keys(req.query).length === 0 || !req.query.clientType) {
      throw new Error(
        "you must pass a query parameter of 'clientType' for this route"
      );
    }

    if (req.query.clientType.toLowerCase() == "customer") {
      clients = await db.client.findAll({
        where: { businessId, staffId, clientType: "customer" },
      });
      if (!clients) {
        throw new Error("There are no customers found");
      }
      message = "Customers found successfully";
    } else if (req.query.clientType.toLowerCase() == "vendor") {
      clients = await db.client.findAll({
        where: { businessId, staffId, clientType: "vendor" },
      });
      if (!clients) {
        throw new Error("There are no vendors found");
      }

      message = "Vendors found successfully";
    } else {
      res.status(400);
      throw new Error("client type must be either customer or vendor");
    }

    res.status(200).send({
      message,
      statuscode: 200,
      data: { clients },
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
