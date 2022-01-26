const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
AWS.config.update({ accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY });
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
const QUEUE_URL = process.env.STAFF_WALLETID_QUEUE_URL
const db = require("../models/index")
exports.getStaffWalletFromQueueAndUpdate = () => {
    let params = {
        QueueUrl: QUEUE_URL
    };

    try {
        // Business wallet creation
        sqs.receiveMessage(params, async function(err, data) {
            if (err) throw new Error(err.message);

            if (!data.Messages) {
                return;
            }

            if (data.Messages && data.Messages.length) {
                let messageBody = data.Messages;

                for (let message of messageBody) {
                    let parsedData = JSON.parse(message.Body);
                    console.log("passed data", parsedData)


                    const updatedStaffWallet = await db.staff.update({ walletId: parsedData.walletId }, { where: { id: parsedData.staffId }, returning: true, plain: true })
                    console.log("updated staff", updatedStaffWallet)

                    let deleteParams = {
                        QueueUrl: QUEUE_URL,
                        ReceiptHandle: data.Messages[0].ReceiptHandle,
                    };

                    sqs.deleteMessage(deleteParams, function(err, data) {
                        if (err) {
                            console.log("Delete Error", err);
                        } else {
                            console.log("Staff message Deleted", data);
                        }
                    });
                }
            }
        });
    } catch (error) {
        console.log(error);
    }

};