const AWS = require("aws-sdk");
const { uuid } = require("uuidv4");
const db = require("../models/index");
const {
  validateMultipleWalletsCreditData,
} = require("../helper/validateWallet");
const { sendMailWithSendGrid } = require("../helper/emailTransport");

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
    const { error } = validateMultipleWalletsCreditData(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.message);
    }
    const { walletId } = req.params;
    const { walletsArray, totalAmount, walletOwnerEmail, businessId } =
      req.body;
    let staffId = req.body.staffId;

    const wallet = await db.wallet.findOne({ where: { walletId: walletId } });

    if (!wallet) {
      throw new Error("wallet cannot be found");
    }

    if (!staffId) {
      staffId = 0;
    }

    if (wallet.dataValues.balance < totalAmount) {
      throw new Error("You don't have enough amount to make this transfer");
    }
    if (totalAmount <= 0) {
      throw new Error("The amount to be transferred must be greater than 0");
    }

    let emailTransactionDetails = [];
    let transactionDetails = [];

    for (let eachWallet of walletsArray) {
      const recipientWallet = await db.wallet.findOne({
        where: { walletId: eachWallet.recipientWalletId },
      });

      if (!recipientWallet) {
        throw new Error("recipient wallet cannot be found");
      }

      if (walletId === eachWallet.recipientWalletId) {
        throw new Error("you cannot transfer money to your wallet");
      }

      let transactionReference = uuid();
      let transactionDescription = uuid();

      wallet.dataValues.balance -= eachWallet.amount;
      wallet.dataValues.debit = eachWallet.amount;
      let ownersBalance = wallet.dataValues.balance;
      recipientWallet.dataValues.balance += eachWallet.amount;
      recipientWallet.dataValues.credit = eachWallet.amount;
      let recipientBalance = recipientWallet.dataValues.balance;

      const updatedUserWallet = await db.wallet.update(
        { balance: ownersBalance },
        { where: { walletId }, returning: true, plain: true }
      );
      const updatedRecipientWallet = await db.wallet.update(
        { balance: recipientBalance },
        {
          where: { walletId: eachWallet.recipientWalletId },
          returning: true,
          plain: true,
        }
      );

      let returnData = { ...wallet.dataValues };
      transactionDetails.push(returnData);

      emailTransactionDetails.push(eachWallet.recipientId, eachWallet.amount);

      // transport object
      const mailOptionsForCreditAlert = {
        to: eachWallet.recipientEmail,
        from: process.env.SENDER_EMAIL,
        subject: "Credit Alert",
        html: `<p>The amount of ${eachWallet.amount} has been transferred from the wallet with the id of ${walletId} to your wallet</p>`,
      };

      await sendMailWithSendGrid(mailOptionsForCreditAlert);

      // let transaction = db.transaction.create({
      //   creditType: "wallet",
      //   ownersWalletId: walletId,
      //   recipientWalletId: eachWallet.recipientWalletId,
      //   amount: eachWallet.amount,
      //   ownersWalletBalance: ownersBalance,
      //   recipientWalletBalance: recipientBalance,
      // });

      let debitTransaction = db.transaction.create({
        creditType: "wallet",
        ownersWalletId: walletId,
        recipientWalletId: eachWallet.recipientWalletId,
        businessId,
        amount: eachWallet.amount,
        walletBalance: ownersBalance,
        staffId,
        transactionReference,
        transactionType: "Debit",
        transactionStatus: "Successful",
        transactionDescription,
      });

      let creditTransaction = db.transaction.create({
        creditType: "wallet",
        ownersWalletId: eachWallet.recipientWalletId,
        businessId: recipientWallet.dataValues.businessId,
        senderWalletId: walletId,
        amount: eachWallet.amount,
        walletBalance: recipientBalance,
        staffId: recipientWallet.dataValues.staffId || 0,
        transactionReference,
        transactionType: "Credit",
        transactionStatus: "Successful",
        transactionDescription,
      });

      let walletCreditPayload = {
        walletId: walletId,
        recipientId: eachWallet.recipientWalletId,
        amount: eachWallet.amount,
        ownersBalance: ownersBalance,
        recipientBalance: recipientBalance,
      };

      let wallletCreditSqs = {
        MessageBody: JSON.stringify(walletCreditPayload),
        QueueUrl:
          eachWallet.recipientType == "business"
            ? businessWalletCreditQueue
            : staffWalletCreditQueue,
      };
      let sendSqsMessage = sqs.sendMessage(wallletCreditSqs).promise();
    }

    // await wallet.save();
    // await recipientWallet.save();

    // transport object
    const mailOptionsForDebitAlert = {
      to: walletOwnerEmail,
      from: process.env.SENDER_EMAIL,
      subject: "Debit Alert",
      html: `<p>The amount of ${totalAmount} has been transferred from your wallet to multiple wallets with the details below</p>`,
    };

    await sendMailWithSendGrid(mailOptionsForDebitAlert);

    return res.status(200).send({
      statusCode: 200,
      message: "Transfer Successful",
      data: { transactionsData: transactionDetails },
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
