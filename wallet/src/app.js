const express = require("express");
//require("dotenv").config();
const cronJob = require("node-cron");

const cors = require("cors");

require("express-async-errors");

const cookieSession = require("cookie-session");
const { errorHandler, NotFoundError } = require("@bc_tickets/common");
const db = require("./models/index");
const AWS = require("aws-sdk");
const { sendMailWithSendGrid } = require("./helper/emailTransport");
// Configure the region
AWS.config.update({ region: "us-east-1" });
//AWS.config.update({ accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY });

// Create an SQS service object
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });

const businessCreationQueueUrl =
  "https://sqs.us-east-1.amazonaws.com/322544062396/business-creation-queue";
const staffCreationQueueUrl =
  "https://sqs.us-east-1.amazonaws.com/322544062396/staff-creation-queue";
const businessPrimaryWalletQueueUrl =
  "https://sqs.us-east-1.amazonaws.com/322544062396/business-primary-wallet-creation-queue";
const staffPrimaryWalletQueueUrl =
  "https://sqs.us-east-1.amazonaws.com/322544062396/staff-primary-wallet-creation-queue";
const payrollWalletCreationQueueUrl =
  "https://sqs.us-east-1.amazonaws.com/322544062396/payroll-wallet-creation-queue";
const staffWalletCreditQueue =
  "https://sqs.us-east-1.amazonaws.com/322544062396/staff-wallet-credit-queue";

let businessParams = {
  QueueUrl: businessCreationQueueUrl,
};

let staffParams = {
  QueueUrl: staffCreationQueueUrl,
};

