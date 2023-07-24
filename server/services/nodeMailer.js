const nodemailer = require('nodemailer');

const sendLinkViaEmail = async ({ sender, receiver, subject, text, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `SnapShare <${sender}>`,
      to: receiver,
      subject,
      text,
      html,
    });

    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error occurred while sending email', error);
    throw new Error('Failed to send email');
  }
};

module.exports = sendLinkViaEmail;
