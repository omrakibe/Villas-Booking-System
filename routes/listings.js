const express = require("express");
const router = express.Router();
const asyncWrap = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
//Controller
const listingController = require("../controler/listing.js");

//Index, Create Routes
router
  .route("/")
  .get(asyncWrap(listingController.index))
  .post(validateListing, isLoggedIn, asyncWrap(listingController.create));

// New Route
router.get("/new", isLoggedIn, listingController.new);

//Show, Update, Delete Routes
router
  .route("/:id")
  .get(asyncWrap(listingController.show))
  .put(
    validateListing,
    isLoggedIn,
    isOwner,
    asyncWrap(listingController.update)
  )
  .delete(isLoggedIn, isOwner, asyncWrap(listingController.destroy));

//edit page
router.get("/:id/edit", isLoggedIn, asyncWrap(listingController.edit));

module.exports = router;
