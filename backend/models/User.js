const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Health Profile
    age: Number,
    gender: String,
    bloodGroup: String,
    height: Number, // cm
    weight: Number, // kg
    allergies: [String],
    diseases: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);