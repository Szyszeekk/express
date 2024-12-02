const express = require("express");
const authMiddleware = require("../../../authMiddleware");

const router = express.Router();

router.get("/current", authMiddleware, async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
