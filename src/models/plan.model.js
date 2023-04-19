const Sequelize = require("sequelize");
const sequelize = require("../util/db");

const Plan = sequelize.define("uc_plan", {
  plan_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  plan_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  black_list: {
    type: Sequelize.BOOLEAN,
    allowNull: false,

    default: 1,
  },
  white_list: {
    type: Sequelize.BOOLEAN,
    allowNull: false,

    default: 1,
  },
  universal_forward: {
    type: Sequelize.BOOLEAN,
    allowNull: false,

    default: 1,
  },
  no_answer_forward: {
    type: Sequelize.BOOLEAN,
    allowNull: false,

    default: 1,
  },
  busy_forward: {
    type: Sequelize.BOOLEAN,
    allowNull: false,

    default: 1,
  },
  time_based_forward: {
    type: Sequelize.BOOLEAN,
    allowNull: false,

    default: 1,
  },
  selective_forward: {
    type: Sequelize.BOOLEAN,
    allowNull: false,

    default: 1,
  },
  shift_forward: {
    type: Sequelize.BOOLEAN,
    allowNull: false,

    default: 1,
  },
  unavailable_forward: {
    type: Sequelize.BOOLEAN,
    allowNull: false,

    default: 1,
  },
  redial: {
    type: Sequelize.BOOLEAN,
    allowNull: false,

    default: 1,
  },
  holiday: {
    type: Sequelize.BOOLEAN,
    allowNull: false,

    default: 1,
  },
  week_off: {
    type: Sequelize.BOOLEAN,
    allowNull: false,

    default: 1,
  },
  barge_in: {
    type: Sequelize.BOOLEAN,
    allowNull: false,

    default: 1,
  },
  do_not_disturb: {
    type: Sequelize.BOOLEAN,
    allowNull: false,

    default: 1,
  },
  park: {
    type: Sequelize.BOOLEAN,
    allowNull: false,

    default: 1,
  },
  transfer: {
    type: Sequelize.BOOLEAN,
    allowNull: false,

    default: 1,
  },
  call_recording: {
    type: Sequelize.BOOLEAN,
    allowNull: false,

    default: 1,
  },
  caller_id_block: {
    type: Sequelize.BOOLEAN,
    allowNull: false,

    default: 1,
  },
  call_return: {
    type: Sequelize.BOOLEAN,
    allowNull: false,

    default: 1,
  },
  busy_callback: {
    type: Sequelize.BOOLEAN,
    allowNull: false,

    default: 1,
  },
});

module.exports = Plan;
