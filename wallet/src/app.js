const express = require("express")

const cors = require("cors")

require('express-async-errors');

const cookieSession = require('cookie-session');
const { errorHandler, NotFoundError } = require('@bc_tickets/common');
const db = require("../src/models/index")
const AWS = require('aws-sdk');
// Configure the region 
// AWS.config.update({ region: 'us-east-1' });
// AWS.config.update({ accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY });


// // Create an SQS service object
// const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
// const queueUrl = "https://sqs.us-east-1.amazonaws.com/322544062396/linxqueue";
// let params = {
//     QueueUrl: queueUrl
// };
// sqs.receiveMessage(params, async function(err, data) {
//     if (err) throw new Error(err.message) // an error occurred

//     if (data.Messages && data.Messages.length) {
//         let parsedMessageBody = data.Messages

//         console.log(parsedMessageBody)

//         for (let message of parsedMessageBody) {
//             console.log("alias", message.Body)

//             let parsedMessage = JSON.parse(message.Body)


//             let createdWallet = await db.wallet.create({
//                 walletId: Number(Date.now().toString().substring(0, 10)),
//                 name: parsedMessage.name || "Testing",
//                 businessId: Number(parsedMessage.businessId),
//                 userId: Number(parsedMessage.userId),
//                 alias: parsedMessage.alias,
//                 // credit: 0,
//                 // debit: 0,
//                 // balance: 0
//             })
//             console.log("createdWallet", createdWallet)


//             let testingPayload = {
//                 businessId: `${createdWallet.dataValues.ownerId}`,
//                 userId: "2",
//                 alias: `${createdWallet.dataValues.alias}`
//             }

//             let sqsWalletData = {
//                 MessageAttributes: {
//                     "wallet": {
//                         DataType: "String",
//                         StringValue: "Wallet created"
//                     }
//                 },
//                 QueueUrl: queueUrl,
//                 MessageBody: JSON.stringify(testingPayload),
//             };

//             let sqsWallet = await sqs.sendMessage(sqsWalletData).promise()
//             console.log("sqsWallet", sqsWallet)

//         }



//     }

// })

const walletRouter = require('./routes/wallet');

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

module.exports = { app };