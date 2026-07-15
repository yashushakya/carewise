const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const dns=require("dns");
dns.setServers(["1.1.1.1","8.8.8.8"]);

const app = express();

// Middleware



app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://carewise-neon.vercel.app"
  ],
  credentials: true,
}));


app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
 app.use("/api/auth", require("./routes/auth"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/appointments", require("./routes/appointments"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/ai", require("./routes/ai"));

// Health check
app.get("/", (req, res) => res.json({ message: "CareWise API running" }));

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB error:", err));
