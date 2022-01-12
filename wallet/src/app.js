const express = require("express");
require("dotenv").config();
const cronJob = require("node-cron");

const cors = require("cors");

require("express-async-errors");

const cookieSession = require("cookie-session");
const { errorHandler, NotFoundError } = require("@bc_tickets/common");
const db = require("../src/models/index");
const AWS = require("aws-sdk");
const { sendMailWithSendGrid } = require("./helper/emailTransport");
// Configure the region
AWS.config.update({ region: "us-east-1" });
//AWS.config.update({ accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY });

// Create an SQS service object
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });

let businessParams = {
  QueueUrl: process.env.businessCreationQueueUrl,
};

let staffParams = {
  QueueUrl: process.env.staffCreationQueueUrl,
};

const walletRouter = require("./routes/wallet");

const app = express();
app.set("trust proxy", true);
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV != "test",
  })
);

app.get("/", (req, res) => {
  res.send("welcome to wallet");
});
app.use(walletRouter);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

cronJob.schedule("*/1 * * * *", () => {
  // Business wallet creation
  sqs.receiveMessage(businessParams, async function (err, data) {
    if (err) throw new Error(err.message);

    let parsedData = JSON.parse(data.Messages[0].Body);

    console.log(parsedData);

    let checkOwnerId = Number(parsedData.businessId);

    let createdPromoWallet = await db.wallet.create({
      walletId: Number(Date.now().toString().substring(0, 10)),
      name: parsedData.name || "Testing",
      businessId: checkOwnerId,
      alias: parsedData.alias,
      credit: 0,
      debit: 0,
      balance: 20000,
      walletType: "Promo",
      userId: parsedData.userId,
    });

    let createdPrimaryWallet = await db.wallet.create({
      walletId: Number(Date.now().toString().substring(0, 10)),
      name: parsedData.name || "Testing",
      businessId: checkOwnerId,
      alias: parsedData.alias,
      credit: 0,
      debit: 0,
      balance: 100000,
      walletType: "Primary",
      userId: parsedData.userId,
    });

    let businessWalletPayload = {
      businessId: `${createdPrimaryWallet.dataValues.ownerId}`,
      primaryWalletId: `${createdPrimaryWallet.dataValues.walletId}`,
      promoWalletId: `${createdPromoWallet.dataValues.walletId}`,
      userId: `${createdPrimaryWallet.dataValues.userId}`,
      alias: `${createdPrimaryWallet.dataValues.alias}`,
      primaryWalletBalance: `${createdPrimaryWallet.dataValues.balance}`,
      promoWalletBalance: `${createdPromoWallet.dataValues.balance}`,
    };

    let businessSqsWalletData = {
      QueueUrl: process.env.businessPrimaryWalletQueueUrl,
      MessageBody: JSON.stringify(businessWalletPayload),
    };
    let businessSqsWallet = await sqs
      .sendMessage(businessSqsWalletData)
      .promise();
  });

  // Staff wallet creation
  sqs.receiveMessage(staffParams, async function (err, data) {
    if (err) throw new Error(err.message);

    let parsedData = JSON.parse(data.Messages[0].Body);

    let checkBusinessOwnerId = Number(parsedData.businessId);

    let createdPrimaryWallet = await db.wallet.create({
      walletId: Number(Date.now().toString().substring(0, 10)),
      name: parsedData.name || "Testing",
      businessId: checkBusinessOwnerId,
      userId: parsedData.userId,
      alias: parsedData.alias,
      credit: 0,
      debit: 0,
      balance: 0,
      walletType: "Primary",
      email: parsedData.email,
    });

    // transport object
    const mailOptions = {
      to: createdPrimaryWallet.email,
      from: process.env.SENDER_EMAIL,
      subject: "Wallet Creation",
      html: `<p>A wallet with the id ${createdPrimaryWallet.walletId} has been created for you</p>`,
    };

    await sendMailWithSendGrid(mailOptions);

    let staffWalletPayload = {
      businessId: `${createdPrimaryWallet.dataValues.businessOwnerId}`,
      userId: `${createdPrimaryWallet.dataValues.userId}`,
      alias: `${createdPrimaryWallet.dataValues.alias}`,
      walletBalance: `${createdPrimaryWallet.dataValues.balance}`,
    };

    let staffSqsWalletData = {
      QueueUrl: process.env.staffPrimaryWalletQueueUrl,
      MessageBody: JSON.stringify(staffWalletPayload),
    };
    let staffSqsWallet = await sqs.sendMessage(staffSqsWalletData).promise();
  });
});

module.exports = { app };
