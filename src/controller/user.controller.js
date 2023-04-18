const { Op, where } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodeMailer = require("nodemailer");

const USER = require("../model/user.models");
const { validationResult } = require("express-validator");
const { filepath } = require("../util/path");
const fs = require("fs");

require("dotenv").config();

const msg = require("../util/message.json");
const { createCSV } = require("../util/csv");
// ----------------------------------export csv file--------------------------
const exportCSV = async (req, res, next) => {
  try {
    const data = await AGENT.findAll();
    const toCreateCSV = data.map((e) => {
      return e.dataValues;
    });
    const filename = "agent";
    await createCSV(toCreateCSV, filename);
    res.status(200).json({
      status: 200,
      message: msg.createdCSV,
      data: process.env.url + "/csv/agent.csv",
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};

// ---------------------------send mail------------
const send = async (user, token) => {
  try {
    const transporter = nodeMailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true, // use SSL

      auth: {
        user: process.env.USER1,
        pass: process.env.PASSWORD,
      },
    });

    const link = `http://172.16.16.182:3333/user/Reset-password?${token}`;
    console.log(link);
    const mailoptions = {
      from: process.env.USER1,
      to: process.env.USER2,
      subject: "for Reset password",
      text: link,
    };
    transporter.sendMail(mailoptions, (err, info) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log("mail has been sent:", info.response);
      }
    });
  } catch (err) {
    console.log({ message: "email not sent" });
  }
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
    const user_id = req.params.id;
    const getUserDataById = await USER.findOne({
      where: { user_id: user_id },
    });
    if (!getUserDataById)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });
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
      const agentdata = await USER.findAll({
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

      if (agentdata == "") {
        return res.status(200).json({ status: 200, message: msg.dataNotFound });
      } else {
        return res.status(200).json({
          status: 200,
          message: msg.readMessage,
          data: agentdata,
          pagination: {
            total: count,
            items_per_page: agentdata.length,
            page: +page_no,
            last_page: Math.ceil(count / limit),
          },
        });
      }
    } else {
      const { count } = await USER.findAndCountAll();
      // let pagination;
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

    if (!req.files) {
      return res
        .status(400)
        .json({ status: 400, message: "You need to choose a file" });
    }
    console.log(req.files);
    const file = req.files.image_profile;
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
    console.log(req.body.timezone_id);
    const file_name = new Date().toISOString() + "-" + file.name;
    const path = filepath + file_name;
    await file.mv(path);
    const hashpassword = await bcrypt.hash(req.body.password, 12);

    const createUserData = new USER({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      date_of_birth: req.body.date_of_birth,
      mobile_no: req.body.mobile_no,
      gender: req.body.gender,
      address: req.body.address,
      status: req.body.status,
      email: req.body.email,
      username: req.body.username,
      password: hashpassword,
      role_id: req.body.role_id,
      image_profile: file_name,
      permission_list: req.body.permission_list,
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

    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
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
    return res.status(400).json({ status: 400, message: "email is not found" });
  //   password check
  const validpass = await bcrypt.compare(req.body.password, users.password);
  if (!validpass)
    return res.status(400).json({ status: 400, message: "invalid password" });

  // ------------------------------ USER create token--------------------------------------

  const token = jwt.sign(
    { id: users.user_id, email: users.email },
    process.env.SECRET_TOKEN,
    {
      expiresIn: "4h",
    }
  );
  console.log(process.env.SECRET_TOKEN);
  //   token save in database
  const data = await USER.update(
    { token: token },
    { where: { user_id: users.user_id } }
  );
  res
    .header("user-token", token)
    .json({ status: 200, message: "login successfully", token: token });
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
    const user_id = req.params.id;
    const checkid = await USER.findOne({
      where: { user_id: user_id },
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
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          date_of_birth: req.body.date_of_birth,
          mobile_no: req.body.mobile_no,
          gender: req.body.gender,
          address: req.body.address,
          status: req.body.status,

          username: req.body.username,
          role_id: req.body.role_id,
          permission_list: req.body.permission_list,
          timezone: req.body.timezone,
        },
        {
          where: { user_id: user_id },
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
      console.log(req.files);
      const file = req.files.image_profile;
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
      console.log(req.body.timezone_id);
      const file_name = new Date().toISOString() + "-" + file.name;
      const path = filepath + file_name;
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
          image_profile: file_name,
          permission_list: req.body.permission_list,
          timezone: req.body.timezone,
        },
        {
          where: { user_id: user_id },
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
    const user_id = req.params.id;
    const checkid = await USER.findOne({
      where: { user_id: user_id },
    });
    if (!checkid)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });
    console.log(checkid.dataValues.image_profile);
    const path = filepath;
    fs.unlink(path + checkid.dataValues.image_profile, (err) => {
      if (err) console.log("object", err);
    });
    // return false;
    const deleteUserData = await USER.destroy({
      where: { user_id: user_id },
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
// --------------------USER FORGET PASSWORD--------------------
const userforgetpassword = async (req, res) => {
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
    // console.log(user);
    if (user) {
      const token = jwt.sign(
        { user_id: user.user_id, email: user.email },
        process.env.PASS
      );

      const data = await USER.update(
        { token: token },
        { where: { user_id: user.user_id } }
      );

      await send(user.email, token);
      res.status(200).json({ status: 200, message: "check your email" });
    } else {
      res.status(400).json({ status: 400, message: "email not found" });
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
    const tokendata = await USER.findOne({ where: { token: token } });
    if (tokendata) {
      const password = req.body.password;
      const newpassword = await bcrypt.hash(password, 12);
      const usernewdata = await USER.update(
        { password: newpassword, token: null },
        { where: { user_id: tokendata.user_id }, returning: true }
      );
      console.log(usernewdata, "usernewdata");
      res.status(200).json({
        status: 200,
        message: " password reset succesfully",
        data: usernewdata,
      });
    } else {
      res.status(400).json({ status: 400, message: "link is expired" });
    }
  } catch (err) {
    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
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
  userforgetpassword,
};
