const express = require("express");
const router = express.Router();
const moduleController = require("../controller/module.controller");
const { body, param, validationResult } = require("express-validator");
const { handleerror, validationInputParam } = require("../util/csv");

const validation = [
  body("moduleName")
    .isString()
    .isLength({ min: 3, max: 15 })
    .trim()
    .withMessage("Minimum 2 characters and maximum 15 allowed in first name"),
];
// --------all routes----------------
// router.get("/export", agentController.exportCSV);

router.get("/getmodules", moduleController.getModuleListData);
router.get(
  "/module/:id",
  validationInputParam(),
  handleerror,
  moduleController.getModuleDataById
);
router.delete(
  "/delete/:id",
  validationInputParam(),
  handleerror,
  moduleController.deleteModuleData
);

router.post(
  "/create",
  validation,
  handleerror,

  moduleController.createModuletData
);
router.put(
  "/update/:id",
  validation,

  validationInputParam(),
  handleerror,
  moduleController.updateModuletData
);

// -----------export routes---------------
module.exports = router;
