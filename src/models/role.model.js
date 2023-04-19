const Sequelize = require("sequelize");

const sequelize = require("../util/db");

const ROLE = sequelize.define("uc_role", {
  role_id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  role_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = ROLE;
