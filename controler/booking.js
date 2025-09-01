const Booking = require("../models/booking");
const Listing = require("../models/listing");

module.exports.newForm = async (req, res) => {
  const { listingId } = req.query;
  const listing = await Listing.findById(listingId);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  res.render("booking/new", { listing });
};

module.exports.createBooking = async (req, res) => {
  const { listingId, startDate, endDate, guests } = req.body;
  const listing = await Listing.findById(listingId);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  const booking = new Booking({
    listing: listingId,
    user: req.user._id,
    startDate,
    endDate,
    guests,
  });

  await booking.save();
  req.flash("success", "Your booking has been created!");
  res.redirect(`/listings/${listingId}`);
};

module.exports.myBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).populate("listing");
  res.render("booking/myBookings", { bookings });
};
