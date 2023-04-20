const nodeMailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

const transport = nodeMailer.createTransport(
  smtpTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.maitrap_username,
      pass: process.env.maitrap_password,
    },
  })
);

const sendResetPasswordEmail = async (email, token, otp) => {
  const resetUrl = `${process.env.BASEURL}user/reset-password?token=${token}&email=${email}`;
  // const sendOTP = async((email, otp) => {
  const mailOptions = {
    from: process.env.USER1,
    to: process.env.USER2,
    subject: "Reset your password",
    html: `
      <p>Hi,</p>
      <p>We received a request to reset your password. Please click the link below to reset your password:</p>
      <a href="${resetUrl}" and>Reset password</a></BR>
  
      <p>OTP  IS ${otp}</P> 
  
      <p>If you did not request a password reset, please ignore this email.</p>
      `,
  };
  console.log(mailOptions);
  await transport.sendMail(mailOptions);
  // });
};

module.exports = { sendResetPasswordEmail };
