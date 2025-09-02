const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  guests: { type: Number, required: true },

  
  paymentId: String,
  paymentStatus: {
  type: String,
  enum: ["Pending", "Paid", "Failed"],
  default: "Pending"
},

  orderId: String,   // Razorpay order ID
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed"],
    default: "Pending",
  },
});

module.exports = mongoose.model("Booking", bookingSchema);
