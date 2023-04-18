const Sequelize = require("sequelize");

const sequelize = require("../util/db");

const MODULE = sequelize.define("uc_module", {
  module_id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  module_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = MODULE;
