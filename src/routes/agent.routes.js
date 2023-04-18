const express = require("express");
const router = express.Router();
const agentController = require("../controller/agent.controller");
const { body, param } = require("express-validator");
const { handleerror } = require("../util/csv");

const validatParam = [
  param("id")
    .trim()
    .isNumeric()
    .withMessage("Please enter a numeric value in id"),
];

const validatBody = [
  body("first_name")
    .isString()
    .isLength({ min: 3, max: 15 })
    .trim()
    .withMessage("Minimum 3 characters and maximum 15 allowed in first name"),
  body("last_name")
    .isString()
    .isLength({ min: 3, max: 15 })
    .trim()
    .withMessage("Minimum 3 characters and maximum 15 allowed in last name"),
  body("chat_integration")
    .isBoolean()
    .withMessage("Input entered in status must be true or false"),

  body("email").isEmail().withMessage("email must be a valid email"),
  body("username")
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
  body("timezone_id")
    .isString()
    .withMessage("timezone_id is not allowed to be empty"),
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
router.get("/export", agentController.exportCSV);

router.get("/getagents", agentController.getSerachData);
router.get("/agent/:id", validatParam, agentController.getAgentDataById);
router.delete("/delete/:id", validatParam, agentController.deleteAgentData);

router.post(
  "/create",
  validatBody,
  handleerror,

  agentController.createAgentData
);

router.put(
  "/update/:id",
  validatParam,
  validatBody,
  handleerror,

  agentController.updateAgentData
);

// -----------export routes---------------
module.exports = router;
