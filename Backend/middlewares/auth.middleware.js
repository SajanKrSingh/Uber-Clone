const userModel = require("../models/user.model");
const captainModel = require("../models/captain.model");
const blackListTokenModel = require("../models/blackListToken.model");
const jwt = require("jsonwebtoken");

module.exports.authUser = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("Token Missing");
    return res.status(401).json({ message: "Unauthorized: Token Missing" });
  }

  try {
    const isBlacklisted = await blackListTokenModel.findOne({ token });
    if (isBlacklisted) {
      console.log("Token Blacklisted");
      return res
        .status(401)
        .json({ message: "Unauthorized: Blacklisted Token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);

    const user = await userModel.findById(decoded._id);
    if (!user) {
      console.log("User Not Found");
      return res.status(401).json({ message: "Unauthorized: User Not Found" });
    }

    req.user = user; // Attach user info to the request
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid or Expired Token" });
  }
};

module.exports.authCaptain = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("Token Missing");
    return res.status(401).json({ message: "Unauthorized: Token Missing" });
  }

  try {
    const isBlacklisted = await blackListTokenModel.findOne({ token });
    if (isBlacklisted) {
      console.log("Token Blacklisted");
      return res
        .status(401)
        .json({ message: "Unauthorized: Blacklisted Token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);

    const captain = await captainModel.findById(decoded._id);
    if (!captain) {
      console.log("Captain Not Found");
      return res
        .status(401)
        .json({ message: "Unauthorized: Captain Not Found" });
    }

    req.captain = captain; // Attach captain info to the request
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid or Expired Token" });
  }
};
