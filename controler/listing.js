const Listing = require("../models/listing.js");

module.exports.index = async (req, res, next) => {
  let listing = await Listing.find();
  res.render("listing/index.ejs", { listing });
};

module.exports.new = (req, res) => {
  res.render("listing/new.ejs");
};

module.exports.show = async (req, res, next) => {
  let { id } = req.params;
  const listings = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listings) {
    req.flash("error", "Listing you requested for does not Exists!!");
    res.redirect("/listings");
  }
  res.render("listing/show.ejs", { listings });
};

module.exports.create = async (req, res, next) => {
  // let { title, description, price, location, country } = req.body;
  let listing = req.body.listing;
  // console.log(listing);

  listing.owner = req.user._id;

  const listings = new Listing(listing);
  await listings.save();
  req.flash("success", "New Listing Created!!");
  res.redirect("/listings");
};

module.exports.edit = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not Exists!!");
    res.redirect("/listings");
  }
  res.render("listing/edit.ejs", { listing });
};

module.exports.update = async (req, res, next) => {
  if (!req.body.listing) {
    throw new Error(400, "Bad Request!!");
  }
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
};

module.exports.delete = async (req, res, next) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("delete", "Listing Deleted!!");
  res.redirect("/listings");
};