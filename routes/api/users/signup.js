const express = require("express");
const bcrypt = require("bcrypt");
const joi = require("joi");
const jwt = require("jsonwebtoken");
const User = require("../../../models/User");
const gravatar = require("gravatar");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const schema = joi.object({
      email: joi.string().email().required(),
      password: joi.string().min(6).required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: "400 Bad Request",
        contentType: "application/json",
        responseBody: error.details[0].message,
      });
    }

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        status: "409 Conflict",
        contentType: "application/json",
        responseBody: {
          message: "Email in use",
        },
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const avatarURL = gravatar.url(email, { s: "200", r: "pg", d: "mm" });

    const newUser = new User({
      email,
      password: hashedPassword,
      avatarURL,
    });

    // Generowanie tokena
    const payload = { id: newUser._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    newUser.token = token;

    await newUser.save();

    res.status(201).json({
      status: "201 Created",
      contentType: "application/json",
      responseBody: {
        user: {
          email: newUser.email,
          subscription: newUser.subscription,
          avatarURL: newUser.avatarURL,
          token,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
