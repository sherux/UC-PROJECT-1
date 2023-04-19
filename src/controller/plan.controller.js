const { Op } = require("sequelize");
const PLAN = require("../model/plan.model");
const { validationResult } = require("express-validator");
const msg = require("../util/message.json");
require("dotenv").config();
const moment = require("moment");
const { createCSV, changeTime, changeTimeFormat } = require("../util/csv");

// -------------------------EXPORT CSV ----------------
const exportCSV = async (req, res, next) => {
  try {
    const data = await PLAN.findAll();
    const toCreateCSV = data.map((e) => {
      return e.dataValues;
    });
    const filename = moment(new Date()).format("YYYY-MM-DD HH:mm:ss") + "_plan";
    await createCSV(toCreateCSV, filename);
    res.status(200).json({
      status: 200,
      message: msg.createdCSV,
      data: process.env.url + "/csv/plan.csv",
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};

// -------------------------GET PLAN DATA BY ID-----------------------------------

const getPlanDataById = async (req, res) => {
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
    const planid = req.params.id;
    const planALlDataByID = await PLAN.findOne({
      where: { plan_id: planid },
    });
    if (!planALlDataByID)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });
    planALlDataByID.dataValues.createdAt = changeTimeFormat(
      planALlDataByID.dataValues.createdAt
    );
    planALlDataByID.dataValues.updatedAt = changeTimeFormat(
      planALlDataByID.dataValues.updatedAt
    );
    return res.status(200).json({
      status: 200,
      message: msg.readIdMessage,
      data: planALlDataByID,
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};

// ----------------------SEARCH QUERY AND GET ALL PLAN DATA-------------------------
const getSerachData = async (req, res) => {
  try {
    let { limit = 5, page_no = 1 } = req.query;

    const alldata = await PLAN.findAll({
      offset: page_no * limit,
      limit: +limit,
    });
    if (req.body.plan_name) {
      const { count } = await PLAN.findAndCountAll({
        where: {
          [Op.or]: [
            {
              plan_name: { [Op.like]: `%${req.body.planName}%` },
            },
          ],
        },
      });

      const plandata = await PLAN.findAll({
        offset: page_no * limit,
        limit: +limit,
        where: {
          [Op.or]: [{ plan_name: { [Op.like]: `%${req.body.planName}%` } }],
        },
      });

      if (plandata == "") {
        return res.status(200).json({ status: 200, message: msg.dataNotFound });
      } else {
        await changeTime(plandata);
        return res.status(200).json({
          status: 200,
          message: msg.readMessage,
          data: plandata,
          pagination: {
            total: count,
            items_per_page: plandata.length,
            page: +page_no,
            last_page: Math.ceil(count / limit),
          },
        });
      }
    } else {
      const { count } = await PLAN.findAndCountAll();
      await changeTime(alldata);

      return res.status(200).json({
        status: 200,
        message: msg.readMessage,
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

// -------------------------CREATE PLAN DATA-----------------------------------

const createPlanData = async (req, res) => {
  try {
    const errors = validationResult(req);
    let data = {};
    const err_data = errors.array();

    err_data.forEach((e) => {
      data[e.param] = e.msg;
    });
    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: 422,
        message: data,
      });
    }

    const createdPlanData = new PLAN({
      plan_name: req.body.planName,
      black_list: req.body.blackList,
      white_list: req.body.whiteList,
      universal_forward: req.body.universalForward,
      no_answer_forward: req.body.noAnswerForward,
      busy_forward: req.body.busyForward,
      time_based_forward: req.body.timeBasedForward,
      selective_forward: req.body.selectiveForward,
      shift_forward: req.body.shiftForward,
      unavailable_forward: req.body.unavailableForward,
      redial: req.body.redial,
      holiday: req.body.holiday,
      week_off: req.body.weekOff,
      barge_in: req.body.bargeIn,
      do_not_disturb: req.body.doNotDisturb,
      park: req.body.park,
      transfer: req.body.transfer,
      call_recording: req.body.callRecording,
      caller_id_block: req.body.callerIdBlock,
      call_return: req.body.callReturn,
      busy_callback: req.body.busyCallback,
    });
    const plandata = await createdPlanData.save();
    res.status(200).json({
      status: 200,
      message: msg.insertedMessage,
      data: plandata,
    });
  } catch (error) {
    console.log("Error in posting data", error);

    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};
// -------------------------UPDATE PLAN DATA-----------------------------------

const updatePlanData = async (req, res) => {
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

    const planid = req.params.id;
    const checkid = await PLAN.findOne({
      where: { plan_id: planid },
    });
    if (!checkid)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });

    const updatePlandata = await PLAN.update(
      {
        plan_name: req.body.planName,
        black_list: req.body.blackList,
        white_list: req.body.whiteList,
        universal_forward: req.body.universalForward,
        no_answer_forward: req.body.noAnswerForward,
        busy_forward: req.body.busyForward,
        time_based_forward: req.body.timeBasedForward,
        selective_forward: req.body.selectiveForward,
        shift_forward: req.body.shiftForward,
        unavailable_forward: req.body.unavailableForward,
        redial: req.body.redial,
        holiday: req.body.holiday,
        week_off: req.body.weekOff,
        barge_in: req.body.bargeIn,
        do_not_disturb: req.body.doNotDisturb,
        park: req.body.park,
        transfer: req.body.transfer,
        call_recording: req.body.callRecording,
        caller_id_block: req.body.callerIdBlock,
        call_return: req.body.callReturn,
        busy_callback: req.body.busyCallback,
      },
      {
        where: { plan_id: planid },
      }
    );
    res.status(200).json({
      status: 200,
      message: msg.updatedMessage,
      data: updatePlandata,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};
// -------------------------DELETE PLAN DATA-----------------------------------

const deletePlanData = async (req, res) => {
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
    const planid = req.params.id;
    const checkid = await PLAN.findOne({
      where: { plan_id: planid },
    });
    if (!checkid)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });
    const deletedplanData = await PLAN.destroy({
      where: { plan_id: planid },
    });
    res.status(200).json({
      status: 200,
      message: msg.deletedMessage,
      data: deletedplanData,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};

module.exports = {
  exportCSV,
  getPlanDataById,
  getSerachData,
  createPlanData,
  updatePlanData,
  deletePlanData,
};
