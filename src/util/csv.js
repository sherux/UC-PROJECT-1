const ObjectsToCsv = require("objects-to-csv");
const { BASEPATH, csvPath } = require("./path1");
const { validationResult, param } = require("express-validator");
const moment = require("moment");

const createCSV = async (obj, filename) => {
  if (obj.length !== 0) {
    await new ObjectsToCsv(obj).toDisk(BASEPATH + "csv/" + filename + ".csv");
  }
};

const handleerror = async (req, res, next) => {
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
  next();
};

const validationInputParam = () => {
  return [
    param("id")
      .trim()
      .isNumeric()
      .withMessage("Please enter a numeric value in id"),
  ];
};

const changeTimeFormat = (date) => {
  return moment(date).format("YYYY-MM-DD HH:mm:ss");
};
const changeTime = (data) => {
  return data.map((e) => {
    e.dataValues.createdAt = changeTimeFormat(e.dataValues.createdAt);
    e.dataValues.updatedAt = changeTimeFormat(e.dataValues.updatedAt);
  });
};
module.exports = {
  createCSV,
  handleerror,
  validationInputParam,
  changeTimeFormat,
  changeTime,
};
