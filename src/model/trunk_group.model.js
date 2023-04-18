const Sequelize = require("sequelize");
const sequelize = require("../util/db");

const Trunk_Group = sequelize.define("uc_trunk_group", {
  trunk_group_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  trunk_group_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  status: {
    type: Sequelize.BOOLEAN,
    allowNull: true,
    default: 1,
  },
  lcr: {
    type: Sequelize.BOOLEAN,
    allowNull: true,
    default: 1,
  },
});

module.exports = Trunk_Group;
