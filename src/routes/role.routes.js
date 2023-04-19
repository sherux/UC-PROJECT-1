const express = require("express");
const router = express.Router();
const roleController = require("../controllers/role.controller");
const { body, param } = require("express-validator");
const { handleerror, validationInputParam } = require("../util/csv");

const validationResult = [
  body("roleName")
    .isString()
    .isLength({ min: 3, max: 15 })
    .trim()
    .withMessage("Minimum 3 characters and maximum 15 allowed in first name"),
  body("description")
    .isString()
    .isLength({ min: 3, max: 50 })
    .trim()
    .withMessage("Minimum 3 characters and maximum 15 allowed in last name"),
];
// --------all routes----------------
// router.get("/export", agentController.exportCSV);

router.get("/getroles", roleController.getRoleListData);
router.get(
  "/role/:id",
  validationInputParam(),
  handleerror,
  roleController.getRoleDataById
);
router.delete(
  "/delete/:id",
  validationInputParam(),
  handleerror,
  roleController.deleteRoleData
);

router.post(
  "/create",
  validationResult,
  handleerror,

  roleController.createRoletData
);
router.put(
  "/update/:id",
  validationInputParam(),
  validationResult,
  handleerror,

  roleController.updateRoletData
);

// -----------export routes---------------
module.exports = router;
