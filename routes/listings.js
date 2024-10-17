const express = require("express");
const router = express.Router();
const asyncWrap = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {
  isLoggedIn,
  isOwner,
  isOwnerDel,
  validateListing,
} = require("../middleware.js");

//Index Route
router.get(
  "/",
  asyncWrap(async (req, res, next) => {
    let listing = await Listing.find();
    res.render("listing/index.ejs", { listing });
  })
);

// New Route
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listing/new.ejs");
});

//Show Route
router.get(
  "/:id",
  asyncWrap(async (req, res, next) => {
    let { id } = req.params;
    const listings = await Listing.findById(id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("owner");

    if (!listings) {
      req.flash("error", "Listing you requested for does not Exists!!");
      res.redirect("/listings");
    }
    res.render("listing/show.ejs", { listings });
  })
);

//Create Route
router.post(
  "/",
  validateListing,
  isLoggedIn,
  asyncWrap(async (req, res, next) => {
    // let { title, description, price, location, country } = req.body;
    let listing = req.body.listing;
    // console.log(listing);

    listing.owner = req.user._id;

    const listings = new Listing(listing);
    await listings.save();
    req.flash("success", "New Listing Created!!");
    res.redirect("/listings");
  })
);

//edit page
router.get(
  "/:id/edit",
  isLoggedIn,
  asyncWrap(async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing you requested for does not Exists!!");
      res.redirect("/listings");
    }
    res.render("listing/edit.ejs", { listing });
  })
);

//Update Route
router.put(
  "/:id",
  validateListing,
  isLoggedIn,
  isOwner,
  asyncWrap(async (req, res, next) => {
    if (!req.body.listing) {
      throw new Error(400, "Bad Request!!");
    }
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  })
);

// Delete Route
router.delete(
  "/:id",
  isLoggedIn,
  isOwnerDel,
  asyncWrap(async (req, res, next) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("delete", "Listing Deleted!!");
    res.redirect("/listings");
  })
);

module.exports = router;
