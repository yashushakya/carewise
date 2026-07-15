const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorName:  { type: String, required: true },
    doctorId:    { type: String, required: true }, // matches id in staticData.js
    specialty:   { type: String },
    hospital:    { type: String },
    date:        { type: String, required: true }, // "2025-03-15"
    time:        { type: String, required: true }, // "10:00 AM"
    reason:      { type: String },

    status: {
      type: String,
      enum: ["Confirmed", "Cancelled", "Completed", "Rescheduled"],
      default: "Confirmed",
    },

    // Reschedule history — every reschedule is logged here
    // This is an array so we keep full history
    rescheduleHistory: [
      {
        previousDate: String,
        previousTime: String,
        rescheduledAt: { type: Date, default: Date.now },
        reason: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
