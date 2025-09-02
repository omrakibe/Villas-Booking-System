const nodemailer = require("nodemailer");

async function sendEmail(to, subject, text) {
  const transporter = nodemailer.createTransport({
    service: "gmail",  // Or SMTP service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"GreatPark" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
}

module.exports = sendEmail;
