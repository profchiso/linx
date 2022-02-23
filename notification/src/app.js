const express = require("express");

const cors = require("cors");

require("express-async-errors");

const cookieSession = require("cookie-session");
const { errorHandler, NotFoundError } = require("@bc_tickets/common");
const db = require("../src/models/index");
const AWS = require("aws-sdk");
//const { uuid } = require("uuidv4");
const { sendMailWithSendGrid } = require("./helper/emailTransport");
const {
  formatStaffWalletCreationMail,
  formatWalletDebitTransactionMail,
  formatWalletCreditTransactionMail,
} = require("./helper/emailFormat");
const { formatInvoiceMail } = require("./helper/emailFormatInvoice");
// Configure the region
AWS.config.update({ region: "us-east-1" });
//AWS.config.update({ accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY });

// Create an SQS service object
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });

let notificationParams = {
  QueueUrl: process.env.GENERALNOTIFICATIONQUEUEURL,
};

const notificationRouter = require("./routes/notification");

const app = express();
app.set("trust proxy", true);
app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV != "test",
  })
);

app.get("/", (req, res) => {
  res.send("welcome to notifications");
});
app.use(notificationRouter);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

cronJob.schedule("*/1 * * * *", () => {
  try {
    // Read notification from queeu and send email
    sqs.receiveMessage(notificationParams, async function (err, data) {
      if (err) throw new Error(err.message);

      if (!data.Messages) {
        return;
      }

      if (data.Messages && data.Messages.length) {
        let messageBody = data.Messages;

        for (let message of messageBody) {
          let parsedData = JSON.parse(message.Body);
          let userClass = parsedData.messageType;

          switch (userClass) {
            case "wallet creation":
              // transport object
              const mailOptions = {
                to: parsedData.to || "j2k4@yahoo.com",
                from: parsedData.from,
                subject: parsedData.subject,
                //html: `<p>A wallet with the id ${createdPrimaryWallet.walletId} has been created for you</p>`,
                html: formatStaffWalletCreationMail(
                  parsedData.createdPrimaryWallet
                ),
              };

              await sendMailWithSendGrid(mailOptions);

              let createdNotification = await db.notification.create({
                from: parsedData.from,
                to: parsedData.to,
                subject: parsedData.subject,
              });
              break;
            case "credit alert":
              // transport object
              const mailOptionsForDebitAlert = {
                to: parsedData.recipientEmail,
                from: parsedData.from,
                subject: parsedData.subject,
                //html: `<p>The amount of ${amount} has been transferred from your wallet to the wallet with the id of ${recipientWalletId}</p>`,
                html: formatWalletCreditTransactionMail(
                  wallet,
                  amount,
                  description,
                  transactionDay
                ),
              };

              await sendMailWithSendGrid(mailOptionsForDebitAlert);

              let createdNotification = await db.notification.create({
                from: parsedData.from,
                to: parsedData.to,
                subject: parsedData.subject,
              });
              break;
            case "debit alert":
              // transport object
              const mailOptionsForDebitAlert = {
                to: parsedData.walletOwnerEmail,
                from: parsedData.from,
                subject: parsedData.subject,
                //html: `<p>The amount of ${amount} has been transferred from your wallet to the wallet with the id of ${recipientWalletId}</p>`,
                html: formatWalletDebitTransactionMail(
                  wallet,
                  amount,
                  description,
                  transactionDay
                ),
              };

              await sendMailWithSendGrid(mailOptionsForDebitAlert);

              let createdNotification = await db.notification.create({
                from: parsedData.from,
                to: parsedData.to,
                subject: parsedData.subject,
              });
              break;
            case "pin otp":
              // transport object
              const mailOptions = {
                to: parsedData.wallet.dataValues.email,
                from: parsedData.from,
                subject: parsedData.subject,
                html: `<p>Here is your OTP ${generatePhoneOtp}</p>`,
              };

              await sendMailWithSendGrid(mailOptions);
              break;
            case "invoice":
              // transport object
              const mailOptions = {
                to: parsedData.customerEmail,
                from: parsedData.from,
                subject: parsedData.subject,
                html: formatInvoiceMail(invoice),
              };

              await sendMailWithSendGrid(mailOptions);
            case "LinX account creation":
              console.log("Waiting");
              break;
            case "LinX verification code":
              console.log("Waiting");
              break;
            default:
              break;
          }

          console.log("Data successfully read from queue and sent as mail");

          let deleteParams = {
            QueueUrl: process.env.GENERALNOTIFICATIONQUEUEURL,
            ReceiptHandle: data.Messages[0].ReceiptHandle,
          };

          sqs.deleteMessage(deleteParams, function (err, data) {
            if (err) {
              console.log("Delete Error", err);
            } else {
              console.log("Notification Message Deleted", data);
            }
          });
        }
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
      statuscode: 500,
      errors: [{ message: error.message || "internal server error" }],
    });
  }
});

module.exports = { app };
