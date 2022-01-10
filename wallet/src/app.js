const express = require("express")
const cronJob = require("node-cron")

const cors = require("cors")

require('express-async-errors');

const cookieSession = require('cookie-session');
const { errorHandler, NotFoundError } = require('@bc_tickets/common');
const db = require("../src/models/index")
const AWS = require('aws-sdk');
// Configure the region 
AWS.config.update({ region: 'us-east-1' });
// AWS.config.update({ accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY });


// Create an SQS service object
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
//const queueUrl = "https://sqs.us-east-1.amazonaws.com/322544062396/linxqueue";
const businessCreationQueueUrl = "https://sqs.us-east-1.amazonaws.com/322544062396/business-creation-queue";
const staffCreationQueueUrl = "https://sqs.us-east-1.amazonaws.com/322544062396/staff-creation-queue";
const businessPrimaryWalletQueueUrl = "https://sqs.us-east-1.amazonaws.com/322544062396/business-primary-wallet-creation-queue1";
const staffPrimaryWalletQueueUrl = "https://sqs.us-east-1.amazonaws.com/322544062396/staff-primary-wallet-creation-queue";
let params = {
    QueueUrl: businessCreationQueueUrl
};




const walletRouter = require('./routes/wallet');
const { JSON } = require("sequelize/types");

const app = express();
app.set('trust proxy', true);
app.use(express.json());
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV != 'test',
    })
);

app.get("/", (req, res) => {
    res.send("welcome to wallet")
})
app.use(walletRouter);

app.all('*', async() => {
    throw new NotFoundError();
});

app.use(errorHandler);

cronJob.schedule("*/5 * * * *", () => {
    sqs.receiveMessage(params, async function(err, data) {
        if (err) throw new Error(err.message)

        let parsedData = JSON.parse(data.Messages[0].Body)


        let checkOwnerId = Number(parsedData.businessId)


        let createdPromoWallet = await db.wallet.create({
            walletId: Number(Date.now().toString().substring(0, 10)),
            name: parsedMessage.name || "Testing",
            ownerId: checkOwnerId,
            alias: parsedMessage.alias,
            credit: 0,
            debit: 0,
            balance: 0,
            walletType: "Promo"
        })

        let createdPrimaryWallet = await db.wallet.create({
            walletId: Number(Date.now().toString().substring(0, 10)),
            name: parsedMessage.name || "Testing",
            ownerId: checkOwnerId,
            alias: parsedMessage.alias,
            credit: 0,
            debit: 0,
            balance: 0,
            walletType: "Primary"
        })

        if (createdWallet.dataValues.type == 'business') {

            let testingPayload = {
                businessId: `${createdWallet.dataValues.ownerId}`,
                userId: "2",
                alias: `${createdWallet.dataValues.alias}`
            }

            let sqsWalletData = {
                MessageAttributes: {
                    "wallet": {
                        DataType: "String",
                        StringValue: "Wallet created"
                    }
                },
                QueueUrl: businessPrimaryWalletQueueUrl,
                MessageBody: JSON.stringify(testingPayload),
            };
            let sqsWallet = await sqs.sendMessage(sqsWalletData).promise()
            console.log("sqsWallet", sqsWallet)

        }

        if (createdWallet.dataValues.type == 'staff') {

            let testingPayload = {
                staffId: `${createdWallet.dataValues.ownerId}`,
                userId: "2",
                alias: `${createdWallet.dataValues.alias}`
            }

            let sqsWalletData = {
                MessageAttributes: {
                    "wallet": {
                        DataType: "String",
                        StringValue: "Wallet created"
                    }
                },
                QueueUrl: staffPrimaryWalletQueueUrl,
                MessageBody: JSON.stringify(testingPayload),
            };
            let sqsWallet = await sqs.sendMessage(sqsWalletData).promise()
            console.log("sqsWallet", sqsWallet)
        }
    });

})


module.exports = { app };