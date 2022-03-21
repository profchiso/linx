const db = require("../models/index");
const axios = require("axios");
const { NotAuthorisedError } = require("@bc_tickets/common");
const AUTH_URL = process.env.AUTH_URL;
const STAFF_AUTH_URL = process.env.STAFF_AUTH_URL;
const { validateUpdate } = require("../helper/validateClient");

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

    // customer data validation
    const { error } = validateUpdate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.message);
    }

    const { clientId } = req.params;

    let message, existingClient, updatedClient;

    if (req.body.clientType.toLowerCase() == "customer") {
      existingClient = await db.client.findOne({
        where: { id: clientId, clientType: "customer" },
      });

      if (!existingClient) {
        throw new Error("customer cannot be found");
      }
      updatedClient = await db.client.update(req.body, {
        where: { id: clientId, clientType: "customer" },
        returning: true,
        plain: true,
      });
      message = "Customer updated successfully";
    } else if (req.body.clientType.toLowerCase() == "vendor") {
      existingClient = await db.client.findOne({
        where: { id: clientId, clientType: "vendor" },
      });

      if (!existingClient) {
        throw new Error("vendor cannot be found");
      }
      updatedClient = await db.client.update(req.body, {
        where: { id: clientId, clientType: "vendor" },
        returning: true,
        plain: true,
      });
      message = "Vendor updated successfully";
    } else {
      res.status(400);
      throw new Error("client type must be either customer or vendor");
    }

    res.status(200).send({
      message,
      statuscode: 200,
      data: {
        client: updatedClient[1],
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
