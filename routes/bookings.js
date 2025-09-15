const express = require("express");
const router = express.Router({ mergeParams: true });
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const Razorpay = require("razorpay");
const { isLoggedIn } = require("../middleware");
const nodemailer = require("nodemailer");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App password
  },
});

// 📌 View My Bookings
router.get("/my", isLoggedIn, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate(
      "listing"
    );
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
    req.session.pendingBooking = {
      listingId,
      startDate,
      endDate,
      guests,
      amount,
    };

    res.render("payments/checkout", {
      orderId: order.id,
      amount,
      currency: "INR",
      key_id: process.env.RAZORPAY_KEY_ID,
      listing,
      pendingBooking: req.session.pendingBooking,
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
      paymentStatus: "Paid",
    });

    await booking.save();

    const mailOptions = {
      from: `"GreatPark Villas" <${process.env.EMAIL_USER}>`,
      to: req.user.email,
      subject: "🏡 Your GreatPark Villa Booking is Confirmed!",
      html: `
    <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        
        <div style="text-align: center; margin-bottom: 20px;">
      
          <h2 style="color: #2c3e50;">GreatPark</h2>
          <p style="color: #27ae60; font-size: 18px;">Your booking is confirmed 🎉</p>
        </div>

        <p style="font-size: 16px; color: #444;">Hello <b>${
          req.user.username
        }</b>,</p>
        <p style="font-size: 16px; color: #444;">
          Thank you for booking with <b>GreatPark</b>. Here are your booking details:
        </p>

        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr style="background: #f3f3f3;">
            <td style="padding: 10px; font-weight: bold;">Villa</td>
            <td style="padding: 10px;">${listing.title}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">Location</td>
            <td style="padding: 10px;">${listing.location}, ${
        listing.country
      }</td>
          </tr>
          <tr style="background: #f3f3f3;">
            <td style="padding: 10px; font-weight: bold;">Check-in</td>
            <td style="padding: 10px;">${new Date(
              startDate
            ).toDateString()}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">Check-out</td>
            <td style="padding: 10px;">${new Date(endDate).toDateString()}</td>
          </tr>
          <tr style="background: #f3f3f3;">
            <td style="padding: 10px; font-weight: bold;">Guests</td>
            <td style="padding: 10px;">${guests}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">Payment Status</td>
            <td style="padding: 10px; color: #27ae60;"><b>✔ Paid</b></td>
          </tr>
        </table>

        <div style="margin-top: 25px; text-align: center;">
          <a href="http://localhost:8000/bookings/my" 
             style="background: #27ae60; color: white; padding: 12px 20px; border-radius: 5px; text-decoration: none; font-size: 16px;">
             View My Booking
          </a>
        </div>

        <p style="margin-top: 25px; font-size: 14px; color: #777; text-align: center;">
          We look forward to hosting you! 🏖 <br/>
          – The <b>Om Rakibe and </b> Team
        </p>
      </div>
    </div>
  `,
    };

    await transporter.sendMail(mailOptions);

    req.flash("success", "Booking confirmed! 🎉");
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to confirm booking" });
  }
});

// DELETE - Cancel booking
router.delete("/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params; // bookingId
    const booking = await Booking.findById(id).populate("listing");

    if (!booking) {
      req.flash("error", "Booking not found");
      return res.redirect("/bookings/my");
    }

    const { listing, startDate, endDate } = booking;

    await Booking.findByIdAndDelete(id);

    // Send cancellation email
    await transporter.sendMail({
      from: `"GreatPark Villas" <${process.env.EMAIL_USER}>`,
      to: req.user.email,
      subject: "⚠️ Your Villa Booking Has Been Cancelled",
      html: `<div style="font-family: Arial, sans-serif; background: #f4f6f8; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
    
    <div style="text-align: center; margin-bottom: 25px;">
      <img src="https://img.icons8.com/color/96/000000/cancel.png" alt="Cancelled" style="width: 70px;" />
      <h2 style="color: #e74c3c; margin-top: 10px;">Booking Cancelled</h2>
      <p style="color: #e74c3c; font-size: 18px;">We’re sorry to see you go 😔</p>
    </div>

    <p style="font-size: 16px; color: #444;">Hello <b>${req.user.username}</b>,</p>
    <p style="font-size: 16px; color: #444;">
      Your booking with <b>GreatPark </b> has been successfully cancelled.  
      Below were the details of your booking:
    </p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr style="background: #f9f9f9;">
        <td style="padding: 12px; font-weight: bold;">Villa</td>
        <td style="padding: 12px;">${booking.listing.title}</td>
      </tr>
      <tr>
        <td style="padding: 12px; font-weight: bold;">Location</td>
        <td style="padding: 12px;">${booking.listing.location}, ${booking.listing.country}</td>
      </tr>
      <tr style="background: #f9f9f9;">
        <td style="padding: 12px; font-weight: bold;">Check-in</td>
        <td style="padding: 12px;">${new Date(booking.startDate).toDateString()}</td>
      </tr>
      <tr>
        <td style="padding: 12px; font-weight: bold;">Check-out</td>
        <td style="padding: 12px;">${new Date(booking.endDate).toDateString()}</td>
      </tr>
      <tr style="background: #f9f9f9;">
        <td style="padding: 12px; font-weight: bold;">Guests</td>
        <td style="padding: 12px;">${booking.guests}</td>
      </tr>
    </table>

    <div style="margin: 20px 0; padding: 15px; background: #fdf3f3; border: 1px solid #f5c6cb; border-radius: 6px;">
      <p style="margin: 0; font-size: 15px; color: #e74c3c;">
        💰 A refund has been initiated to your original payment method.  
        It may take <b>5–7 business days</b> to reflect in your account depending on your bank.
      </p>
    </div>

    <div style="text-align: center; margin-top: 25px;">
      <a href="http://localhost:8000/listings" 
         style="background: #3498db; color: white; padding: 12px 25px; border-radius: 6px; text-decoration: none; font-size: 16px;">
         Browse More Villas
      </a>
    </div>

    <p style="margin-top: 25px; font-size: 14px; color: #777; text-align: center;">
      We hope to see you again at GreatPark 🌴<br/>
      – The <b>Om Rakibe & Team</b>
    </p>
  </div>
</div>`,
    });

    req.flash("success", "Booking cancelled");
    res.redirect("/bookings/my");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to cancel booking");
    res.redirect("/bookings/my");
  }
});

module.exports = router;
