const sgMail = require("@sendgrid/mail");
const nodemailer = require('nodemailer');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendMailWithSendgrid = async(mailOptions) => {
    try {
<<<<<<< HEAD
=======
        console.log(mailOptions);
>>>>>>> d88cd81ae259f6d65de4090733b246593f5b8ef8
        await sgMail.send(mailOptions);
        console.log("mail sent");
    } catch (error) {
        console.log(error);
        console.log(JSON.stringify(error));
    }
};

exports.sendWithMailTrap = async(options) => {
    try {
<<<<<<< HEAD
        let transporter = nodemailer.createTransport({
=======
        var transporter = nodemailer.createTransport({
>>>>>>> d88cd81ae259f6d65de4090733b246593f5b8ef8
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