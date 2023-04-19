// const { Sequelize, DataTypes } = require("sequelize");
// const nodemailer = require("nodemailer");
// const config = require("./config");
// const User = require("./models/User")(sequelize, DataTypes);

// // Initialize Sequelize
// const env = process.env.NODE_ENV || "development";
// const sequelize = new Sequelize(config[env]);

// // Test the database connection
// sequelize
//   .authenticate()
//   .then(() => console.log("Database connected"))
//   .catch((err) => console.error("Unable to connect to the database:", err));

// // Create a nodemailer transport
// const transport = nodemailer.createTransport({
//   host: process.env.MAIL_HOST,
//   port: process.env.MAIL_PORT,
//   auth: {
//     user: process.env.MAIL_USER,
//     pass: process.env.MAIL_PASS,
//   },
// });

// // Define a function to send emails
// async function sendEmail(to, subject, text) {
//   try {
//     await transport.sendMail({
//       from: process.env.MAIL_USER,
//       to,
//       subject,
//       text,
//     });

//     console.log(`Email sent to ${to}`);
//   } catch (err) {
//     console.error(`Error sending email to ${to}:`, err);
//   }
// }

// const crypto = require("crypto");
// const nodemailer = require("nodemailer");
// const { validationResult } = require("express-validator");
// const jwt = require("jsonwebtoken");
// const { USER } = require("../models");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "your_email@gmail.com",
//     pass: "your_password",
//   },
// });

// const sendResetPasswordEmail = async (email, token) => {
//   const resetUrl = `http://localhost:3000/reset-password?token=${token}&email=${email}`;

//   const mailOptions = {
//     from: "your_email@gmail.com",
//     to: email,
//     subject: "Reset your password",
//     html: `
//       <p>Hi,</p>
//       <p>We received a request to reset your password. Please click the link below to reset your password:</p>
//       <a href="${resetUrl}">Reset password</a>
//       <p>If you did not request a password reset, please ignore this email.</p>
//     `,
//   };

//   await transporter.sendMail(mailOptions);
// };

// const userForgetPassword = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     let problem = {};
//     const err_data = errors.array();

//     err_data.forEach((e) => {
//       problem[e.param] = e.msg;
//     });
//     if (!errors.isEmpty()) {
//       return res.status(422).json({
//         status: 422,
//         message: problem,
//       });
//     }
//     console.log(req.body);
//     const { email } = req.body;
//     const user = await USER.findOne({
//       where: { email },
//     });

//     if (user) {
//       const token = crypto.randomBytes(20).toString("hex");

//       await USER.update({ token }, { where: { user_id: user.user_id } });

//       await sendResetPasswordEmail(email, token);

//       res.status(200).json({ status: 200, message: "check your email" });
//     } else {
//       res.status(400).json({ status: 400, message: "email not found" });
//     }
//   } catch (err) {
//     console.log(err.message);
//     res.status(500).json({ status: 500, message: "something went wrong" });
//   }
// };

// // const send = async (user, token) => {
// //   try {
// //     const transporter = nodeMailer.createTransport({
// //       host: "smtp.gmail.com",
// //       port: 587,
// //       secure: false,
// //       requireTLS: true, // use SSL

// //       auth: {
// //         user: process.env.USER1,
// //         pass: process.env.PASSWORD,
// //       },
// //     });

// // const link = `http://172.16.16.182:3333/user/Reset-password?${token}`;
// // console.log(link);
// //     const mailoptions = {
// //       from: process.env.USER1,
// //       to: process.env.USER2,
// //       subject: "for Reset password",
// //       text: link,
// //       // mailtrap
// //     };
// //     transporter.sendMail(mailoptions, (err, info) => {
// //       if (err) {
// //         console.log(err.message);
// //       } else {
// //         console.log("mail has been sent:", info.response);
// //       }
// //     });
// //   } catch (err) {
// //     console.log({ message: "email not sent" });
// //   }
// // };

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "youremail@gmail.com",
    pass: "yourpassword",
  },
});

function sendOTP(email, otp) {
  const mailOptions = {
    from: "youremail@gmail.com",
    to: email,
    subject: "Forgot Password OTP",
    // text: Your OTP is ${otp}.,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
  const resetTokenExpiration = new Date(Date.now() + 3600000); // One hour from now

  user.otp = otp;
  user.resetToken = resetToken;
  user.resetTokenExpiration = resetTokenExpiration;
  await user.save();

  sendOTP(email, otp);

  res.json({ message: "OTP sent." });
});
app.post("/reset-password", async (req, res) => {
  const { email, otp, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  if (user.otp !== otp) {
    return res.status(400).json({ error: "Invalid OTP." });
  }

  user.password = password;
  user.otp = null;
  await user.save();

  res.json({ message: "Password reset." });
});

const jwt = require("jsonwebtoken");

app.post("/reset-password", async (req, res) => {
  const { token, email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  try {
    const decoded = jwt.verify(token, "your_secret_key");
    if (decoded.otp !== req.query.otp) {
      return res.status(400).json({ error: "Invalid OTP." });
    }

    user.password = password;
    user.otp = null;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();

    res.json({ message: "Password reset successful." });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Invalid token." });
  }
});
