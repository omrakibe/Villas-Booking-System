const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const User = require("../models/user");

// Admin Dashboard - see villas + bookings
router.get("/dashboard", async (req, res) => {
  const villas = await Listing.countDocuments();
  const users = await User.countDocuments();
  const bookings = await Booking.find().populate("villa user");

  res.render("admin/dashboard.ejs", { villas, users, bookings });
});

module.exports = router;