let payrollParams = {
  QueueUrl: payrollWalletCreationQueueUrl,
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
  try {
    // Business wallet creation
    sqs.receiveMessage(businessParams, async function (err, data) {
      if (err) throw new Error(err.message);

      if (!data.Messages) {
        return;
      }

      if (data.Messages && data.Messages.length) {
        let messageBody = data.Messages;

        for (let message of messageBody) {
          let parsedData = JSON.parse(message.Body);

          let checkOwnerId = Number(parsedData.businessId);

          let createdPrimaryWallet = await db.wallet.create({
            walletId: Number(Date.now().toString().substring(0, 10)),
            name: parsedData.name || "Testing",
            businessId: checkOwnerId || 1,
            alias: parsedData.alias,
            credit: 0,
            debit: 0,
            balance: 100000,
            walletType: "Primary",
            userId: parsedData.userId,
            staffId: parsedData.staffId || null,
            email: parsedData.email || "j2k4@yahoo.com",
            category: parsedData.walletCategory || "business",
          });

          let createdPromoWallet = await db.wallet.create({
            walletId: Number(Date.now().toString().substring(0, 10)) - 1,
            name: parsedData.name || "Testing",
            businessId: checkOwnerId || 1,
            alias: parsedData.alias,
            credit: 0,
            debit: 0,
            balance: 20000,
            walletType: "Promo",
            userId: parsedData.userId,
            staffId: parsedData.staffId || null,
            email: parsedData.email || "j2k4@yahoo.com",
            category: parsedData.walletCategory || "business",
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
            QueueUrl: businessPrimaryWalletQueueUrl,
            MessageBody: JSON.stringify(businessWalletPayload),
          };
          let businessSqsWallet = await sqs
            .sendMessage(businessSqsWalletData)
            .promise();
          console.log(
            "Business wallet successfully pushed to business queue",
            businessSqsWallet
          );

          let deleteParams = {
            QueueUrl: businessCreationQueueUrl,
            ReceiptHandle: data.Messages[0].ReceiptHandle,
          };

          sqs.deleteMessage(deleteParams, function (err, data) {
            if (err) {
              console.log("Delete Error", err);
            } else {
              console.log("Business Message Deleted", data);
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

cronJob.schedule("*/2 * * * *", () => {
  try {
    // Staff wallet creation
    sqs.receiveMessage(staffParams, async function (err, data) {
      if (err) throw new Error(err.message);

      if (!data.Messages) {
        return;
      }

      if (data.Messages && data.Messages.length) {
        let messageBody = data.Messages;

        for (let message of messageBody) {
          let parsedData = JSON.parse(message.Body);

          let checkBusinessOwnerId = Number(parsedData.businessId);

          let createdPrimaryWallet = await db.wallet.create({
            walletId: Number(Date.now().toString().substring(0, 10)),
            name: parsedData.name || "Testing",
            businessId: checkBusinessOwnerId || 1,
            userId: parsedData.userId,
            staffId: parsedData.staffId || null,
            alias: parsedData.alias,
            credit: 0,
            debit: 0,
            balance: 0,
            walletType: "Primary",
            email: parsedData.email || "j2k4@yahoo.com",
            category: parsedData.walletCategory || "staff",
          });

          // transport object
          const mailOptions = {
            to: createdPrimaryWallet.email || "j2k4@yahoo.com",
            from: process.env.SENDER_EMAIL,
            subject: "Wallet Creation",
            html: `<p>A wallet with the id ${createdPrimaryWallet.walletId} has been created for you</p>`,
          };

          await sendMailWithSendGrid(mailOptions);

          let staffWalletPayload = {
            businessId: `${createdPrimaryWallet.dataValues.businessOwnerId}`,
            userId: `${createdPrimaryWallet.dataValues.userId}`,
            alias: `${createdPrimaryWallet.dataValues.alias}`,
            staffId: `${createdPrimaryWallet.dataValues.staffId}`,
            primaryWalletId: `${createdPrimaryWallet.dataValues.walletId}`,
            walletBalance: `${createdPrimaryWallet.dataValues.balance}`,
          };

          let staffSqsWalletData = {
            QueueUrl: staffPrimaryWalletQueueUrl,
            MessageBody: JSON.stringify(staffWalletPayload),
          };
          let staffSqsWallet = await sqs
            .sendMessage(staffSqsWalletData)
            .promise();

          console.log(
            "Staff wallet successfully pushed to business queue",
            staffSqsWallet
          );

          let deleteParams = {
            QueueUrl: staffCreationQueueUrl,
            ReceiptHandle: data.Messages[0].ReceiptHandle,
          };

          sqs.deleteMessage(deleteParams, function (err, data) {
            if (err) {
              console.log("Delete Error", err);
            } else {
              console.log("Staff Message Deleted", data);
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

// Payroll

cronJob.schedule("*/3 * * * *", () => {
  try {
    // Pay into staff wallet
    sqs.receiveMessage(payrollParams, async function (err, data) {
      if (err) throw new Error(err.message);

      if (!data.Messages) {
        return;
      }

      if (data.Messages && data.Messages.length) {
        let messageBody = data.Messages;

        for (let message of messageBody) {
          let parsedData = JSON.parse(message.Body);

          let walletId = parsedData.businessPaymentWallet;

          let staffWalletsArray = parsedData.staff;
          let totalAmount = parsedData.totalAmount;
          let walletOwnerEmail = parsedData.businessEmail || "j2k4@yahoo.com";
          let businessId = parsedData.businessId;

          const wallet = await db.wallet.findOne({
            where: { walletId: walletId },
          });

          if (!wallet) {
            throw new Error("wallet cannot be found");
          }

          wallet.dataValues.balance = Number(wallet.dataValues.balance);

          if (wallet.dataValues.balance < totalAmount) {
            throw new Error(
              "You don't have enough amount to make this transfer"
            );
          }
          if (totalAmount <= 0) {
            throw new Error(
              "The amount to be transferred must be greater than 0"
            );
          }

          let emailTransactionDetails = [];
          let transactionDetails = [];
          let transactionReference, transactionDescription;

          // Loop through each staff wallet array ===========================================================>

          for (let eachWallet of staffWalletsArray) {
            const recipientWallet = await db.wallet.findOne({
              where: { walletId: eachWallet.staffWallet },
            });

            if (!recipientWallet) {
              throw new Error("recipient wallet cannot be found");
            }

            if (walletId == eachWallet.staffWallet) {
              throw new Error("you cannot transfer money to your wallet");
            }

            transactionReference = uuid();

            recipientWallet.dataValues.balance = Number(
              recipientWallet.dataValues.balance
            );

            wallet.dataValues.balance -= eachWallet.totalPayable;
            wallet.dataValues.debit = eachWallet.totalPayable;
            let ownersBalance = wallet.dataValues.balance;
            recipientWallet.dataValues.balance += eachWallet.totalPayable;
            recipientWallet.dataValues.credit = eachWallet.totalPayable;
            let recipientBalance = recipientWallet.dataValues.balance;

            const updatedUserWallet = await db.wallet.update(
              { balance: ownersBalance },
              { where: { walletId }, returning: true, plain: true }
            );
            const updatedRecipientWallet = await db.wallet.update(
              { balance: recipientBalance },
              {
                where: { walletId: eachWallet.staffWallet },
                returning: true,
                plain: true,
              }
            );

            let returnData = { ...wallet.dataValues };
            transactionDetails.push(returnData);

            emailTransactionDetails.push(
              eachWallet.staffId,
              eachWallet.totalPayable
            );

            // transport object
            const mailOptionsForCreditAlert = {
              to: eachWallet.email,
              from: process.env.SENDER_EMAIL,
              subject: "Credit Alert",
              html: `<p>The amount of ${eachWallet.totalPayable} has been transferred from the wallet with the id of ${walletId} to your wallet</p>`,
            };

            await sendMailWithSendGrid(mailOptionsForCreditAlert);

            let debitTransaction = db.transaction.create({
              creditType: "wallet",
              ownersWalletId: walletId,
              recipientWalletId: eachWallet.staffWallet,
              businessId,
              amount: eachWallet.totalPayable,
              walletBalance: ownersBalance,
              staffId: null,
              transactionReference,
              transactionType: "Debit",
              transactionStatus: "Successful",
              transactionDescription: "Payroll to staff",
            });

            let creditTransaction = db.transaction.create({
              creditType: "wallet",
              ownersWalletId: eachWallet.staffWallet,
              businessId: recipientWallet.dataValues.businessId,
              senderWalletId: walletId,
              amount: eachWallet.totalPayable,
              walletBalance: recipientBalance,
              staffId: recipientWallet.dataValues.staffId,
              transactionReference,
              transactionType: "Credit",
              transactionStatus: "Successful",
              transactionDescription: "Payroll from business",
            });

            let walletCreditPayload = {
              walletId: walletId,
              recipientId: eachWallet.staffWallet,
              amount: eachWallet.totalPayable,
              ownersBalance: ownersBalance,
              recipientBalance: recipientBalance,
            };

            let wallletCreditSqs = {
              MessageBody: JSON.stringify(walletCreditPayload),
              QueueUrl: staffWalletCreditQueue,
            };
            let sendSqsMessage = sqs.sendMessage(wallletCreditSqs).promise();

            //===========================================================================>
            let deleteParams = {
              QueueUrl: payrollWalletCreationQueueUrl,
              ReceiptHandle: data.Messages[0].ReceiptHandle,
            };

            sqs.deleteMessage(deleteParams, function (err, data) {
              if (err) {
                console.log("Delete Error", err);
              } else {
                console.log("Payroll Message Deleted", data);
              }
            });
          }

          // transport object
          const mailOptionsForDebitAlert = {
            to: walletOwnerEmail,
            from: process.env.SENDER_EMAIL,
            subject: "Debit Alert",
            html: `<p>The amount of ${totalAmount} has been deducted from your account for payroll transaction</p>`,
          };

          await sendMailWithSendGrid(mailOptionsForDebitAlert);

          return res.status(200).send({
            statusCode: 200,
            message: "Transfer Successful",
            data: { transactionsData: transactionDetails },
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
