const { Invoice } = require("../models/invoice");
const axios = require("axios");
const { NotAuthorisedError } = require("@bc_tickets/common");
const AUTH_URL = "https://linx-rds.herokuapp.com/api/v1/auth/authenticate";
const { validateUpdate } = require("../helper/validateInvoice");
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
    const { error } = validateUpdate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.message);
    }

    const { id } = req.params.id;

    let { customerEmail } = req.body;

    const invoice = await Invoice.findOneAndUpdate(id, req.body, {
      new: true,
    });

    if (!invoice) {
      res.status(404);
      throw new Error("Invoice not found");
    }

    let invoiceGoodsDetailArray = [];

    invoice.goodsDetail.forEach((element) => {
      element.totalAmount = element.cost * element.quantity;
      invoiceGoodsDetailArray.push(element);
    });

    invoice.goodsDetail = invoiceGoodsDetailArray;

    await invoice.save();

    // transport object
    const mailOptions = {
      to: customerEmail,
      from: process.env.SENDER_EMAIL,
      subject: `Dear ${invoice.name}, your invoice is here`,
      html: formatInvoiceMail(invoice),
    };

    await sendMailWithSendGrid(mailOptions);

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
