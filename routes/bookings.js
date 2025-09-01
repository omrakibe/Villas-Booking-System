const express = require("express");
const router = express.Router({ mergeParams: true });
const Booking = require("../models/booking");
const { isLoggedIn } = require("../middleware");

// Create a booking
router.post("/", isLoggedIn, async (req, res) => {
  const { id } = req.params; // villa/listing id
  const { startDate, endDate, guests } = req.body;

  const booking = new Booking({
    listing: id,
    user: req.user._id,
    startDate,
    endDate,
    guests,
  });

  await booking.save();
  req.flash("success", "Booking created successfully!");
  res.redirect("/bookings");
});

// Show all bookings for logged-in user
router.get("/", isLoggedIn, async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("listing");
  res.render("bookings/index.ejs", { bookings });
});

// Cancel booking
router.delete("/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;

  await Booking.findByIdAndDelete(id);

  req.flash("success", "Booking cancelled successfully!");
  res.redirect("/bookings");
});


module.exports = router;
