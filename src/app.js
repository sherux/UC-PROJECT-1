const express = require("express");
const app = express();
const CORS = require("cors");
app.use(CORS());
app.options("*", CORS());

require("dotenv").config();
app.use(express.json());
const sequelize = require("./util/db");
const PORT = process.env.PORT;
const fileUpload = require("express-fileupload");

app.use(fileUpload());
// path.join(__dirname, "..", "uploads");

const { BASEPATH } = require("./util/path");
// const { csvPATH } = require("./util/path");

// console.log(path);
// -----------------------all routes and middlware----------------
app.use(express.static(BASEPATH));
// app.use(express.static(csvPATH));

// console.log(__dirname + "../uploads");
const agentRoutes = require("../src/routes/agent.routes");
const planRoutes = require("../src/routes/plan.routes");
const supervisorRoutes = require("../src/routes/supervisor.routes");
const trunkRoutes = require("../src/routes/trunk.routes");
const trunkgroupRoutes = require("../src/routes/trunk_group.routes");
const roleRoutes = require("../src/routes/role.routes");
const moduleRoutes = require("../src/routes/module.routes");
const userRoutes = require("../src/routes/user.routes");

app.use("/agent", agentRoutes);
app.use("/plan", planRoutes);
app.use("/supervisor", supervisorRoutes);
app.use("/trunk", trunkRoutes);
app.use("/trunkgroup", trunkgroupRoutes);
app.use("/role", roleRoutes);
app.use("/module", moduleRoutes);
app.use("/user", userRoutes);

app.use(agentRoutes);
app.use(planRoutes);
app.use(supervisorRoutes);
app.use(trunkRoutes);
app.use(roleRoutes);
app.use(moduleRoutes);
app.use(userRoutes);

// -----------404 middlware---------
app.use("*", (req, res) => {
  res.status(404).json({ status: 404, message: "Please check your url" });
});

// ---------------------------DATABASE CONNECTION----------------------
sequelize
  .sync()
  // .sync({ force: true })
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.log("Error", err);
  });
// ------------------------SERVER CREATE--------------------
app.listen(PORT, () => {
  console.log(`Connected at port ${PORT}`);
});
