const express = require("express");
const router  = express.Router();
const Appointment  = require("../models/Appointment");

const auth = require("../middleware/auth");

const ALL_SLOTS = [
  "09:00 AM","09:30 AM","10:00 AM","10:30 AM",
  "11:00 AM","11:30 AM","12:00 PM","02:00 PM",
  "02:30 PM","03:00 PM","03:30 PM","04:00 PM",
  "04:30 PM","05:00 PM",
];

// GET /api/appointments/slots?doctorId=1&date=2025-03-15
router.get("/slots", async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) return res.status(400).json({ message: "doctorId and date required." });

    const booked = await Appointment.find({
      doctorId, date, status: { $in: ["Confirmed", "Rescheduled"] },
    }).select("time");

    const bookedSlots    = booked.map((a) => a.time);
    const availableSlots = ALL_SLOTS.filter((s) => !bookedSlots.includes(s));
    res.json({ availableSlots, bookedSlots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/appointments
router.post("/", auth, async (req, res) => {
  try {
    const { doctorName, doctorId, specialty, hospital, date, time, reason } = req.body;
    if (!doctorName || !doctorId || !date || !time) {
      return res.status(400).json({ message: "Doctor, date, and time are required." });
    }

    // Check if slot is already taken
    const taken = await Appointment.findOne({
      doctorId, date, time, status: { $in: ["Confirmed", "Rescheduled"] },
    });
    if (taken) return res.status(409).json({ message: "Slot already booked. Choose another time." });

    const appointment = await Appointment.create({
      userId: req.user.id, doctorName, doctorId, specialty, hospital, date, time, reason,
    });

   

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/appointments
router.get("/", auth, async (req, res) => {
  try {
    const list = await Appointment.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/appointments/:id/reschedule
router.put("/:id/reschedule", auth, async (req, res) => {
  try {
    const { newDate, newTime, reason } = req.body;
    if (!newDate || !newTime) return res.status(400).json({ message: "New date and time required." });

    const appt = await Appointment.findOne({ _id: req.params.id, userId: req.user.id });
    if (!appt) return res.status(404).json({ message: "Appointment not found." });
    if (appt.status === "Cancelled") return res.status(400).json({ message: "Cannot reschedule cancelled appointment." });

    // Check new slot availability
    const taken = await Appointment.findOne({
      doctorId: appt.doctorId, date: newDate, time: newTime,
      status: { $in: ["Confirmed", "Rescheduled"] },
      _id: { $ne: appt._id },
    });
    if (taken) return res.status(409).json({ message: "That slot is already booked." });

    appt.rescheduleHistory.push({
      previousDate: appt.date,
      previousTime: appt.time,
      reason: reason || "No reason provided",
    });
    appt.date   = newDate;
    appt.time   = newTime;
    appt.status = "Rescheduled";
    await appt.save();


    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/appointments/:id/cancel
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const appt = await Appointment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status: "Cancelled" },
      { new: true }
    );
    if (!appt) return res.status(404).json({ message: "Appointment not found." });

   

    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;