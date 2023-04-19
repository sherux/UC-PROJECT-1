const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodeMailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

const USER = require("../models/user.models");
const { validationResult } = require("express-validator");
const { imagePath, imagurl, csvurl } = require("../util/path1");
const fs = require("fs");
const moment = require("moment");
require("dotenv").config();

const msg = require("../util/message.json");
const { createCSV, changeTime, changeTimeFormat } = require("../util/csv");

// ----------------------------------export csv file--------------------------
const exportCSV = async (req, res, next) => {
  try {
    const data = await USER.findAll();
    const toCreateCSV = data.map((e) => {
      return e.dataValues;
    });
    // console.log(process.env.url);
    const filename = moment(new Date()).format("YYYY-MM-DD HH:mm:ss") + "_user";

    await createCSV(toCreateCSV, filename);
    res.status(200).json({
      status: 200,
      message: msg.createdCSV,
      data: csvurl + "/user.csv",
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};

// ---------------------------send mail------------

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

// ------------------------authentication api-----------
const auth = (req, res) => {
  res
    .status(200)
    .json({ status: 200, message: "user authentication", users: req.users });
};
// -------------------------GET USER DATA BY ID-----------------------------------

const getUserDataById = async (req, res) => {
  try {
    const userId = req.params.id;
    const getUserDataById = await USER.findOne({
      where: { user_id: userId },
    });
    if (!getUserDataById)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });
    getUserDataById.dataValues.image_profile =
      imagurl + getUserDataById.dataValues.image_profile;

    getUserDataById.dataValues.createdAt = changeTimeFormat(
      getUserDataById.dataValues.createdAt
    );
    getUserDataById.dataValues.updatedAt = changeTimeFormat(
      getUserDataById.dataValues.updatedAt
    );

    return res.status(200).json({
      status: 200,
      message: msg.readIdMessage,
      data: getUserDataById,
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};

// ----------------------SEARCH QUERY AND GET ALL USER DATA-------------------------
const getUserDataListData = async (req, res) => {
  try {
    let { limit, page_no } = req.query;
    if (!limit) limit = 8;
    if (!page_no) page_no = 0;
    const fieldvalue = req.query.fieldvalue;
    const alldata = await USER.findAll({
      offset: page_no * limit,
      limit: +limit,
    });
    if (fieldvalue) {
      const { count } = await USER.findAndCountAll({
        order: [["user_id", "DESC"]],
        where: {
          [Op.or]: [
            { first_name: { [Op.like]: `%${fieldvalue}%` } },
            { last_name: { [Op.like]: `%${fieldvalue}%` } },
            { email: { [Op.like]: `%${fieldvalue}%` } },
            { username: { [Op.like]: `%${fieldvalue}%` } },
          ],
        },
      });
      const userdata = await USER.findAll({
        offset: page_no * limit,
        limit: +limit,

        where: {
          [Op.or]: [
            { first_name: { [Op.like]: `%${fieldvalue}%` } },
            { last_name: { [Op.like]: `%${fieldvalue}%` } },
            { email: { [Op.like]: `%${fieldvalue}%` } },
            { username: { [Op.like]: `%${fieldvalue}%` } },
          ],
        },
      });

      if (userdata == "") {
        return res.status(200).json({ status: 200, message: msg.dataNotFound });
      } else {
        await changeTime(userdata);
        await userdata.forEach((element) => {
          element.dataValues.image_profile =
            imagurl + element.dataValues.image_profile;
        });

        return res.status(200).json({
          status: 200,
          message: msg.readMessage,
          data: userdata,
          pagination: {
            total: count,
            items_per_page: userdata.length,
            page: +page_no,
            last_page: Math.ceil(count / limit),
          },
        });
      }
    } else {
      const { count } = await USER.findAndCountAll();

      await changeTime(alldata);
      await alldata.forEach((element) => {
        element.dataValues.image_profile =
          imagurl + element.dataValues.image_profile;
      });
      return res.status(200).json({
        status: 200,
        message: msg.readMessage,
        data: alldata,
        pagination: {
          total: count,
          items_per_page: alldata.length,
          page: +page_no,
          last_page: Math.ceil(count / limit),
        },
      });
    }
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({
      status: 500,
      message: msg.somethingWentWrong,
    });
  }
};

// -------------------------CREATE USER DATA-----------------------------------

const createUserData = async (req, res) => {
  const errors = validationResult(req);
  let problem = {};
  const err_data = errors.array();

  err_data.forEach((e) => {
    problem[e.param] = e.msg;
  });
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: 422,
      message: problem,
    });
  }
  try {
    const emailexist = await USER.findOne({
      where: { email: req.body.email },
    });
    if (emailexist)
      return res
        .status(400)
        .json({ status: 400, message: "email already exists" });
    const usernamexist = await USER.findOne({
      where: { username: req.body.username },
    });
    if (usernamexist)
      return res
        .status(400)
        .json({ status: 400, message: "username already exists" });
    const mobileNoexist = await USER.findOne({
      where: { mobile_no: req.body.mobileNo },
    });
    if (mobileNoexist)
      return res
        .status(400)
        .json({ status: 400, message: "mobileNo already exists" });
    if (!req.files) {
      return res
        .status(400)
        .json({ status: 400, message: "You need to choose a file" });
    }
    // console.log(req.files);
    const file = req.files.imageProfile;

    if (!file.name.match(/\.(png)$/)) {
      return res.status(400).json({
        status: 400,
        message: msg.filevalidationforuser,
      });
    }

    if (file.size > 2 * 1048576) {
      return res.status(413).json({
        status: 413,
        message: msg.fileSizeInvalid,
      });
    }

    const fileName = new Date().toISOString() + "-" + file.name;
    const path = imagePath + fileName;
    await file.mv(path);
    const hashpassword = await bcrypt.hash(req.body.password, 12);

    const createUserData = new USER({
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      date_of_birth: req.body.dateOfBirth,
      mobile_no: req.body.mobileNo,
      gender: req.body.gender,
      address: req.body.address,
      status: req.body.status,
      email: req.body.email,
      username: req.body.username,
      password: hashpassword,
      role_id: req.body.roleId,
      image_profile: fileName,
      permission_list: [],
      timezone: req.body.timezone,
    });
    const userdata = await createUserData.save();
    res.status(200).json({
      status: 200,
      message: msg.insertedMessage,
      data: userdata,
    });
  } catch (error) {
    console.log("Error in posting data", error);

    res.status(500).json({
      status: 500,
      message: msg.somethingWentWrong,
      data: error.message,
    });
  }
};

// --------------------------- USER LOGIN API-------------------
const userlogindata = async (req, res) => {
  //checking email exist or not
  const errors = validationResult(req);
  let problem = {};
  const err_data = errors.array();

  err_data.forEach((e) => {
    problem[e.param] = e.msg;
  });
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: 422,
      message: problem,
    });
  }
  const users = await USER.findOne({
    where: { email: req.body.email },
  });
  if (!users)
    return res.status(400).json({ status: 400, message: "Email is not found" });
  //   password check
  const validpass = await bcrypt.compare(req.body.password, users.password);
  if (!validpass)
    return res.status(400).json({ status: 400, message: "Invalid password" });

  // ------------------------------ USER create token--------------------------------------

  const token = jwt.sign(
    { id: users.user_id, email: users.email },
    process.env.SECRET_TOKEN,
    {
      expiresIn: "4h",
    }
  );

  const data = await USER.update(
    { token: token },
    { where: { user_id: users.user_id } }
  );
  const data2 = {
    first_name: users.first_name,
    last_name: users.last_name,
    email: users.email,
    image_profile: users.image_profile,
    token: token,
    permissionList: [],
  };
  res.header("user-token", token).json({
    status: 200,
    message: "login successfully",
    data: data2,
  });
};

