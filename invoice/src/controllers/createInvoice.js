const { Invoice } = require("../models/invoice");
const axios = require("axios");
const { NotAuthorisedError } = require("@bc_tickets/common");
const AUTH_URL = "https://linx-rds.herokuapp.com/api/v1/auth/authenticate";
const { validate } = require("../helper/validateInvoice");
const { sendMailWithSendGrid } = require("../helper/emailTransport");
const { formatInvoiceMail } = require("../helper/emailFormat");

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
    // invoice validation
    const { error } = validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.message);
    }

    let { customerEmail, status } = req.body;
    let { businessId, customerId } = req.params;

    if (status == "draft") {
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
        message: "Invoice saved as draft",
        statuscode: 201,
        type: "success",
        data: {
          invoice,
        },
      });
    } else {
      if (req.body.amount <= 0) {
        res.status(400);
        throw new Error("Your amount must be greater than 0");
      }

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
      invoice.status = "sent";

      await invoice.save();

      // transport object
      const mailOptions = {
        to: customerEmail,
        from: process.env.SENDER_EMAIL,
        subject: `Dear ${invoice.name}, your invoice is here`,
        //html: `<p>Here is your Invoice: ${invoice}</p>`,
        html: formatInvoiceMail(invoice),
      };

      await sendMailWithSendGrid(mailOptions);

      res.status(201).send({
        message: "Invoice created and sent successfully",
        statuscode: 201,
        type: "success",
        data: {
          invoice,
        },
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
      statuscode: 500,
      errors: [{ message: error.message || "internal server error" }],
    });
  }
};
