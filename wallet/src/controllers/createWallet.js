const AWS = require('aws-sdk');
//const { Consumer } = require('sqs-consumer');
const db = require("../models/index")
const { validate } = require("../helper/validateWallet");
const wallet = require('../models/wallet');

// Configure the region 
AWS.config.update({region: 'us-east-1'});

// Create an SQS service object
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
const queueUrl = "https://sqs.us-east-1.amazonaws.com/322544062396/linxqueue";

module.exports = async (req, res) => {
    // wallet validation
  const { error } = validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.message);
  }


  let params = {
    QueueUrl: queueUrl
  };
  sqs.receiveMessage(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {
      db.Wallet.create({
        id: Date.now().toString().substring(0, 10),
        name,
        ownerId: message.userId,
        alias: message.alias,
        credit: 0,
        debit: 0,
        balance: 0    
    })
    }
  }
  .then((walletCreated) => {
        res.status(201).json({
          message: 'Wallet Created Successfully',
          walletCreated,
        });
      })
      .then((walletData) => {
        let sqsWalletData = {
          MessageAttributes: {
            "wallet": {
              DataType: "Object",
              StringValue: walletData.wallet
            }
          }
        };
      })
      .then((sendSqsMessage) => {
        sqs.sendMessage(sqsWalletData).promise(),
        sendSqsMessage.then((data) => {
          console.log(`WalletSvc | SUCCESS: ${data.MessageId}`);
          res.send("Wallet created successfully");
      })
      .catch(error => res.status(500).json({
            message: 'Unsuccessful',
            error: error.toString(),
          }))
  })
  )}