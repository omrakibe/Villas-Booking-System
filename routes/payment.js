const express = require("express");
const router = express.Router();
const razorpay = require("../utils/razorpay");
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware");

// POST - Create order and provisional booking
router.post("/order/:listingId", isLoggedIn, async (req, res) => {
  try {
    const { listingId } = req.params;
    const { startDate, endDate, guests } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).send("Listing not found");

    const nights =
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (1000 * 60 * 60 * 24);

    const amount = listing.price * nights;

    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    // Save booking with Pending status
    const booking = new Booking({
      listing: listing._id,
      user: req.user._id,
      startDate,
      endDate,
      guests,
      orderId: order.id,
      paymentStatus: "Pending",
    });

    await booking.save();

    res.json({ order, bookingId: booking._id });
  } catch (err) {
    console.error(err);
    res.status(500).send("Payment initiation failed");
  }
});

// ✅ Verify Payment
router.post("/verify", isLoggedIn, async (req, res) => {
  try {
    const { bookingId, razorpay_payment_id } = req.body;

    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: "Paid",
      paymentId: razorpay_payment_id,
    });

    req.flash("success", "Payment Successful! Booking Confirmed ✅");
    res.redirect("/bookings/my");
  } catch (err) {
    console.error(err);
    res.status(500).send("Verification failed");
  }
});


module.exports = router;
