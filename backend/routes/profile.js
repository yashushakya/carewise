const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

// GET /api/profile — get current user's profile
router.get("/", auth, async (req, res) => {
     console.log("REQ.USER =", req.user);
  console.log("BODY =", req.body);
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch profile" });
  }
});

// PUT /api/profile — update health profile
router.put("/", auth, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // never allow password update here
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Could not update profile" });
  }
});

module.exports = router;