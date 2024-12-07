const userModel = require("../models/user.model");
const userServices = require("../services/user.services");
const { validationResult } = require("express-validator");

module.exports.registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullname, email, password } = req.body;
  const hasedPassword = await userModel.hashPassword(password);

  const user = await userServices.createUser({
    firstname:fullname.firstname,
    lastname:fullname.lastname,
    email,
    password: hasedPassword,
  });

  const token = user.generateAuthToken();

  res.status(201).json({ user, token });
};
