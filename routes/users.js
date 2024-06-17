const express = require("express");
const router = express.Router();
const User = require("../models/user");

// @route    POST api/users
// @desc     Create a user
// @access   Public
router.post("/", async (req, res) => {
  const { name, email } = req.body;

  try {
    const newUser = new User({ name, email });
    const user = await newUser.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
