const express = require("express");
const router = express.Router({ mergeParams: true });
const asyncWrap = require("../utils/wrapAsync.js");
const expressError = require("../utils/expressError.js");
const {
  isLoggedIn,
  validateReview,
  isReviewAuthorOrAdmin,
} = require("../middleware.js");

//Controller
const reviewController = require("../controler/review.js");

//Review
//Post Route
router.post(
  "/",
  validateReview,
  isLoggedIn,
  asyncWrap(reviewController.createReview)
);

//Delete Review Route
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthorOrAdmin,
  asyncWrap(reviewController.destroyReview)
);


module.exports = router;
