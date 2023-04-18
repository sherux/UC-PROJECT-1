const express = require("express");
const router = express.Router();
const trunkgroupController = require("../controller/trunk_group.controller");
const { body } = require("express-validator");
const { handleerror, validationInputParam } = require("../util/csv");

// Define the custom validator function
const validationdata = [
  body("trunk_group_name")
    .isString()
    .isLength({ min: 3, max: 15 })
    .trim()
    .withMessage(
      "Minimum 3 characters and maximum 15 allowed in trunk_group_name  "
    ),

  body("lcr")
    .isBoolean()
    .withMessage("Input entered in status must be true or false"),

  body("status")
    .isBoolean()
    .withMessage("Input entered in status must be true or false"),
];

// --------all routes----------------
router.get("/export", trunkgroupController.exportCSV);

router.get("/getalldata", trunkgroupController.gettrunkgroupListData);
router.get("/gettrunklist/:id", trunkgroupController.getTrunkList);

router.get(
  "/:id",
  validationInputParam(),
  handleerror,

  trunkgroupController.getTrunkgroupDataById
);
router.delete(
  "/delete/:id",
  validationInputParam(),
  handleerror,
  trunkgroupController.deleteTrunkgroupData
);

router.post(
  "/create",
  validationdata,
  handleerror,

  trunkgroupController.createTrunkgroupData
);

router.put(
  "/update/:id",
  validationInputParam(),
  validationdata,
  handleerror,

  trunkgroupController.updateTrunkgroupData
);

// -----------export routes---------------
module.exports = router;
