const express = require("express");
const router = express.Router({ mergeParams: true });
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const Razorpay = require("razorpay");
const { isLoggedIn } = require("../middleware");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 📌 View My Bookings
router.get("/my", isLoggedIn, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate("listing");
    res.render("bookings/myBookings", { bookings });
  } catch (err) {
    console.error(err);
    req.flash("error", "Unable to fetch bookings");
    res.redirect("/listings");
  }
});

router.post("/:listingId", isLoggedIn, async (req, res) => {
  try {
    const { listingId } = req.params;
    const { startDate, endDate, guests } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    const amount = listing.price * 100; // in paise

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    // ✅ Corrected: use listingId, not id
    req.session.pendingBooking = { listingId, startDate, endDate, guests, amount };

    res.render("payments/checkout", {
      orderId: order.id,
      amount,
      currency: "INR",
      key_id: process.env.RAZORPAY_KEY_ID,
      listing,
      pendingBooking: req.session.pendingBooking  
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Payment initiation failed");
    res.redirect("/listings");
  }
});

// ✅ Confirm Booking after successful Razorpay payment
router.post("/:id/confirm", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params; // listingId
    const { razorpay_payment_id, startDate, endDate, guests } = req.body;

    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    // Save confirmed booking
    const booking = new Booking({
      listing: listing._id,
      user: req.user._id,
      startDate,
      endDate,
      guests,
      paymentId: razorpay_payment_id,
      paymentStatus: "Paid"
    });

    await booking.save();

    req.flash("success", "Booking confirmed! 🎉");
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to confirm booking" });
  }
});


// DELETE - Cancel booking
router.delete("/:bookingId", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    await Booking.findByIdAndDelete(id);
    req.flash("success", "Booking cancelled");
    res.redirect("/bookings/my");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to cancel booking");
    res.redirect("/bookings/my");
  }
});


module.exports = router;
