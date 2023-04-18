const Sequelize = require("sequelize");
const sequelize = require("../util/db");

const Agent = sequelize.define("uc_agent", {
  agent_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  first_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  last_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  chat_integration: {
    type: Sequelize.BOOLEAN,
    allowNull: false,

    default: 1,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  timezone_id: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  status: {
    type: Sequelize.BOOLEAN,
    allowNull: false,

    default: 1,
  },
  extension: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

module.exports = Agent;
