const AWS = require("aws-sdk");
const { Invoice } = require("../models/invoice");
const axios = require("axios");
const { NotAuthorisedError } = require("@bc_tickets/common");
const AUTH_URL = process.env.AUTH_URL;
const STAFF_AUTH_URL = process.env.STAFF_AUTH_URL;
// const { sendMailWithSendGrid } = require("../helper/emailTransport");
// const { formatInvoiceMail } = require("../helper/emailFormat");

AWS.config.update({ region: "us-east-1" });
//AWS.config.update({accessKeyId: process.env.AWS_ACCESS_KEY_ID,secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,});

// Create an SQS service object
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });

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

    const { customerEmail } = req.body;

    const invoice = await Invoice.findOne({
      id: req.params.id,
      businessId: req.params.businessId,
      customerId: req.params.customerId,
    });

    if (!invoice) {
      throw new Error("No Invoice found");
    }

    // if (invoice.status == "pending" || invoice.status == "draft" || invoice.status == "sent") {

    invoice.status = "sent";

    await invoice.save();

    //get day and month
    const today = new Date();
    const transactionMonth = today.toLocaleString("default", {
      month: "short",
    });
    const transactionDay = today.toLocaleString().substring(0, 10);

    let totalAmount = invoice.goodsDetail[0].totalAmount;
    let quantity = invoice.goodsDetail[0].quantity;

    // // transport object
    // const mailOptions = {
    //   to: customerEmail,
    //   from: process.env.SENDER_EMAIL,
    //   subject: "Your Invoice",
    //   html: formatInvoiceMail(invoice),
    // };

    // await sendMailWithSendGrid(mailOptions);

    let invoicePayload = {
      to: customerEmail,
      from: process.env.SENDER_EMAIL,
      subject: "Your Invoice",
      invoice,
      transactionDay,
      totalAmount,
      quantity,
    };

    let invoiceSqs = {
      MessageBody: JSON.stringify(invoicePayload),
      QueueUrl: process.env.GENERALNOTIFICATIONQUEUEURL,
    };
    let sendSqsMessage = sqs.sendMessage(invoiceSqs).promise();

    console.log(
      "Invoice payload successfully pushed to email notification queue"
    );

    return res.status(200).send({
      message: `Invoice sent successfully to ${customerEmail}`,
      statuscode: 200,
      type: "success",
      data: {
        invoice,
      },
    });
    //}
    //throw new Error("You can only send a draft or pending invoice");
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
      statuscode: 500,
      errors: [{ message: error.message || "internal server error" }],
    });
  }
};
