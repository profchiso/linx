const AWS = require('aws-sdk');
const db = require("../models/index")
const { validate } = require("../helper/validateWallet");

AWS.config.update({ region: 'us-east-1' });
AWS.config.update({ accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY });



module.exports = async(req, res) => {
    // wallet validation
    const { error } = validate(req.body);
    if (error) {
        res.status(400);
        throw new Error(error.message);
    }

    let createdSecondaryWallet = await db.wallet.create({
      walletId: Number(Date.now().toString().substring(0, 10)),
      name: req.body.name,
      ownerId: req.user.id,
      alias: req.body.alias,
      walletType: req.body.walletType
  })
  console.log("createdSecondaryWallet", createdSecondaryWallet)


const sns = new AWS.SNS({apiVersion: "2010-03-31"});
const params = {
  "Message": JSON.stringify(createdSecondaryWallet),
  "TopicArn": "arn:aws:sns:us-east-1:322544062396:SecondaryWalletTopic"
};

// Promise implementation
let snsCreatedWallet = await sns.publish(params).promise()
    
}