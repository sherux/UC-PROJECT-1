const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const SUPERVISOR = require("../model/supervisor.model");
const msg = require("../util/message.json");
require("dotenv").config();
const moment = require("moment");
const { csvurl } = require("../util/path");

const { createCSV, changeTime, changeTimeFormat } = require("../util/csv");

// ----------------------csv file export----------------
const exportCSV = async (req, res, next) => {
  try {
    const data = await SUPERVISOR.findAll();
    const toCreateCSV = data.map((e) => {
      return e.dataValues;
    });
    const filename =
      moment(new Date()).format("YYYY-MM-DD HH:mm:ss") + "_supervisor";
    await createCSV(toCreateCSV, filename);
    res.status(200).json({
      status: 200,
      message: msg.createdCSV,
      data: csvurl + "/supervisor.csv",
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};

// -------------------------GET AGENT DATA BY ID-----------------------------------

const getSupervisorDataById = async (req, res) => {
  try {
    const supervisorId = req.params.id;
    const SupervisorALlDataByID = await SUPERVISOR.findOne({
      where: { supervisor_id: supervisorId },
    });
    if (!SupervisorALlDataByID)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });
    SupervisorALlDataByID.dataValues.createdAt = changeTimeFormat(
      SupervisorALlDataByID.dataValues.createdAt
    );
    SupervisorALlDataByID.dataValues.updatedAt = changeTimeFormat(
      SupervisorALlDataByID.dataValues.updatedAt
    );
    return res.status(200).json({
      status: 200,
      message: msg.readIdMessage,
      data: SupervisorALlDataByID,
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};

// ----------------------SEARCH QUERY AND GET ALL AGENT DATA-------------------------
const getSerachData = async (req, res) => {
  try {
    let { limit, page_no } = req.query;
    if (!limit) limit = 8;
    if (!page_no) page_no = 0;
    // const fieldvalue = req.query.fieldvalue;

    const alldata = await SUPERVISOR.findAll({
      offset: page_no * limit,
      limit: +limit,
    });
    if (
      req.body.first_name ||
      req.body.last_name ||
      req.body.email ||
      req.body.username
    ) {
      const { count } = await SUPERVISOR.findAndCountAll({
        // order: [[column_name, "DESC"]],
        where: {
          [Op.or]: [
            { first_name: { [Op.like]: `%${req.body.first_name}%` } },
            { last_name: { [Op.like]: `%${req.body.last_name}%` } },
            { email: { [Op.like]: `%${req.body.email}%` } },
            { username: { [Op.like]: `%${req.body.username}%` } },
          ],
        },
      });
      const supervisordata = await SUPERVISOR.findAll({
        offset: page_no * limit,
        limit: +limit,
        where: {
          [Op.or]: [
            { first_name: { [Op.like]: `%${req.body.first_name}%` } },
            { last_name: { [Op.like]: `%${req.body.last_name}%` } },
            { email: { [Op.like]: `%${req.body.email}%` } },
            { username: { [Op.like]: `%${req.body.username}%` } },
          ],
        },
      });

      if (supervisordata == "") {
        return res.status(200).json({ status: 200, message: msg.dataNotFound });
      } else {
        await changeTime(supervisordata);
        return res.status(200).json({
          status: 200,
          message: msg.readMessage,
          data: supervisordata,
          pagination: {
            total: count,
            items_per_page: supervisordata.length,
            page: +page_no,
            last_page: Math.ceil(count / limit),
          },
        });
      }
    } else {
      const { count } = await SUPERVISOR.findAndCountAll();
      await changeTime(supervisordata);

      return res.status(200).json({
        status: 200,
        message: msg.insertedMessage,
        totaldata: alldata.length,
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

// -------------------------CREATE AGENT DATA-----------------------------------

const createSupervisorData = async (req, res) => {
  try {
    const emailexist = await SUPERVISOR.findOne({
      where: { email: req.body.email },
    });
    if (emailexist)
      return res
        .status(400)
        .json({ status: 400, message: "email already exists" });
    const usernamexist = await SUPERVISOR.findOne({
      where: { username: req.body.username },
    });
    if (usernamexist)
      return res
        .status(400)
        .json({ status: 400, message: "username already exists" });

    const hashpassword = await bcrypt.hash(req.body.password, 12);

    const createdSupervisorData = new SUPERVISOR({
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      chat_integration: req.body.chatIntegration,
      email: req.body.email,
      username: req.body.username,
      password: hashpassword,
      timezone_id: req.body.timezoneId,
      status: req.body.status,
      extension: req.body.extension,
    });
    const supervisordata = await createdSupervisorData.save();
    res.status(200).json({
      status: 200,
      message: msg.insertedMessage,
      data: supervisordata,
    });
  } catch (error) {
    console.log("Error in posting data", error);

    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};
// -------------------------UPDATE AGENT DATA-----------------------------------

const updateSupervisorData = async (req, res) => {
  try {
    const hashpassword = await bcrypt.hash(req.body.password, 12);

    const supervisorId = req.params.id;
    const checkid = await SUPERVISOR.findOne({
      where: { supervisor_id: supervisorId },
    });
    if (!checkid)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });

    const updateSupervisordata = await SUPERVISOR.update(
      {
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        chat_integration: req.body.chatIntegration,
        email: req.body.email,
        username: req.body.username,
        password: hashpassword,
        timezone_id: req.body.timezoneId,
        status: req.body.status,
        extension: req.body.extension,
      },
      {
        where: { supervisor_id: supervisorId },
      }
    );
    res.status(200).json({
      status: 200,
      message: msg.updatedMessage,
      data: updateSupervisordata,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};
// -------------------------DELETE AGENT DATA-----------------------------------

const deleteSupervisorData = async (req, res) => {
  try {
    const supervisorId = req.params.id;
    const checkid = await SUPERVISOR.findOne({
      where: { supervisor_id: supervisorId },
    });
    if (!checkid)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });
    const deletedSupervisorData = await SUPERVISOR.destroy({
      where: { supervisor_id: supervisorId },
    });
    res.status(200).json({
      status: 200,
      message: msg.deletedMessage,
      data: deletedSupervisorData,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};

module.exports = {
  exportCSV,
  getSupervisorDataById,
  getSerachData,
  createSupervisorData,
  updateSupervisorData,
  deleteSupervisorData,
};
