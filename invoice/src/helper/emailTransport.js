const nodemailer = require("nodemailer");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_KEY);

const sendEmail = async (mailOptions) => {
  /**
   * Sends email with Nodemailer
   */
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const info = await transporter.sendMail(mailOptions);
  console.log(`Mail sent to ${info.accepted}`);
};

const sendMailWithSendGrid = async (mailOptions) => {
  await sgMail.send(mailOptions);
  console.log(`Mail sent to ${mailOptions.to}`);
};

module.exports = { sendEmail, sendMailWithSendGrid };

//SEND EMAIL WITH MAIL TRAP
exports.sendWithMailTrap = async (options) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "70c14ac8a8aa04",
        pass: "378dfb72c77225",
      },
    });
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
        console.log("mail sent");
      }
    });
  } catch (error) {
    console.log(error);
  }
};
