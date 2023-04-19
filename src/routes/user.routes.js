const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { body, param } = require("express-validator");
const userauth = require("../controllers/user.auth");

// --------all routes----------------
router.get("/export", userController.exportCSV);
router.get("/auth", userauth, userController.auth);
router.get("/logout", userauth, userController.logout);

router.get("/getusers", userController.getUserDataListData);
router.get(
  "/user/:id",
  param("id")
    .trim()
    .isNumeric()
    .withMessage("Please enter a numeric value in id"),
  userController.getUserDataById
);
router.delete(
  "/delete/:id",
  param("id")
    .trim()
    .isNumeric()
    .withMessage("Please enter a numeric value in id"),
  userController.deleteUserData
);
// route.post("/",kik)
router.post(
  "/create",
  [
    body("firstName")
      .isString()
      .isLength({ min: 3, max: 15 })
      .trim()
      .withMessage("Minimum 3 charactor and maximum 15 allowed in first name"),
    body("lastName")
      .isString()
      .isLength({ min: 3, max: 15 })
      .trim()
      .withMessage("Minimum 3 charactor and maximum 15 allowed in last name"),
    body(" dateOfBirth")
      .custom((value) => {
        if (!value) {
          return true; // if no value, skip validation
        }
        return validator.isISO8601(value);
      })
      .withMessage(
        "The 'dateOfBirth' field must be a valid ISO 8601 date string"
      ),

    body("gender")
      .isString()
      .isLength({ min: 1 })
      .trim()
      .matches(/^[MF]$/)
      .withMessage("Input entered in gender must be M or F"),
    body("email").isEmail().withMessage("email must be a valid email"),
    body("username")
      .isString()
      .isLength({ min: 3, max: 15 })
      .trim()

      .matches(/^[a-z0-9 ]+$/)
      .withMessage(
        "username must be alphanumeric and Minimum 3  or maximum 15  characters allowed"
      ),
    body("mobileNo")
      .matches(/^\d{10}$/)
      .withMessage("Mobile number must be exactly 10 digits long"),
    body("status")
      .isBoolean()
      .withMessage("Input entered in status true of false value"),
    body("address")
      .isString()
      .not()
      .isEmpty()
      .withMessage("Address cannot be empty"),
    body("password")
      .isStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
      })
      .trim()
      .withMessage(
        "Password must be greater than 6 and contain at least one uppercase , one lowercase , and one number"
      ),
    body("timezone").isNumeric().withMessage("Input entered in timezome"),
    body("roleId").isNumeric().withMessage("Input entered in role_id"),
  ],

  userController.createUserData
);

router.post(
  "/login",
  [
    body("password").isString().withMessage("Password must be required"),
    body("email").isEmail().withMessage("email must be a valid email"),
  ],
  userController.userlogindata
);
router.put(
  "/update/:id",
  [
    param("id")
      .trim()
      .isNumeric()
      .withMessage("Please enter a numeric value in id"),

    body("firstName")
      .isString()
      .isLength({ min: 3, max: 15 })
      .trim()
      .withMessage("Minimum 3 charactor and maximum 15 allowed in first name"),
    body("lastName")
      .isString()
      .isLength({ min: 3, max: 15 })
      .trim()
      .withMessage("Minimum 3 charactor and maximum 15 allowed in last name"),
    body(" dateOfBirth")
      .custom((value) => {
        if (!value) {
          return true; // if no value, skip validation
        }
        return validator.isISO8601(value);
      })
      .withMessage(
        "The 'dateOfBirth' field must be a valid ISO 8601 date string"
      ),
    body("username")
      .isString()
      .isLength({ min: 3, max: 15 })
      .trim()

      .matches(/^[a-z0-9 ]+$/)
      .withMessage(
        "username must be alphanumeric and Minimum 3  or maximum 15  characters allowed"
      ),
    body("gender")
      .isString()
      .isLength({ min: 1 })
      .trim()
      .matches(/^[MF]$/)
      .withMessage("Input entered in gender must be M or F"),

    body("mobileNo")
      .matches(/^\d{10}$/)
      .withMessage("Mobile number must be exactly 10 digits long"),
    body("status")
      .isBoolean()
      .withMessage("Input entered in status true of false value"),
    body("address")
      .isString()
      .not()
      .isEmpty()
      .withMessage("Address cannot be empty"),
    body("timezone").isNumeric().withMessage("Input entered in timezome id "),
    body("roleId").isNumeric().withMessage("Input entered in role_id"),
  ],

  userController.updateUserData
);
router.post(
  "/forget-password",
  [body("email").isEmail().withMessage("email must be a valid email")],
  userController.forgetpassword
);
router.post(
  "/reset-password",
  [
    body("password")
      .isStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
      })
      .trim()
      .withMessage(
        "Password must be greater than 6 and contain at least one uppercase , one lowercase , and one number"
      ),
  ],
  userController.resetpassword
);
// -----------export routes---------------
module.exports = router;
