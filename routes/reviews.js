const express = require("express");
const router = express.Router({ mergeParams: true });
const asyncWrap = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const expressError = require("../utils/expressError.js");
const { isLoggedIn, validateReview } = require("../middleware.js");

//Review
//Post Route
router.post(
  "/",
  validateReview,
  isLoggedIn,
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    let newReview = new Review(req.body.review);

    newReview.author = req.user._id;
    console.log(newReview);

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("revSuccess", "Review Created Successfully!!");
    res.redirect(`/listings/${listing._id}`);
  })
);

//Delete Review Route
router.delete(
  "/:reviewId",
  isLoggedIn,
  asyncWrap(async (req, res, next) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("revDel", "Review Deleted!!");
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
