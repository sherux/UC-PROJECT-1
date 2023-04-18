const { Op } = require("sequelize");
const TRUNK = require("../model/trunk.model");
const msg = require("../util/message.json");
const fs = require("fs");
require("dotenv").config();

const { filepath } = require("../util/path");
const { createCSV } = require("../util/csv");
const Trunk = require("../model/trunk.model");
// ----------------------------------export csv file--------------------------
const exportCSV = async (req, res, next) => {
  try {
    const data = await TRUNK.findAll();
    const toCreateCSV = data.map((e) => {
      return e.dataValues;
    });
    const filename = "trunk";
    await createCSV(toCreateCSV, filename);
    res.status(200).json({
      status: 200,
      message: msg.createdCSV,
      data: process.env.url + "/csv/trunk.csv",
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};

// -------------------------GET TRUNK DATA BY ID-----------------------------------

const getTrunkDataById = async (req, res) => {
  try {
    const trunk_id = req.params.id;
    const TrunkAllDataByID = await TRUNK.findOne({
      where: { trunk_id: trunk_id },
    });
    if (!TrunkAllDataByID)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });
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
      where: { sip_trunk_name: req.body.sip_trunk_name },
    });
    if (exist)
      return res
        .status(400)
        .json({ status: 400, message: "sip_trunk_name already exists" });
    if (req.body.sip_protocol === "TLS") {
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

      const file_name = new Date().toISOString() + "-" + file.name;
      const path = filepath + file_name;
      await file.mv(path);

      const createdTrunkData = new TRUNK({
        sip_trunk_name: req.body.sip_trunk_name,
        sip_ip: req.body.sip_ip,
        sip_port: req.body.sip_port,
        sip_protocol: req.body.sip_protocol,
        sip_payload_method: req.body.sip_payload_method,
        proxy_ip: req.body.proxy_ip,
        proxy_port: req.body.proxy_port,
        status: req.body.status,
        file: file_name,
      });

      const trunkdata = await createdTrunkData.save();
      res.status(200).json({
        status: 200,
        message: msg.insertedMessage,
        data: trunkdata,
      });
    } else {
      const createdTrunkData = new TRUNK({
        sip_trunk_name: req.body.sip_trunk_name,
        sip_ip: req.body.sip_ip,
        sip_port: req.body.sip_port,
        sip_protocol: req.body.sip_protocol,
        sip_payload_method: req.body.sip_payload_method,
        proxy_ip: req.body.proxy_ip,
        proxy_port: req.body.proxy_port,
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
    const trunk_id = req.params.id;
    const checkid = await TRUNK.findOne({
      where: { trunk_id: trunk_id },
    });
    if (!checkid)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });
    // -------------file extension check-----------------------------
    if (req.body.sip_protocol === "TLS") {
      if (!req.files) {
        const updateTrunkData = await TRUNK.update(
          {
            sip_trunk_name: req.body.sip_trunk_name,
            sip_ip: req.body.sip_ip,
            sip_port: req.body.sip_port,
            sip_protocol: req.body.sip_protocol,
            sip_payload_method: req.body.sip_payload_method,
            proxy_ip: req.body.proxy_ip,
            proxy_port: req.body.proxy_port,
            status: req.body.status,
          },
          {
            where: { trunk_id: trunk_id },
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
      const file_name = new Date().toISOString() + "-" + file.name;
      const path = filepath + file_name;
      await file.mv(path);
      const updateTrunkData = await TRUNK.update(
        {
          sip_trunk_name: req.body.sip_trunk_name,
          sip_ip: req.body.sip_ip,
          sip_port: req.body.sip_port,
          sip_protocol: req.body.sip_protocol,
          sip_payload_method: req.body.sip_payload_method,
          proxy_ip: req.body.proxy_ip,
          proxy_port: req.body.proxy_port,
          status: req.body.status,
          file: file_name,
        },
        {
          where: { trunk_id: trunk_id },
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
          sip_trunk_name: req.body.sip_trunk_name,
          sip_ip: req.body.sip_ip,
          sip_port: req.body.sip_port,
          sip_protocol: req.body.sip_protocol,
          sip_payload_method: req.body.sip_payload_method,
          proxy_ip: req.body.proxy_ip,
          proxy_port: req.body.proxy_port,
          status: req.body.status,
        },
        {
          where: { trunk_id: trunk_id },
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
    const trunk_id = req.params.id;
    const checkid = await TRUNK.findOne({
      where: { trunk_id: req.params.id },
    });
    if (!checkid)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });
    if (checkid.dataValues.file) {
      const path = filepath;
      fs.unlink(path + checkid.dataValues.file, (err) => {
        if (err) console.log("object", err);
      });
    }
    const deletedTrunkData = await TRUNK.destroy({
      where: { trunk_id: trunk_id },
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
