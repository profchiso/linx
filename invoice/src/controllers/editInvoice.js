const { Invoice } = require("../models/invoice");
const axios = require("axios");
const { NotAuthorisedError } = require("@bc_tickets/common");
const AUTH_URL = "https://linx-rds.herokuapp.com/api/v1/auth/authenticate";
const { validateUpdate } = require("../helper/validateInvoice");

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

    // invoice validation
    const { error } = validateUpdate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.message);
    }

    const { id, businessId, customerId } = req.params;

    const invoice = await Invoice.findOneAndUpdate(
      {
        id: req.params.id,
        businessId: req.params.businessId,
        customerId: req.params.customerId,
      },
      req.body,
      {
        new: true,
      }
    );

    if (!invoice) {
      throw new Error("No invoice found");
    }

    let invoiceGoodsDetailArray = [];

    const generateURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/${businessId}/${customerId}/invoice/preview/${id}`;

    invoice.urlLink = generateURL;

    invoice.goodsDetail.forEach((element) => {
      element.totalAmount = element.cost * element.quantity;
      invoiceGoodsDetailArray.push(element);
    });

    invoice.goodsDetail = invoiceGoodsDetailArray;

    invoice.status = "pending";

    await invoice.save();

    // Send response
    res.status(201).send({
      message: "Invoice successfully edited",
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
