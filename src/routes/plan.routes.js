const express = require("express");
const router = express.Router();
const planController = require("../controller/plan.controller");
const { body, param } = require("express-validator");

router.get("/export", planController.exportCSV);

router.get("/getsearch", planController.getSerachData);
router.get(
  "/plan/:id",
  [
    param("id")
      .trim()
      .isNumeric()
      .withMessage("Please enter a numeric value in id"),
  ],
  planController.getPlanDataById
);

router.delete(
  "/delete/:id",
  [
    param("id")
      .trim()
      .isNumeric()
      .withMessage("Please enter a numeric value in id"),
  ],
  planController.deletePlanData
);

router.post(
  "/create",
  [
    body("plan_name")
      .isString()
      .isLength({ min: 2, max: 15 })
      .trim()
      .withMessage("Minimum 2 characters and maximum 15 allowed in plan name"),

    body("black_list")
      .isBoolean()
      .withMessage("Input entered in black_list must be true or false"),
    body("white_list")
      .isBoolean()
      .withMessage("Input entered in white_list must be true or false"),
    body("universal_forward")
      .isBoolean()
      .withMessage("Input entered in universal_forward must be true or false"),
    body("no_answer_forward")
      .isBoolean()
      .withMessage("Input entered in no_answer_forward must be true or false"),
    body("busy_forward")
      .isBoolean()
      .withMessage("Input entered in busy_forward must be true or false"),
    body("time_based_forward")
      .isBoolean()
      .withMessage("Input entered in time_based_forward must be true or false"),
    body("selective_forward")
      .isBoolean()
      .withMessage("Input entered in selective_forward must be true or false"),
    body("shift_forward")
      .isBoolean()
      .withMessage("Input entered in shift_forward must be true or false"),
    body("unavailable_forward")
      .isBoolean()
      .withMessage(
        "Input entered in unavailable_forward must be true or false"
      ),
    body("redial")
      .isBoolean()
      .withMessage("Input entered in redial must be true or false"),
    body("holiday")
      .isBoolean()
      .withMessage("Input entered in holiday must be true or false"),
    body("week_off")
      .isBoolean()
      .withMessage("Input entered in week_off must be true or false"),
    body("barge_in")
      .isBoolean()
      .withMessage("Input entered in barge_in must be true or false"),
    body("do_not_disturb")
      .isBoolean()
      .withMessage("Input entered in do_not_disturb must be true or false"),
    body("park")
      .isBoolean()
      .withMessage("Input entered in park must be true or false"),
    body("transfer")
      .isBoolean()
      .withMessage("Input entered in transfer must be true or false"),
    body("call_recording")
      .isBoolean()
      .withMessage("Input entered in call_recording must be true or false"),
    body("caller_id_block")
      .isBoolean()
      .withMessage("Input entered in caller_id_block must be true or false"),

    body("call_return")
      .isBoolean()
      .withMessage("Input entered in call_return must be true or false"),
    body("busy_callback")
      .isBoolean()
      .withMessage("Input entered in busy_callback must be true or false"),
  ],

  planController.createPlanData
);

router.put(
  "/update/:id",
  [
    param("id")
      .trim()
      .isNumeric()
      .withMessage("Please enter a numeric value in id"),

    body("plan_name")
      .isString()
      .isLength({ min: 2, max: 15 })
      .trim()
      .withMessage("Minimum 2 characters and maximum 15 allowed in plan name"),

    body("black_list")
      .isBoolean()
      .withMessage("Input entered in black_list must be true or false"),
    body("white_list")
      .isBoolean()
      .withMessage("Input entered in white_list must be true or false"),
    body("universal_forward")
      .isBoolean()
      .withMessage("Input entered in universal_forward must be true or false"),
    body("no_answer_forward")
      .isBoolean()
      .withMessage("Input entered in no_answer_forward must be true or false"),
    body("busy_forward")
      .isBoolean()
      .withMessage("Input entered in busy_forward must be true or false"),
    body("time_based_forward")
      .isBoolean()
      .withMessage("Input entered in time_based_forward must be true or false"),
    body("selective_forward")
      .isBoolean()
      .withMessage("Input entered in selective_forward must be true or false"),
    body("shift_forward")
      .isBoolean()
      .withMessage("Input entered in shift_forward must be true or false"),
    body("unavailable_forward")
      .isBoolean()
      .withMessage(
        "Input entered in unavailable_forward must be true or false"
      ),
    body("redial")
      .isBoolean()
      .withMessage("Input entered in redial must be true or false"),
    body("holiday")
      .isBoolean()
      .withMessage("Input entered in holiday must be true or false"),
    body("week_off")
      .isBoolean()
      .withMessage("Input entered in week_off must be true or false"),
    body("barge_in")
      .isBoolean()
      .withMessage("Input entered in barge_in must be true or false"),
    body("do_not_disturb")
      .isBoolean()
      .withMessage("Input entered in do_not_disturb must be true or false"),
    body("park")
      .isBoolean()
      .withMessage("Input entered in park must be true or false"),
    body("transfer")
      .isBoolean()
      .withMessage("Input entered in transfer must be true or false"),
    body("call_recording")
      .isBoolean()
      .withMessage("Input entered in call_recording must be true or false"),
    body("caller_id_block")
      .isBoolean()
      .withMessage("Input entered in caller_id_block must be true or false"),

    body("call_return")
      .isBoolean()
      .withMessage("Input entered in call_return must be true or false"),
    body("busy_callback")
      .isBoolean()
      .withMessage("Input entered in busy_callback must be true or false"),
  ],

  planController.updatePlanData
);

module.exports = router;
