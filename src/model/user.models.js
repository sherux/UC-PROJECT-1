const Sequelize = require("sequelize");

const sequelize = require("../util/db");

const USER = sequelize.define("uc_user", {
  user_id: {
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
  date_of_birth: {
    type: Sequelize.DATEONLY,
    allowNull: false,
  },
  mobile_no: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  gender: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  address: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  status: {
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
  role_id: {
    type: Sequelize.INTEGER,
    foreignKey: true,
    allowNull: false,
  },
  image_profile: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  permission_list: {
    type: Sequelize.ARRAY(Sequelize.STRING),
    allowNull: true,
    default: "",
  },
  token: {
    type: Sequelize.STRING,
    allowNull: true,
    default: "",
  },
  timezone: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

module.exports = USER;
