const express = require("express");
const router = express.Router();
const asyncWrap = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

//Controller
const listingController = require("../controler/listing.js");

//Index Route
router.get("/", asyncWrap(listingController.index));

// New Route
router.get("/new", isLoggedIn, listingController.new);

//Show Route
router.get("/:id", asyncWrap(listingController.show));

//Create Route
router.post(
  "/",
  validateListing,
  isLoggedIn,
  asyncWrap(listingController.create)
);

//edit page
router.get("/:id/edit", isLoggedIn, asyncWrap(listingController.edit));

//Update Route
router.put(
  "/:id",
  validateListing,
  isLoggedIn,
  isOwner,
  asyncWrap(listingController.update)
);

// Delete Route
router.delete("/:id", isLoggedIn, isOwner, asyncWrap(listingController.delete));

module.exports = router;
