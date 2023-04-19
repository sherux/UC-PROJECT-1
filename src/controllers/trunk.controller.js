const { Op } = require("sequelize");
const TRUNK = require("../models/trunk.model");
const msg = require("../util/message.json");
const fs = require("fs");
const moment = require("moment");
require("dotenv").config();
const { imagePath, csvurl, imagurl } = require("../util/path1");
const { createCSV, changeTime, changeTimeFormat } = require("../util/csv");
// ----------------------------------export csv file--------------------------
const exportCSV = async (req, res, next) => {
  try {
    const data = await TRUNK.findAll();
    const toCreateCSV = data.map((e) => {
      return e.dataValues;
    });
    const filename =
      moment(new Date()).format("YYYY-MM-DD HH:mm:ss") + "_trunk";
    await createCSV(toCreateCSV, filename);
    res.status(200).json({
      status: 200,
      message: msg.createdCSV,
      data: csvurl + "/trunk.csv",
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};

// -------------------------GET TRUNK DATA BY ID-----------------------------------

const getTrunkDataById = async (req, res) => {
  try {
    const trunkId = req.params.id;
    const TrunkAllDataByID = await TRUNK.findOne({
      where: { trunk_id: trunkId },
    });
    if (!TrunkAllDataByID)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });
    console.log(TrunkAllDataByID.dataValues.file);
    TrunkAllDataByID.dataValues.file =
      imagurl + TrunkAllDataByID.dataValues.file;
    TrunkAllDataByID.dataValues.createdAt = changeTimeFormat(
      TrunkAllDataByID.dataValues.createdAt
    );
    TrunkAllDataByID.dataValues.updatedAt = changeTimeFormat(
      TrunkAllDataByID.dataValues.updatedAt
    );
    return res.status(200).json({
      status: 200,
      message: msg.readIdMessage,
      data: TrunkAllDataByID,
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};

// ----------------------SEARCH QUERY AND GET ALL TRUNK DATA-------------------------
const getSerachData = async (req, res) => {
  try {
    let { limit, page_no } = req.query;
    if (!limit) limit = 8;
    if (!page_no) page_no = 0;
    const fieldvalue = req.query.fieldvalue;

    const alldata = await TRUNK.findAll({
      order: [["trunk_id", "DESC"]],
      offset: page_no * limit,
      limit: +limit,
    });

    if (fieldvalue) {
      const { count } = await TRUNK.findAndCountAll({
        where: {
          [Op.or]: [
            {
              sip_trunk_name: { [Op.like]: `%${fieldvalue}%` },
            },
          ],
        },
      });
      const trunkdata = await TRUNK.findAll({
        offset: page_no * limit,
        limit: +limit,
        where: {
          [Op.or]: [
            {
              sip_trunk_name: {
                [Op.like]: `%${fieldvalue}%`,
              },
            },
          ],
        },
      });

      if (trunkdata == "") {
        return res
          .status(200)
          .json({ status: 200, message: msg.dataNotFound, data: [] });
      } else {
        await changeTime(trunkdata);
        await trunkdata.forEach((element) => {
          element.dataValues.file = process.env.url + element.dataValues.file;
        });
        return res.status(200).json({
          status: 200,
          message: msg.readMessage,
          data: trunkdata,
          pagination: {
            total: count,
            items_per_page: trunkdata.length,
            page: +page_no,
            last_page: Math.ceil(count / limit),
          },
        });
      }
    } else {
      const { count } = await TRUNK.findAndCountAll();
      await changeTime(alldata);
      await alldata.forEach((element) => {
        // console.log(element);
        element.dataValues.file = process.env.url + element.dataValues.file;
      });
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

// -------------------------CREATE TRUNK DATA-----------------------------------

const createTrunkData = async (req, res) => {
  try {
    const exist = await TRUNK.findOne({
      where: { sip_trunk_name: req.body.sipTrunkName },
    });
    if (exist)
      return res
        .status(400)
        .json({ status: 400, message: "sipTrunkName already exists" });
    if (req.body.sipProtocol === "TLS") {
      if (!req.files) {
        return res
          .status(400)
          .json({ status: 400, message: "You need to choose a file" });
      }
      const file = req.files.file;
      if (!file.name.match(/\.(ctr)$/)) {
        return res.status(400).json({
          status: 400,
          message: msg.filevalidation,
        });
      }

      // check if there's a file in the request
      if (file.size > 2 * 1048576) {
        return res.status(413).json({
          status: 413,
          message: msg.fileSizeInvalid,
        });
      }

      const fileName = new Date().toISOString() + "-" + file.name;
      const path = imagePath + fileName;
      console.log(imagePath);
      await file.mv(path);

      const createdTrunkData = new TRUNK({
        sip_trunk_name: req.body.sipTrunkName,
        sip_ip: req.body.sipIp,
        sip_port: req.body.sipPort,
        sip_protocol: req.body.sipProtocol,
        sip_payload_method: req.body.sipPayloadMethod,
        proxy_ip: req.body.proxyIp,
        proxy_port: req.body.proxyPort,
        status: req.body.status,
        file: fileName,
      });

      const trunkdata = await createdTrunkData.save();
      res.status(200).json({
        status: 200,
        message: msg.insertedMessage,
        data: trunkdata,
      });
    } else {
      const createdTrunkData = new TRUNK({
        sip_trunk_name: req.body.sipTrunkName,
        sip_ip: req.body.sipIp,
        sip_port: req.body.sipPort,
        sip_protocol: req.body.sipProtocol,
        sip_payload_method: req.body.sipPayloadMethod,
        proxy_ip: req.body.proxyIp,
        proxy_port: req.body.proxyPort,
        status: req.body.status,
        file: null,
      });
      const trunkdata = await createdTrunkData.save();
      res.status(200).json({
        status: 200,
        message: msg.insertedMessage,
        data: trunkdata,
      });
    }
  } catch (error) {
    console.log("Error in posting data", error.message);

    res.status(500).json({
      status: 500,
      message: msg.somethingWentWrong,
      data: error.message,
    });
  }
};
// -------------------------UPDATE TRUNK DATA-----------------------------------

const updateTrunkData = async (req, res) => {
  try {
    const trunkId = req.params.id;
    const checkid = await TRUNK.findOne({
      where: { trunk_id: trunkId },
    });
    if (!checkid)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });
    // -------------file extension check-----------------------------
    if (req.body.sipProtocol === "TLS") {
      if (!req.files) {
        const updateTrunkData = await TRUNK.update(
          {
            sip_trunk_name: req.body.sipTrunkName,
            sip_ip: req.body.sipIp,
            sip_port: req.body.sipPort,
            sip_protocol: req.body.sipProtocol,
            sip_payload_method: req.body.sipPayloadMethod,
            proxy_ip: req.body.proxyIp,
            proxy_port: req.body.proxyPort,
            status: req.body.status,
          },
          {
            where: { trunk_id: trunkId },
          }
        );

        return res.status(200).json({
          status: 200,
          message: msg.updatedMessage,
          data: updateTrunkData,
        });
      }
      // check if there's a file in the request

      const file = req.files.file;
      if (!file.name.match(/\.(ctr)$/)) {
        return res.status(400).json({
          status: 400,
          message: msg.filevalidation,
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
      const updateTrunkData = await TRUNK.update(
        {
          sip_trunk_name: req.body.sipTrunkName,
          sip_ip: req.body.sipIp,
          sip_port: req.body.sipPort,
          sip_protocol: req.body.sipProtocol,
          sip_payload_method: req.body.sipPayloadMethod,
          proxy_ip: req.body.proxyIp,
          proxy_port: req.body.proxyPort,
          status: req.body.status,
          file: fileName,
        },
        {
          where: { trunk_id: trunkId },
        }
      );

      res.status(200).json({
        status: 200,
        message: msg.updatedMessage,
        data: updateTrunkData,
      });
    } else {
      const updateTrunkData = await TRUNK.update(
        {
          sip_trunk_name: req.body.sipTrunkName,
          sip_ip: req.body.sipIp,
          sip_port: req.body.sipPort,
          sip_protocol: req.body.sipProtocol,
          sip_payload_method: req.body.sipPayloadMethod,
          proxy_ip: req.body.proxyIp,
          proxy_port: req.body.proxyPort,
          status: req.body.status,
        },
        {
          where: { trunk_id: trunkId },
        }
      );
      res.status(200).json({
        status: 200,
        message: msg.updatedMessage,
        data: updateTrunkData,
      });
    }
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};
// -------------------------DELETE TRUNK DATA-----------------------------------

const deleteTrunkData = async (req, res) => {
  try {
    const trunkId = req.params.id;
    const checkid = await TRUNK.findOne({
      where: { trunk_id: req.params.id },
    });
    if (!checkid)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });
    if (checkid.dataValues.file) {
      const path = imagePath;
      console.log(imagePath, "UYGUVGUH", checkid.dataValues.file);
      fs.unlink(path + checkid.dataValues.file, (err) => {
        if (err) console.log("object", err);
      });
    }
    // console.log(PATH);
    // return false;
    const deletedTrunkData = await TRUNK.destroy({
      where: { trunk_id: trunkId },
    });
    res.status(200).json({
      status: 200,
      message: msg.deletedMessage,
      data: deletedTrunkData,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};

module.exports = {
  exportCSV,
  getTrunkDataById,
  getSerachData,
  createTrunkData,
  updateTrunkData,
  deleteTrunkData,
};
