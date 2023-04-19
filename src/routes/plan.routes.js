const express = require("express");
const router = express.Router();
const planController = require("../controller/plan.controller");
const { body, param } = require("express-validator");

const validatParam = [
  param("id")
    .trim()
    .isNumeric()
    .withMessage("Please enter a numeric value in id"),
];
const validation = [
  body("planName")
    .isString()
    .isLength({ min: 2, max: 15 })
    .trim()
    .withMessage("Minimum 2 characters and maximum 15 allowed in plan name"),

  body("blackList")
    .isBoolean()
    .withMessage("Input entered in black_list must be true or false"),
  body("whiteList")
    .isBoolean()
    .withMessage("Input entered in white_list must be true or false"),
  body("universalForward")
    .isBoolean()
    .withMessage("Input entered in universal_forward must be true or false"),
  body("noAnswerForward")
    .isBoolean()
    .withMessage("Input entered in no_answer_forward must be true or false"),
  body("busyForward")
    .isBoolean()
    .withMessage("Input entered in busy_forward must be true or false"),
  body("timeBasedForward")
    .isBoolean()
    .withMessage("Input entered in time_based_forward must be true or false"),
  body("selectiveForward")
    .isBoolean()
    .withMessage("Input entered in selective_forward must be true or false"),
  body("shiftForward")
    .isBoolean()
    .withMessage("Input entered in shift_forward must be true or false"),
  body("unavailableForward")
    .isBoolean()
    .withMessage("Input entered in unavailable_forward must be true or false"),
  body("redial")
    .isBoolean()
    .withMessage("Input entered in redial must be true or false"),
  body("holiday")
    .isBoolean()
    .withMessage("Input entered in holiday must be true or false"),
  body("weekOff")
    .isBoolean()
    .withMessage("Input entered in week_off must be true or false"),
  body("bargeIn")
    .isBoolean()
    .withMessage("Input entered in barge_in must be true or false"),
  body("doNotDisturb")
    .isBoolean()
    .withMessage("Input entered in do_not_disturb must be true or false"),
  body("park")
    .isBoolean()
    .withMessage("Input entered in park must be true or false"),
  body("transfer")
    .isBoolean()
    .withMessage("Input entered in transfer must be true or false"),
  body("callRecording")
    .isBoolean()
    .withMessage("Input entered in call_recording must be true or false"),
  body("callerIdBlock")
    .isBoolean()
    .withMessage("Input entered in caller_id_block must be true or false"),

  body("callReturn")
    .isBoolean()
    .withMessage("Input entered in call_return must be true or false"),
  body("busyCallback")
    .isBoolean()
    .withMessage("Input entered in busy_callback must be true or false"),
];
router.get("/export", planController.exportCSV);

router.get("/getsearch", planController.getSerachData);
router.get("/plan/:id", validatParam, planController.getPlanDataById);

router.delete("/delete/:id", validatParam, planController.deletePlanData);

router.post(
  "/create",
  validation,

  planController.createPlanData
);

router.put(
  "/update/:id",
  validatParam,
  validation,

  planController.updatePlanData
);

module.exports = router;
