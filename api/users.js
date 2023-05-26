const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

router.post("/register", async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    let atposition = email.indexOf("@");
    let dotposition = email.lastIndexOf(".");
    if (
      atposition < 1 ||
      dotposition < atposition + 2 ||
      dotposition + 2 >= email.length
    )
      return res.json({ msg: "Invalid email format" });

    let user = await User.findOne({ email });
    if (user) return res.json({ msg: "User already exist" });

    if (name.length < 3)
      return res.json({ msg: "Name should be at least 3 characters" });
    if (username.length < 3)
      return res.json({ msg: "Username should be at least 3 characters" });
    if (password.length < 8)
      return res.json({ msg: "Password should be at least 8 characters" });

    let salt = bcrypt.genSaltSync(10);
    let hashedPassword = bcrypt.hashSync(password, salt);
    let newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
    });
    newUser.save();
    return res.json({ newUser, msg: "Registered successfully" });
  } catch (e) {
    return res.json({ error: e });
  }
});

router.post("/login", async (req, res) => {
  try {
    let { username, password } = req.body;
    let user = await User.findOne({ username });

    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    let isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });
    else {
      try {
        let token = jwt.sign({ data: user }, process.env.SECRET_KEY, {
          expiresIn: "1h",
        });
        // return res.json({ token, user });
        return res.send(token);
      } catch (e) {
        return res.status(400).json({ msg: "Unable to login" });
      }
    }
  } catch (e) {
    return res.status(400).json({ error: e });
  }
});

module.exports = router;
