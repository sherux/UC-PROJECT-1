const Sequelize = require("sequelize");
require("dotenv").config({});

// -------------DATABASE CONFIGURATION-------------
const sequelize = new Sequelize(
  "ucdb",
  process.env.username,
  process.env.password,

  {
    dialect: "mysql",
    host: "localhost",
    logging: false,
  }
);

module.exports = sequelize;
