const captainModel = require("../models/captain.model");
const { validationResult } = require("express-validator");
const captainService = require("../services/captain.service");
const blackListTokenModel = require("../models/blacklistToken.model");

/**
 * Register a new Captain
 */
module.exports.registerCaptain = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { fullname, email, password, vehicle, location } = req.body;

    // Check if the captain already exists
    const isCaptainAlreadyExist = await captainModel.findOne({ email });
    if (isCaptainAlreadyExist) {
      return res.status(400).json({ message: "Captain already exists" });
    }

    // Hash the password
    const hashedPassword = await captainModel.hashPassword(password);

    // Register the new captain
    const captain = new captainModel({
      fullname: {
        firstname: fullname.firstname,
        lastname: fullname.lastname,
      },
      email: email,
      password: hashedPassword,
      vehicle: {
        color: vehicle.color,
        plate: vehicle.plate,
        capacity: vehicle.capacity,
        vehicleType: vehicle.vehicleType,
      },
      location: {
        type: "Point",
        coordinates: [location.lng, location.ltd], // Ensure GeoJSON format
      },
      status: "active",
    });

    // Save captain to database
    await captain.save();

    // Generate authentication token
    const token = captain.generateAuthToken();

    res
      .status(201)
      .json({ message: "Captain registered successfully", token, captain });
  } catch (err) {
    console.error(`Error during captain registration: ${err.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Login Captain
 */
module.exports.loginCaptain = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Find captain by email
    const captain = await captainModel.findOne({ email }).select("+password");
    if (!captain) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const isMatch = await captain.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate authentication token
    const token = captain.generateAuthToken();

    // Set the token as an HTTP cookie (optional)
    res.cookie("token", token, { httpOnly: true });

    res.status(200).json({ message: "Login successful", token, captain });
  } catch (err) {
    console.error(`Error during captain login: ${err.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get Captain Profile
 */
module.exports.getCaptainProfile = async (req, res, next) => {
  try {
    res.status(200).json({ captain: req.captain });
  } catch (err) {
    console.error(`Error fetching captain profile: ${err.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Logout Captain
 */
module.exports.logoutCaptain = async (req, res, next) => {
  try {
    // Extract token from cookie or authorization header
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    // Add token to blacklist
    await blackListTokenModel.create({ token });

    // Clear the cookie
    res.clearCookie("token");

    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error(`Error during captain logout: ${err.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};
