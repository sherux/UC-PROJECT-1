const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const AGENT = require("../model/agent.model");
require("dotenv").config();
const moment = require("moment");
const msg = require("../util/message.json");
const { createCSV, changeTime, changeTimeFormat } = require("../util/csv");
// ----------------------------------export csv file--------------------------
const exportCSV = async (req, res, next) => {
  try {
    const data = await AGENT.findAll();
    const toCreateCSV = data.map((e) => {
      return e.dataValues;
    });
    const filename =
      moment(new Date()).format("YYYY-MM-DD HH:mm:ss") + "_agent";
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
// -------------------------GET AGENT DATA BY ID-----------------------------------

const getAgentDataById = async (req, res) => {
  try {
    const agentId = req.params.id;
    const AgentALlDataByID = await AGENT.findOne({
      where: { agent_id: agentId },
    });
    if (!AgentALlDataByID)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });
    AgentALlDataByID.dataValues.createdAt = changeTimeFormat(
      AgentALlDataByID.dataValues.createdAt
    );
    AgentALlDataByID.dataValues.updatedAt = changeTimeFormat(
      AgentALlDataByID.dataValues.updatedAt
    );
    return res.status(200).json({
      status: 200,
      message: msg.readIdMessage,
      data: AgentALlDataByID,
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};

// ----------------------SEARCH QUERY AND GET ALL AGENT DATA-------------------------
const getSerachData = async (req, res) => {
  try {
    let { limit = 10, page_no = 1 } = req.query;
    const fieldvalue = req.query.fieldvalue;

    const alldata = await AGENT.findAll({
      offset: page_no * limit,
      limit: +limit,
    });
    if (fieldvalue) {
      const { count } = await AGENT.findAndCountAll({
        // order: [[column_name, "DESC"]],
        where: {
          [Op.or]: [
            { first_name: { [Op.like]: `%${fieldvalue}%` } },
            { last_name: { [Op.like]: `%${fieldvalue}%` } },
            { email: { [Op.like]: `%${fieldvalue}%` } },
            { username: { [Op.like]: `%${fieldvalue}%` } },
          ],
        },
      });
      const agentdata = await AGENT.findAll({
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
        await changeTime(agentdata);
        return res.status(200).json({
          status: 200,
          message: msg.readMessage,
          // totaldata: agentdata.length,
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
      const { count } = await AGENT.findAndCountAll();
      await changeTime(alldata);
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

// -------------------------CREATE AGENT DATA-----------------------------------

const createAgentData = async (req, res) => {
  try {
    const emailexist = await AGENT.findOne({
      where: { email: req.body.email },
    });
    if (emailexist)
      return res
        .status(400)
        .json({ status: 400, message: "email already exists" });
    const usernamexist = await AGENT.findOne({
      where: { username: req.body.username },
    });
    if (usernamexist)
      return res
        .status(400)
        .json({ status: 400, message: "username already exists" });

    const hashpassword = await bcrypt.hash(req.body.password, 12);

    const createdAgentData = new AGENT({
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
    const agentdata = await createdAgentData.save();
    res.status(200).json({
      status: 200,
      message: msg.insertedMessage,
      data: agentdata,
    });
  } catch (error) {
    console.log("Error in posting data", error);

    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};
// -------------------------UPDATE AGENT DATA-----------------------------------

const updateAgentData = async (req, res) => {
  try {
    const hashpassword = await bcrypt.hash(req.body.password, 12);

    const agentId = req.params.id;
    const checkid = await AGENT.findOne({
      where: { agent_id: agentId },
    });
    if (!checkid)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });

    const updateAgentdata = await AGENT.update(
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
        where: { agent_id: agentId },
      }
    );
    res.status(200).json({
      status: 200,
      message: msg.updatedMessage,
      data: updateAgentdata,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};
// -------------------------DELETE AGENT DATA-----------------------------------

const deleteAgentData = async (req, res) => {
  try {
    const agentId = req.params.id;
    const checkid = await AGENT.findOne({
      where: { agent_id: agentId },
    });
    if (!checkid)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });
    const deletedAgentData = await AGENT.destroy({
      where: { agent_id: agentId },
    });
    res.status(200).json({
      status: 200,
      message: msg.deletedMessage,
      data: deletedAgentData,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};

module.exports = {
  exportCSV,
  getAgentDataById,
  getSerachData,
  createAgentData,
  updateAgentData,
  deleteAgentData,
};
