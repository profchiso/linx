const db = require("../models/index");
const axios = require("axios");
const { NotAuthorisedError } = require("@bc_tickets/common");
const AUTH_URL = process.env.AUTH_URL;
const STAFF_AUTH_URL = process.env.STAFF_AUTH_URL;
const { validateClientType } = require("../helper/validateCustomer");

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

    // client validation
    const { error } = validateClientType(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.message);
    }

    const { clientId } = req.params;

    let message, client;

    if (req.body.clientType.toLowerCase() == "customer") {
      client = await db.client.findOne({
        where: { id: clientId, clientType: "customer" },
      });

      if (!client) {
        throw new Error("customer cannot be found");
      }

      // Toggle blacklist status
      client.isBlacklisted = !client.isBlacklisted;

      client.status = client.isBlacklisted ? "blacklisted" : "active";

      await client.save();

      message = client.isBlacklisted
        ? "Customer has been blacklisted"
        : "Customer has been removed from blacklist";
    } else if (req.body.clientType.toLowerCase() == "vendor") {
      client = await db.client.findOne({
        where: { id: clientId, clientType: "vendor" },
      });

      if (!client) {
        throw new Error("vendor cannot be found");
      }

      // Toggle blacklist status
      client.isBlacklisted = !client.isBlacklisted;

      client.status = client.isBlacklisted ? "blacklisted" : "active";

      await client.save();

      message = client.isBlacklisted
        ? "Vendor has been blacklisted"
        : "Vendor has been removed from blacklist";
    } else {
      res.status(400);
      throw new Error("client type must be either customer or vendor");
    }

    res.status(200).send({
      message,
      statuscode: 200,
      data: { client },
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
