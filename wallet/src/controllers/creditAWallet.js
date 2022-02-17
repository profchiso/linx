const AWS = require("aws-sdk");
const { uuid } = require("uuidv4");
const db = require("../models/index");
const { validateWalletCreditData } = require("../helper/validateWallet");
const { sendMailWithSendGrid } = require("../helper/emailTransport");
const {
  formatWalletDebitTransactionMail,
  formatWalletCreditTransactionMail,
} = require("../helper/emailFormat");

AWS.config.update({ region: "us-east-1" });
//AWS.config.update({accessKeyId: process.env.AWS_ACCESS_KEY_ID,secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,});

// Create an SQS service object
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });

const businessWalletCreditQueue =
  "https://sqs.us-east-1.amazonaws.com/322544062396/business-wallet-credit-queue";
const staffWalletCreditQueue =
  "https://sqs.us-east-1.amazonaws.com/322544062396/staff-wallet-credit-queue";

module.exports = async (req, res) => {
  try {
    // const { data } = await axios.get(`${AUTH_URL}`, {
    //         headers: {
    //             authorization: req.headers.authorization
    //         }
    //     })
    //     //check if user is not authenticated
    // if (!data.user) {
    //     throw new NotAuthorisedError()
    // }

    //wallet validation
    const { error } = validateWalletCreditData(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.message);
    }
    const { walletId } = req.params;
    const {
      recipientWalletId,
      amount,
      recipientType,
      walletOwnerEmail,
      recipientEmail,
      businessId,
      description,
    } = req.body;
    let staffId = req.body.staffId;
    const wallet = await db.wallet.findOne({ where: { walletId: walletId } });

    if (!wallet) {
      throw new Error("wallet cannot be found");
    }

    if (walletId === recipientWalletId) {
      throw new Error("you cannot transfer money to your wallet");
    }

    const recipientWallet = await db.wallet.findOne({
      where: { walletId: recipientWalletId },
    });

    if (!recipientWallet) {
      throw new Error("recipient wallet cannot be found");
    }

    wallet.dataValues.balance = Number(wallet.dataValues.balance);

    recipientWallet.dataValues.balance = Number(
      recipientWallet.dataValues.balance
    );

    if (wallet.dataValues.balance < amount) {
      throw new Error("You don't have enough amount to make this transfer");
    }
    if (amount <= 0) {
      throw new Error("The amount to be transferred must be greater than 0");
    }

    if (!staffId) {
      staffId = 0;
    }

    //get day and month
    const today = new Date();
    const transactionMonth = today.toLocaleString("default", {
      month: "short",
    });
    const transactionDay = today.toLocaleString().substring(0, 10);

    let transactionReference = uuid();
    //let transactionDescription = description;

    wallet.dataValues.balance -= amount;
    wallet.dataValues.debit = amount;
    let ownersBalance = wallet.dataValues.balance;
    recipientWallet.dataValues.balance += amount;
    recipientWallet.dataValues.credit = amount;
    let recipientBalance = recipientWallet.dataValues.balance;

    const updatedUserWallet = await db.wallet.update(
      { balance: ownersBalance },
      { where: { walletId }, returning: true, plain: true }
    );
    const updatedRecipientWallet = await db.wallet.update(
      { balance: recipientBalance },
      { where: { walletId: recipientWalletId }, returning: true, plain: true }
    );

    // transport object
    const mailOptionsForDebitAlert = {
      to: walletOwnerEmail,
      from: process.env.SENDER_EMAIL,
      subject: "Debit Alert",
      //html: `<p>The amount of ${amount} has been transferred from your wallet to the wallet with the id of ${recipientWalletId}</p>`,
      html: formatWalletDebitTransactionMail(
        wallet,
        amount,
        description,
        transactionDay
      ),
    };

    await sendMailWithSendGrid(mailOptionsForDebitAlert);

    // transport object
    const mailOptionsForCreditAlert = {
      to: recipientEmail,
      from: process.env.SENDER_EMAIL,
      subject: "Credit Alert",
      //html: `<p>The amount of ${amount} has been transferred from the wallet with the id of ${walletId} to your wallet</p>`,
      html: formatWalletCreditTransactionMail(
        recipientWallet,
        amount,
        description,
        transactionDay
      ),
    };

    await sendMailWithSendGrid(mailOptionsForCreditAlert);

    Promise.all([
      db.transaction.create({
        creditType: "wallet",
        ownersWalletId: walletId,
        recipientWalletId: recipientWalletId,
        businessId,
        amount,
        walletBalance: ownersBalance,
        staffId,
        transactionReference,
        transactionType: "Debit",
        transactionStatus: "Successful",
        transactionDescription: description,
        transactionMonth: transactionMonth,
      }),

      db.transaction.create({
        creditType: "wallet",
        ownersWalletId: recipientWalletId,
        businessId: recipientWallet.dataValues.businessId,
        senderWalletId: walletId,
        amount,
        walletBalance: recipientBalance,
        staffId: recipientWallet.dataValues.staffId || 0,
        transactionReference,
        transactionType: "Credit",
        transactionStatus: "Successful",
        transactionDescription: description,
        transactionMonth: transactionMonth,
      }),
    ]).then(() => {
      let walletCreditPayload = {
        walletId: walletId,
        recipientId: recipientWalletId,
        amount: amount,
        ownersBalance: ownersBalance,
        recipientBalance: recipientBalance,
      };

      let wallletCreditSqs = {
        MessageBody: JSON.stringify(walletCreditPayload),
        QueueUrl:
          recipientType == "business"
            ? businessWalletCreditQueue
            : staffWalletCreditQueue,
      };
      let sendSqsMessage = sqs.sendMessage(wallletCreditSqs).promise();

      return res.status(200).send({
        statusCode: 200,
        message: "Recipient wallet successfully credited",
        data: { updatedUserWallet },
      });
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
