const path = require("path");
require("dotenv");
const BASEPATH = path.join(__dirname, "..", "..", "uploads/");
const baseurl = process.env.BASEURL;

const imagurl = baseurl + "images/";
const csvurl = baseurl + "csv/";

const csvPath = BASEPATH + "csv/";
const imagePath = BASEPATH + "images/";
module.exports = { BASEPATH, csvPath, imagePath, imagurl, csvurl };
