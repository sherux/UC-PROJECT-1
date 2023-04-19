const { Op } = require("sequelize");
const msg = require("../util/message.json");
const { createCSV, changeTimeFormat } = require("../util/csv");
const MODULE = require("../models/module.model");

// ----------------------------get role by id----------------
const getModuleDataById = async (req, res) => {
  try {
    const moduleId = req.params.id;
    const getModuleDataById = await MODULE.findOne({
      where: { module_id: moduleId },
    });
    if (!getModuleDataById)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });
    getModuleDataById.dataValues.createdAt = changeTimeFormat(
      getModuleDataById.dataValues.createdAt
    );
    getModuleDataById.dataValues.updatedAt = changeTimeFormat(
      getModuleDataById.dataValues.updatedAt
    );
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
        await changeTime(moduledata);
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
// ------------------create role------------------------
const createModuletData = async (req, res) => {
  try {
    const modulenameexit = await MODULE.findOne({
      where: { module_name: req.body.moduleName },
    });
    if (modulenameexit)
      return res
        .status(400)
        .json({ status: 400, message: "module_name already exists" });
    const createModuletData = new MODULE({
      module_name: req.body.moduleName,
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
    const moduleId = req.params.id;
    const checkid = await MODULE.findOne({
      where: { module_id: moduleId },
    });
    if (!checkid)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });

    const updateModuletData = await MODULE.update(
      {
        module_name: req.body.moduleName,
      },
      {
        where: { module_id: moduleId },
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
    const moduleId = req.params.id;
    const checkid = await MODULE.findOne({
      where: { module_id: moduleId },
    });
    if (!checkid)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });
    const deleteModuleData = await MODULE.destroy({
      where: { module_id: moduleId },
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
