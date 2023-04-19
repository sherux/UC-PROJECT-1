const { Op } = require("sequelize");
const ROLE = require("../model/role.model");
const msg = require("../util/message.json");
const { createCSV, changeTime, changeTimeFormat } = require("../util/csv");

// ----------------------------get role by id----------------
const getRoleDataById = async (req, res) => {
  try {
    const role_id = req.params.id;
    const RoleALlDataByID = await ROLE.findOne({
      where: { role_id: role_id },
    });
    if (!RoleALlDataByID)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });
    RoleALlDataByID.dataValues.createdAt = changeTimeFormat(
      AgentALlDataByID.dataValues.createdAt
    );
    RoleALlDataByID.dataValues.updatedAt = changeTimeFormat(
      RoleALlDataByID.dataValues.updatedAt
    );
    return res.status(200).json({
      status: 200,
      message: msg.readIdMessage,
      data: RoleALlDataByID,
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};

// ----------------------SEARCH QUERY AND GET ALL AGENT DATA-------------------------
const getRoleListData = async (req, res) => {
  try {
    let { limit = 5, page_no = 1 } = req.query;

    const fieldvalue = req.query.fieldvalue;

    const alldata = await ROLE.findAll({
      offset: page_no * limit,
      limit: +limit,
    });
    if (fieldvalue) {
      const { count } = await ROLE.findAndCountAll({
        where: {
          [Op.or]: [
            {
              role_name: { [Op.like]: `%${fieldvalue}}%` },
            },
          ],
        },
      });
      const roledata = await ROLE.findAll({
        offset: page_no * limit,
        limit: +limit,
        where: {
          [Op.or]: [
            {
              role_name: {
                [Op.like]: `%${fieldvalue}%`,
              },
            },
          ],
        },
      });

      if (roledata == "") {
        return res.status(200).json({ status: 200, message: msg.dataNotFound });
      } else {
        await changeTime(roledata);
        return res.status(200).json({
          status: 200,
          message: msg.readMessage,
          data: roledata,
          pagination: {
            total: count,
            items_per_page: roledata.length,
            page: +page_no,
            last_page: Math.ceil(count / limit),
          },
        });
      }
    } else {
      const { count } = await ROLE.findAndCountAll();
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
const createRoletData = async (req, res) => {
  try {
    const rolenameexit = await ROLE.findOne({
      where: { role_name: req.body.roleName },
    });
    if (rolenameexit)
      return res
        .status(400)
        .json({ status: 400, message: "role_name already exists" });

    const createRoletData = new ROLE({
      role_name: req.body.roleName,
      description: req.body.description,
    });
    const roledata = await createRoletData.save();
    res.status(200).json({
      status: 200,
      message: msg.insertedMessage,
      data: roledata,
    });
  } catch (error) {
    console.log("Error in posting data", error);

    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};

//  ------------------create role------------------------
const updateRoletData = async (req, res) => {
  try {
    const roleId = req.params.id;
    const checkid = await ROLE.findOne({
      where: { role_id: roleId },
    });
    if (!checkid)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });

    const updateRoletData = await ROLE.update(
      {
        role_name: req.body.roleName,
        description: req.body.description,
      },
      {
        where: { role_id: roleId },
      }
    );
    res.status(200).json({
      status: 200,
      message: msg.insertedMessage,
      data: updateRoletData,
    });
  } catch (error) {
    console.log("Error in posting data", error);

    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};

// -----------------------------delete role----------------------

const deleteRoleData = async (req, res) => {
  try {
    const roleId = req.params.id;
    const checkid = await ROLE.findOne({
      where: { role_id: roleId },
    });
    if (!checkid)
      return res.status(200).json({
        status: 200,
        message: msg.dataNotFound,
      });
    const deleteRoleData = await ROLE.destroy({
      where: { role_id: roleId },
    });
    res.status(200).json({
      status: 200,
      message: msg.deletedMessage,
      data: deleteRoleData,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ status: 500, message: msg.somethingWentWrong });
  }
};
module.exports = {
  createRoletData,
  updateRoletData,
  deleteRoleData,
  getRoleDataById,
  getRoleListData,
};
