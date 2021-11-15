const sgMail = require("@sendgrid/mail");
const nodemailer = require('nodemailer');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendMailWithSendgrid = async(mailOptions) => {
    try {
        await sgMail.send(mailOptions);
        console.log("mail sent");
    } catch (error) {
        console.log(error);
        console.log(JSON.stringify(error));
    }
};

exports.sendWithMailTrap = async(options) => {
    try {
        let transporter = nodemailer.createTransport({
                host: "smtp.mailtrap.io",
                port: 2525,
                auth: {
                    user: "70c14ac8a8aa04",
                    pass: "378dfb72c77225"
                }
            })
            //);
        const mailOptions = {
            from: options.from,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
            // attachments: options.attachments,
        };
        transporter.sendMail(mailOptions, (err, resp) => {
            if (err) {
                console.log(err);
            } else {
                console.log('mail sent');
            }
        });
    } catch (error) {
        console.log(error);
    }


}


exports.sendEmailWithMailgun = async(options) => {
    try {
        const API_KEY = process.env.MAILGUN_KEY;
        const DOMAIN = process.env.MAILGUN_DOMAIN;
        var mailgun = require("mailgun-js")({
            apiKey: API_KEY,
            domain: DOMAIN,
            host: "api.eu.mailgun.net"
        });

        const mailOptions = {
            from: options.from,
            to: options.to,
            subject: options.subject,
            text: options.text,
            // html: options.html,
        };

        await mailgun.messages().send(mailOptions, (error, body) => {
            if (error) console.log("mail error", error);

            console.log("mail body", body);
        });
    } catch (error) {
        console.log("error from email sending", error);
    }
};