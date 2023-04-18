const Sequelize = require("sequelize");
const sequelize = require("../util/db");

const Trunk_Mapping = sequelize.define("uc_trunk_mapping", {
  trunk_mapping_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  trunk_group_id: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  t_id: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Trunk_Mapping;
