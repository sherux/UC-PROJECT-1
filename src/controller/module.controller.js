const { Op } = require("sequelize");
const ROLE = require("../model/role.model");
const msg = require("../util/message.json");
const { createCSV } = require("../util/csv");
const MODULE = require("../model/module.model");

// ----------------------------get role by id----------------
const getModuleDataById = async (req, res) => {
  try {
    const module_id = req.params.id;
    const getModuleDataById = await MODULE.findOne({
      where: { module_id: module_id },
    });
    if (!getModuleDataById)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });
    return res.status(200).json({
      status: 200,
      message: msg.readIdMessage,
      data: getModuleDataById,
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};

// ----------------------SEARCH QUERY AND GET ALL AGENT DATA-------------------------
const getModuleListData = async (req, res) => {
  try {
    let { limit = 5, page_no = 1 } = req.query;
    const fieldvalue = req.query.fieldvalue;

    const alldata = await MODULE.findAll({
      offset: page_no * limit,
      limit: +limit,
    });
    if (fieldvalue) {
      const { count } = await MODULE.findAndCountAll({
        where: {
          [Op.or]: [
            {
              module_name: { [Op.like]: `%${fieldvalue}%` },
            },
          ],
        },
      });
      const moduledata = await MODULE.findAll({
        offset: page_no * limit,
        limit: +limit,
        where: {
          [Op.or]: [
            {
              module_name: {
                [Op.like]: `%${fieldvalue}%`,
              },
            },
          ],
        },
      });

      if (moduledata == "") {
        return res.status(200).json({ status: 200, message: msg.dataNotFound });
      } else {
        return res.status(200).json({
          status: 200,
          message: msg.readMessage,
          data: moduledata,
          pagination: {
            total: count,
            items_per_page: moduledata.length,
            page: +page_no,
            last_page: Math.ceil(count / limit),
          },
        });
      }
    } else {
      const { count } = await MODULE.findAndCountAll();

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
// ------------------create role------------------------
const createModuletData = async (req, res) => {
  try {
    const modulenameexit = await MODULE.findOne({
      where: { module_name: req.body.module_name },
    });
    if (modulenameexit)
      return res
        .status(400)
        .json({ status: 400, message: "module_name already exists" });
    const createModuletData = new MODULE({
      module_name: req.body.module_name,
    });
    const moduledata = await createModuletData.save();
    res.status(200).json({
      status: 200,
      message: msg.insertedMessage,
      data: moduledata,
    });
  } catch (error) {
    console.log("Error in posting data", error);

    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};

//  ------------------create role------------------------
const updateModuletData = async (req, res) => {
  try {
    const module_id = req.params.id;
    const checkid = await MODULE.findOne({
      where: { module_id: module_id },
    });
    if (!checkid)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });

    const updateModuletData = await MODULE.update(
      {
        module_name: req.body.module_name,
      },
      {
        where: { module_id: module_id },
      }
    );
    res.status(200).json({
      status: 200,
      message: msg.insertedMessage,
      data: updateModuletData,
    });
  } catch (error) {
    console.log("Error in posting data", error);

    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};

// -----------------------------delete role----------------------

const deleteModuleData = async (req, res) => {
  try {
    const module_id = req.params.id;
    const checkid = await MODULE.findOne({
      where: { module_id: module_id },
    });
    if (!checkid)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });
    const deleteModuleData = await MODULE.destroy({
      where: { module_id: module_id },
    });
    res.status(200).json({
      status: 200,
      message: msg.deletedMessage,
      data: deleteModuleData,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};
module.exports = {
  createModuletData,
  updateModuletData,
  deleteModuleData,
  getModuleDataById,
  getModuleListData,
};
