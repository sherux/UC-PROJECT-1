const express = require("express");
const router = express.Router();
const trunkController = require("../controllers/trunk.controller");
const { body, param } = require("express-validator");
const { handleerror } = require("../util/csv");

// Define the custom validator function
const isValidDomainOrIp2 = (value) => {
  const ipPattern = new RegExp(
    "^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
  );
  const domainPattern = new RegExp(
    "^[a-zA-Z0-9][a-zA-Z0-9-_.]{0,61}[a-zA-Z0-9]{0,1}\\.([a-zA-Z]{1,6}|[a-zA-Z0-9-]{1,30}\\.[a-zA-Z]{2,3})$"
  );

  if (value === "") {
    return true;
  } else if (!ipPattern.test(value) && !domainPattern.test(value)) {
    return false;
  } else {
    return true;
  }
};

const validatParam = [
  param("id")
    .trim()
    .isNumeric()
    .withMessage("Please enter a numeric value in id"),
];

const validationdata = [
  body("sipTrunkName")
    .isString()
    .isLength({ min: 3, max: 15 })
    .trim()

    .matches(/^[a-z0-9 ]+$/)
    .withMessage(
      "sip_trunk_name must be alphanumeric and Minimum 3  or maximum 15  characters allowed"
    ),

  body("sipIp")
    .isString()
    .custom(isValidDomainOrIp2)
    .withMessage("Invalid domain or IP address"),

  body("sipPort")
    .isInt({ min: 1, max: 65535 })
    .isNumeric()
    .withMessage("Minimum 1 number and maximum 65535 allowed in sip_port"),

  body("sipProtocol")
    .matches(/\b(?:TLS|TCP|UDP)\b/)
    .withMessage("choose one options in  sip_protocol"),
  body("sipPayloadMethod")
    .matches(/\b(?:SRTP|RTP)\b/)
    .withMessage("choose one options in  sip_payload_method"),
  body("proxyIp")
    .isString()
    .custom(isValidDomainOrIp2)
    .withMessage("Invalid domain or IP address"),
  body("proxyPort")
    .isInt({ min: 1, max: 65535 })
    .isNumeric()
    .withMessage("Minimum 1 number and maximum 65535 allowed in sip_port"),
  body("status")
    .isBoolean()
    .withMessage("Input entered in status must be true or false"),
];

// --------all routes----------------
router.get("/export", trunkController.exportCSV);

router.get("/gettrunks", trunkController.getSerachData);
router.get(
  "/trunk/:id",
  validatParam,
  handleerror,
  trunkController.getTrunkDataById
);
router.delete(
  "/delete/:id",
  validatParam,
  handleerror,
  trunkController.deleteTrunkData
);

router.post(
  "/create",
  validationdata,
  handleerror,

  trunkController.createTrunkData
);

router.put(
  "/update/:id",
  validatParam,
  validationdata,
  trunkController.updateTrunkData
);

// -----------export routes---------------
module.exports = router;
