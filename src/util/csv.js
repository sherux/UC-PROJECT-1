const ObjectsToCsv = require("objects-to-csv");
const { filepath } = require("../util/path");
const { validationResult, param } = require("express-validator");

const createCSV = async (obj, filename) => {
  if (obj.length !== 0) {
    await new ObjectsToCsv(obj).toDisk(filepath + "csv/" + filename + ".csv");
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

module.exports = { createCSV, handleerror, validationInputParam };