// -------------------------UPDATE USER DATA-----------------------------------

const updateUserData = async (req, res) => {
  try {
    const errors = validationResult(req);
    let problem = {};
    const err_data = errors.array();

    err_data.forEach((e) => {
      problem[e.param] = e.msg;
    });
    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: 422,
        message: problem,
      });
    }
    const userId = req.params.id;
    const checkid = await USER.findOne({
      where: { user_id: userId },
    });
    if (!checkid)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });
    // -----------------------------without request file----------------
    if (!req.files) {
      const updateUserData = await USER.update(
        {
          first_name: req.body.firstName,
          last_name: req.body.lastName,
          date_of_birth: req.body.dateOfBirth,
          mobile_no: req.body.mobileNo,
          gender: req.body.gender,
          address: req.body.address,
          status: req.body.status,
          username: req.body.username,
          role_id: req.body.roleId,
          permission_list: [],
          timezone: req.body.timezone,
        },
        {
          where: { user_id: userId },
        }
      );
      res.status(200).json({
        status: 200,
        message: msg.updatedMessage,
        data: updateUserData,
      });
      // ------------with request file------------------------
    } else {
      if (!req.files) {
        return res
          .status(400)
          .json({ status: 400, message: "You need to choose a file" });
      }
      const file = req.files.imageProfile;
      if (!file.name.match(/\.(png)$/)) {
        return res.status(400).json({
          status: 400,
          message: msg.filevalidationforuser,
        });
      }
      if (file.size > 2 * 1048576) {
        return res.status(413).json({
          status: 413,
          message: msg.fileSizeInvalid,
        });
      }
      const fileName = new Date().toISOString() + "-" + file.name;
      const path = imagePath + fileName;
      await file.mv(path);
      const updateUserData = await USER.update(
        {
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          date_of_birth: req.body.date_of_birth,
          mobile_no: req.body.mobile_no,
          gender: req.body.gender,
          address: req.body.address,
          status: req.body.status,
          username: req.body.username,
          role_id: req.body.role_id,
          image_profile: fileName,
          permission_list: [],
          timezone: req.body.timezone,
        },
        {
          where: { user_id: userId },
        }
      );
      res.status(200).json({
        status: 200,
        message: msg.updatedMessage,
        data: updateUserData,
      });
    }
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      status: 500,
      message: msg.somethingWentWrong,
      data: error.message,
    });
  }
};
// -------------------------DELETE USER DATA-----------------------------------

