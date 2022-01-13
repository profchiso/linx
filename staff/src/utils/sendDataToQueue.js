const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
AWS.config.update({ accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY });
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

exports.sendDataToAWSQueue = async(data, queueURL) => {

    try {
        let queuePayload = {
            MessageBody: JSON.stringify(data),
            QueueUrl: queueURL
        };
        let sendSqsMessage = await sqs.sendMessage(queuePayload).promise()
        return sendSqsMessage

    } catch (error) {
        console.log(error)

    }
}

exports.getWalletUpdatedDataAndProcess = async(data, collection, entityId) => {



}