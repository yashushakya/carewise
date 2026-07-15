const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const auth = require("../middleware/auth");

// GET /api/reviews?type=doctor&targetName=Dr. Sharma
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.targetName) filter.targetName = req.query.targetName;
    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch reviews" });
  }
});

// POST /api/reviews — add a review
router.post("/", auth, async (req, res) => {
  try {
    const review = await Review.create({ ...req.body, userId: req.user.id });
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: "Could not save review" });
  }
});

module.exports = router;