const deleteUserData = async (req, res) => {
  try {
    const errors = validationResult(req);
    let problem = {};
    const err_data = errors.array();

    err_data.forEach((e) => {
      problem[e.param] = e.msg;
    });
    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: 422,
        message: problem,
      });
    }
    const userId = req.params.id;
    const checkid = await USER.findOne({
      where: { user_id: userId },
    });
    if (!checkid)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });
    const path = imagePath;
    fs.unlink(path + checkid.dataValues.image_profile, (err) => {
      if (err) console.log("object", err);
    });
    // return false;
    const deleteUserData = await USER.destroy({
      where: { user_id: userId },
    });
    res.status(200).json({
      status: 200,
      message: msg.deletedMessage,
      data: deleteUserData,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};
// ----------------------------Logout API--------------

const logout = async (req, res) => {
  try {
    const userId = req.users.id; // Assuming you have authenticated the user and have their id in req.user

    // Find the user by id and update their token to null
    const user = await USER.findOne({ where: { user_id: userId } });
    user.token = null;
    await user.save();

    res.status(200).send({ message: "User logged out successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error.", DATA: err.message });
  }
};

// --------------------USER FORGET PASSWORD--------------------
const forgetpassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    let problem = {};
    const err_data = errors.array();

    err_data.forEach((e) => {
      problem[e.param] = e.msg;
    });
    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: 422,
        message: problem,
      });
    }
    console.log(req.body);
    const user = await USER.findOne({
      where: { email: req.body.email },
    });
    if (user) {
      const token = jwt.sign(
        { id: user.user_id, email: user.email },
        process.env.SECRET_TOKEN,
        {
          expiresIn: "4h",
        }
      );
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      const data = await USER.update(
        { token: token },
        { where: { user_id: user.user_id } }
      );
      user.otp = otp; // add the OTP to the user object
      await user.save();
      console.log(otp);
      await sendResetPasswordEmail(user.email, token, otp);
      res.status(200).json({
        status: 200,
        message: "Link  and otp send in your register Email ",
      });
    } else {
      res.status(400).json({ status: 400, message: "Email not found" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};

// ----------------------------RESET-PASSWQRD API-------------------
const resetpassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    let problem = {};
    const err_data = errors.array();

    err_data.forEach((e) => {
      problem[e.param] = e.msg;
    });
    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: 422,
        message: problem,
      });
    }
    const token = req.query.token;
    const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
    console.log(decoded.id);
    const user = await USER.findOne({ where: { user_id: decoded.id } });
    console.log(user.otp);

    if (user.otp !== req.body.otp) {
      return res.status(400).json({ status: 400, message: "Invalid OTP." });
    }
    const tokendata = await USER.findOne({ where: { token: token } });

    // console.log(USER.otp);
    console.log(tokendata);
    if (tokendata) {
      const password = req.body.password;
      const confirmation_password = req.body.confirmation_password;
      if (password === confirmation_password) {
        const newpassword = await bcrypt.hash(password, 12);

        const usernewdata = await USER.update(
          { password: newpassword, token: null },
          { where: { user_id: tokendata.user_id }, returning: true }
        );
        user.otp = null;
        await user.save();
        res.status(200).json({
          status: 200,
          message: " password reset succesfully",
        });
      } else {
        res.status(400).json({
          status: 400,
          message: "password and confirmation_password does not match",
        });
      }
    } else {
      res.status(400).json({ status: 400, message: "link is expired" });
    }
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: msg.somethingWentWrong,
      data: err.message,
    });
  }
};

module.exports = {
  exportCSV,
  getUserDataById,
  getUserDataListData,
  createUserData,
  updateUserData,
  deleteUserData,
  userlogindata,
  auth,
  resetpassword,
  forgetpassword,
  logout,
};
