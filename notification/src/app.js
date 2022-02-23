const express = require("express");

const cors = require("cors");

require("express-async-errors");

const cookieSession = require("cookie-session");
const { errorHandler, NotFoundError } = require("@bc_tickets/common");
const db = require("../src/models/index");
const AWS = require("aws-sdk");
//const { uuid } = require("uuidv4");
//const { sendMailWithSendGrid } = require("./helper/emailTransport");
//const { formatStaffWalletCreationMail } = require("./helper/emailFormat");
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
              await fundWallet(Customer, amount, description, req, res);
              break;
            case "credit alert":
              await fundWallet(Driver, amount, description, req, res);
              break;
            case "debit alert":
              await fundWallet(Merchant, amount, description, req, res);
              break;
            case "pin otp":
              await fundWallet(Enterprise, amount, description, req, res);
              break;
            case "LinX account creation":
              await fundWallet(Customer, amount, description, req, res);
              break;
            case "LinX verification code":
              await fundWallet(Driver, amount, description, req, res);
              break;
            case "debit alert":
              await fundWallet(Merchant, amount, description, req, res);
              break;
            case "enterprise":
              await fundWallet(Enterprise, amount, description, req, res);
              break;
            default:
              break;
          }

          // transport object
          const mailOptions = {
            to: createdPrimaryWallet.email || "j2k4@yahoo.com",
            from: process.env.SENDER_EMAIL,
            subject: "Wallet Creation",
            //html: `<p>A wallet with the id ${createdPrimaryWallet.walletId} has been created for you</p>`,
            html: formatStaffWalletCreationMail(createdPrimaryWallet),
          };

          await sendMailWithSendGrid(mailOptions);

          console.log(
            "Staff wallet successfully pushed to business queue",
            staffSqsWallet
          );

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
