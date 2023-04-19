const Sequelize = require("sequelize");
const sequelize = require("../util/db");

const Trunk = sequelize.define("uc_trunk", {
  trunk_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sip_trunk_name: {
    type: Sequelize.STRING,
    allowNull: false,
    // defaultValue: [],
  },

  sip_ip: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  sip_port: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  sip_protocol: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  sip_payload_method: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  proxy_ip: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  proxy_port: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  status: {
    type: Sequelize.BOOLEAN,
    allowNull: true,
    default: 1,
  },
  file: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

module.exports = Trunk;
