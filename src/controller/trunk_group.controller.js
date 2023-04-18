const { Op } = require("sequelize");
const TRUNKGROUP = require("../model/trunk_group.model");
const TRUNKMAPPING = require("../model/trunk_mapping.model");
const sequelize = require("../util/db");
const msg = require("../util/message.json");
require("dotenv").config();

const fs = require("fs");
const { createCSV } = require("../util/csv");
// ----------------------------------export csv file--------------------------
const exportCSV = async (req, res, next) => {
  try {
    const data = await TRUNKGROUP.findAll();
    const toCreateCSV = data.map((e) => {
      return e.dataValues;
    });
    const filename = "trunkgroup";
    await createCSV(toCreateCSV, filename);
    res.status(200).json({
      status: 200,
      message: msg.createdCSV,
      data: url + "/csv/trunkgroup.csv",
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};

// -------------------------GET TRUNK DATA BY ID-----------------------------------

const getTrunkgroupDataById = async (req, res) => {
  try {
    const trunk_group_id = req.params.id;
    const getTrunkgroupDataById = await TRUNKGROUP.findOne({
      where: { trunk_group_id: trunk_group_id },
    });
    if (!getTrunkgroupDataById)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });
    return res.status(200).json({
      status: 200,
      message: msg.readIdMessage,
      data: getTrunkgroupDataById,
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};

// ----------------------SEARCH QUERY AND GET ALL TRUNK GROUP DATA-------------------------
const gettrunkgroupListData = async (req, res) => {
  try {
    let { limit, page_no } = req.query;
    if (!limit) limit = 8;
    if (!page_no) page_no = 0;
    const fieldvalue = req.query.fieldvalue;
    // const fieldname = req.query.fieldname;

    console.log("kmjniohuio", fieldvalue);

    const alldata = await TRUNKGROUP.findAll({
      order: [["trunk_group_id", "DESC"]],
      offset: page_no * limit,
      limit: +limit,
    });
    if (fieldvalue) {
      const { count } = await TRUNKGROUP.findAndCountAll({
        where: {
          [Op.or]: [
            {
              trunk_group_name: { [Op.like]: `%${fieldvalue}%` },
            },
          ],
        },
      });
      const trunkdata = await TRUNKGROUP.findAll({
        offset: page_no * limit,
        limit: +limit,
        where: {
          [Op.or]: [
            {
              trunk_group_name: { [Op.like]: `%${fieldvalue}%` },
            },
          ],
        },
      });

      if (trunkdata == "") {
        return res.status(200).json({ status: 200, message: msg.dataNotFound });
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
      const { count } = await TRUNKGROUP.findAndCountAll();

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

// -------------------------CREATE TRUNK GROUP DATA-----------------------------------

const createTrunkgroupData = async (req, res) => {
  //   console.log(req.body);
  try {
    req.body.selected_trunk.forEach(async (val) => {
      console.log(val.id);
    });
    // console.log(req.body.selected_trunk);
    if (req.body.selected_trunk.length < 1) {
      req.body.selected_trunk.forEach(async (val) => {
        if (req.body.selected_trunk);
        return res.status(400).json({ status: 400, message: "not found" });
      });
      return res
        .status(400)
        .json({ status: 400, message: "Selected atleast 1 trunk" });
    }
    const exist = await TRUNKGROUP.findOne({
      where: { trunk_group_name: req.body.trunk_group_name },
    });
    if (exist)
      return res
        .status(400)
        .json({ status: 400, message: " trunk_group_name already exists" });

    const createdTrunkgroupData = new TRUNKGROUP({
      trunk_group_name: req.body.trunk_group_name,
      lcr: req.body.lcr,
      status: req.body.status,
    });

    const trunkgroupdata = await createdTrunkgroupData.save();
    const datavalue = req.body.selected_trunk;
    // console.log(datavalue.length);

    datavalue.forEach(async (val) => {
      // console.log(val);
      const createdMappingData = new TRUNKMAPPING({
        trunk_group_id: trunkgroupdata.dataValues.trunk_group_id,
        t_id: val.id,
      });

      const trunkgroupdata2 = await createdMappingData.save();
      // console.log(trunkgroupdata2);
      // console.log("val", trunkgroupdata2.dataValues.trunk_mapping_id);
    });

    res.status(200).json({
      status: 200,
      message: msg.insertedMessage,
      data: trunkgroupdata,
    });
  } catch (error) {
    console.log("Error in posting data", error.message);

    res.status(500).json({
      status: 500,
      message: msg.somethingWentWrong,
      data: error.message,
    });
  }
};
// -------------------------UPDATE TRUNK GROUP DATA-----------------------------------

const updateTrunkgroupData = async (req, res) => {
  try {
    console.log(req.body.selected_trunk.length);
    if (req.body.selected_trunk.length < 1) {
      req.body.selected_trunk.forEach(async (val) => {
        return res.status(400).json({ status: 400, message: "not found" });
      });
      return res
        .status(400)
        .json({ status: 400, message: "Selected atleast 1 trunk " });
    }
    const trunk_group_id = req.params.id;
    const checkid = await TRUNKGROUP.findOne({
      where: { trunk_group_id: req.params.id },
    });
    if (!checkid)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });
    const updateTrunkgroupData = await TRUNKGROUP.update(
      {
        trunk_group_name: req.body.trunk_group_name,
        lcr: req.body.lcr,
        status: req.body.status,
      },
      {
        where: { trunk_group_id: trunk_group_id },
      }
    );
    res.status(200).json({
      status: 200,
      message: msg.updatedMessage,
      data: updateTrunkgroupData,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};
// -------------------------DELETE TRUNK GROUP DATA-----------------------------------

const deleteTrunkgroupData = async (req, res) => {
  try {
    const trunk_group_id = req.params.id;
    const checkid = await TRUNKGROUP.findOne({
      where: { trunk_group_id: req.params.id },
    });
    if (!checkid)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });
    // console.log(checkid.dataValues.file);

    const deleteTrunkgroupData = await TRUNKGROUP.destroy({
      where: { trunk_group_id: trunk_group_id },
    });
    res.status(200).json({
      status: 200,
      message: msg.deletedMessage,
      data: deleteTrunkgroupData,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};

// ----------------------SEARCH QUERY AND GET ALL TRUNK GROUP DATA-------------------------
const getTrunkList = async (req, res) => {
  try {
    // db.fol.belongsTo(db.user, {
    //   as: "following",
    //   foreignkey: "followingid",
    // });

    // db.follower.belongsto(db.user, {
    //   as: "follower",
    //   foreignkey: "userid",
    // });
    // const trunk_group_id = req.body.trunk_group_id;
    // const data = await TRUNKGROUP.findAll({
    //   attributes: ["trunk_group_name", "lcr", "status"],
    //   where: { trunk_group_id: trunk_group_id },
    //   include: [
    //     {
    //       model: TRUNKMAPPING,
    //       attributes: ["trunk_id"],
    //       where: { trunk_group_id: trunk_group_id },
    //       include: [
    //         {
    //           model: TRUNKGROUP,
    //           attributes: ["sip_trunk_name"],
    //         },
    //       ],
    //     },
    //   ],
    // });

    const [results, metadata] = await sequelize.query(
      "select tg.trunk_group_name, tg.lcr, tg.status,  uc_t.trunk_id, uc_t.sip_trunk_name from uc_trunk_groups as tg join uc_trunk_mappings as tg_m ON tg.trunk_group_id = tg_m.trunk_group_id JOIN uc_trunks as uc_t ON tg_m.t_id = uc_t.trunk_id where tg.trunk_group_id  = " +
        req.params.id
    );
    // console.log(results[0], "khuigff");

    const trunk_group_id = req.params.id;
    const checkid = await TRUNKGROUP.findOne({
      where: { trunk_group_id: trunk_group_id },
    });
    if (!checkid)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });
    // if (!(results.trunk_group_name || results.lcr || results.status)) {
    //   return res.status(200).json({
    //     status: 200,
    //     message: "sorry,selected trunk  id not found",
    //   });
    // }

    let listData = {
      trunk_group_name: results[0].trunk_group_name,
      lcr: results[0].lcr,
      status: results[0].status,
      selected_trunk: [],
    };

    results.forEach((valData) => {
      // console.log(valData);
      listData["selected_trunk"].push({
        id: valData.trunk_id,
        value: valData.sip_trunk_name,
      });
    });

    // console.log(results);

    // Results will be an empty array and metadata will contain the number of affected rows.
    res.status(200).json({
      status: 200,
      message: "data succesfully fetch",
      data: listData,
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({
      status: 500,
      message: msg.somethingWentWrong,
      message2: error.message,
    });
  }
};

module.exports = {
  exportCSV,
  getTrunkgroupDataById,
  gettrunkgroupListData,
  createTrunkgroupData,
  updateTrunkgroupData,
  deleteTrunkgroupData,
  getTrunkList,
};
