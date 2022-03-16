const { Invoice } = require("../models/invoice");
const axios = require("axios");
const { NotAuthorisedError } = require("@bc_tickets/common");
const AUTH_URL = process.env.AUTH_URL;
const STAFF_AUTH_URL = process.env.STAFF_AUTH_URL;
const { validate } = require("../helper/validateInvoice");

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

    // invoice validation
    const { error } = validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.message);
    }

    let { businessId, customerId } = req.params;

    const n = await Invoice.estimatedDocumentCount();

    let id = n + 1;

    const generateURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/${businessId}/${customerId}/invoice/preview/${id}`;

    const invoice = await Invoice.create(req.body);

    invoice.urlLink = generateURL;

    invoice.id = id;

    invoice.businessId = businessId;
    invoice.customerId = customerId;

    let invoiceGoodsDetailArray = [];

    invoice.goodsDetail.forEach((element) => {
      element.totalAmount = element.cost * element.quantity;
      invoiceGoodsDetailArray.push(element);
    });

    invoice.goodsDetail = invoiceGoodsDetailArray;
    invoice.status = "pending";

    await invoice.save();

    res.status(201).send({
      message: "Invoice created",
      statuscode: 201,
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
