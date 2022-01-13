const AWS = require("aws-sdk");
const db = require("../models/index");
const { validateWalletCreditData } = require("../helper/validateWallet");

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
    const { recipientWalletId, amount, recipientType } = req.body;
    const wallet = await db.wallet.findOne({ where: { walletId: walletId } });

    if (!wallet) {
      throw new Error("wallet cannot be found");
    }

    const recipientWallet = await db.wallet.findOne({
      where: { walletId: recipientWalletId },
    });

    if (!recipientWallet) {
      throw new Error("recipient wallet cannot be found");
    }

    if (wallet.dataValues.balance < amount) {
      throw new Error("You don't have enough amount to make this transfer");
    }

    wallet.dataValues.balance -= amount;
    let ownersBalance = wallet.dataValues.balance;
    recipientWallet.dataValues.balance += amount;
    let recipientBalance = recipientWallet.dataValues.balance;

    // let transaction = await db.transaction.create({
    //   creditType: "wallet",
    //   ownersWalletId: walletId,
    //   recipientWalletId: recipientWalletId,
    //   amount,
    //   ownersWalletBalance: ownersBalance,
    //   recipientWalletBalance: recipientBalance,
    // });

    Promise.all([
      db.transaction.create({
        creditType: "wallet",
        ownersWalletId: walletId,
        recipientWalletId: recipientWalletId,
        amount,
        ownersWalletBalance: ownersBalance,
        recipientWalletBalance: recipientBalance,
      }),
      wallet.save(),
      recipientWallet.save(),
    ]).then(() => {
      let walletCreditPayload = {
        walletId: walletId,
        recipientId: recipientId,
        amount: amount,
        ownersBalance: ownersBalance,
        recipientBalance: recipientBalance,
      };

      let wallletCreditSqs = {
        MessageBody: JSON.stringify(walletCreditPayload),
        //MessageDeduplicationId: "test",
        //MessageGroupId: "testing",
        QueueUrl:
          recipientType == "business"
            ? businessWalletCreditQueue
            : staffWalletCreditQueue,
      };
      let sendSqsMessage = sqs.sendMessage(wallletCreditSqs).promise();

      return res.status(200).send({
        statusCode: 200,
        message: "Recipient wallet successfully credited",
        data: { wallet },
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
