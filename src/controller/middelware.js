const jwt = require("jsonwebtoken");
const USER = require("../model/user.models");
const permission = require("../models/permission.schema");

// -------------------------------role wise permission API----------------------
const permisionAuthentication = (module_id, module_name) => {
  return async (req, res, next) => {
    // const token = req.header("staff-token");
    // if (!token) return res.status(401).json("please,login");

    try {
      const varifield = jwt.verify(token, process.env.SECRET_TOKEN);
      console.log(varifield);
      req.users = varifield;
      const getid = varifield.user_id;
      const checkid = await USER.findone({ where: { user_id: getid } });

      const getroleid = checkid[0].role_id;
      console.log("===================================>", getroleid);

      const getpermission = await permission.findOne({
        where: { role_id: getroleid },
      });
      var allow = false;
      getpermission.forEach((element) => {
        if (
          element.module_id == module_id &&
          req.method == "POST" &&
          element.create
        )
          allow = true;
        else if (
          element.module_id == module_id &&
          req.method === "GET" &&
          element.read
        )
          allow = true;
        else if (
          element.module_id == module_id &&
          req.method === "PUT" &&
          element.update
        )
          allow = true;
        else if (
          element.module_id == module_id &&
          req.method === "DELETE" &&
          element.delete
        )
          allow = true;
        else if (
          element.module_id == module_id &&
          req.method === "GET" &&
          element.export
        )
          allow = true;
      });
      if (allow) next();
      else {
        return res
          .status(200)
          .json({ message: `you don't have the access to ${module_name}` });
      }
    } catch (err) {
      res.status(400).json("staff  not found");
    }
  };
};

module.exports = permisionAuthentication;
