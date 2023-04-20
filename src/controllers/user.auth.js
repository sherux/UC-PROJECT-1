const jwt = require("jsonwebtoken");

const userauth = (req, res, next) => {
  const token = req.header("user-token");
  if (!token)
    return res
      .status(401)
      .json({ status: 401, message: "please go to the login page" });

  try {
    const varifield = jwt.verify(token, process.env.SECRET_TOKEN);
    req.users = varifield;
    next();
  } catch (err) {
    res.status(400).json({ status: 400, message: "invalid token" });
  }
};

module.exports = userauth;
