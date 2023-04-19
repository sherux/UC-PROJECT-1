const express = require("express");
const router = express.Router();
const supervisorController = require("../controllers/supervisor.controller");
const { body } = require("express-validator");
const { handleerror, validationInputParam } = require("../util/csv");

const validationResult = [
  body("firstName")
    .isString()
    .isLength({ min: 3, max: 15 })
    .trim()
    .withMessage("Minimum 3 characters and maximum 15 allowed in first name"),
  body("lastName")
    .isString()
    .isLength({ min: 3, max: 15 })
    .trim()
    .withMessage("Minimum 3 characters and maximum 15 allowed in last name"),
  body("chatIntegration")
    .isBoolean()
    .withMessage("Input entered in status must be true or false"),

  body("email").isEmail().withMessage("email must be a valid email"),
  body("username")
    .trim()
    .isString()
    .withMessage("username is not allowed to be empty"),
  body("password")
    .isStrongPassword({
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
    })
    .trim()
    .withMessage(
      "Password must be greater than 6 and contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  body("timezoneId")
    .isString()
    .withMessage("timezoneId is not allowed to be empty"),
  body("status")
    .isBoolean()
    .withMessage("Input entered in status must be true or false"),
  body("extension")
    .isNumeric()
    .isLength({ min: 3, max: 20 })
    .trim()
    .withMessage("Minimum 3 number and maximum 20 allowed in extension"),
];
// --------all routes----------------
router.get("/export", supervisorController.exportCSV);

router.get("/search", supervisorController.getSerachData);
router.get(
  "/supervisor/:id",
  validationInputParam(),
  handleerror,

  supervisorController.getSupervisorDataById
);
router.delete(
  "/delete/:id",
  validationInputParam(),
  handleerror,
  supervisorController.deleteSupervisorData
);

router.post(
  "/create",
  validationResult,
  handleerror,

  supervisorController.createSupervisorData
);

router.put(
  "/update/:id",
  validationInputParam(),
  validationResult,
  handleerror,
  supervisorController.updateSupervisorData
);

// -----------export routes---------------
module.exports = router;
