require("dotenv").config();

const express = require("express");
const router = express.Router();
const asyncWrap = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const multer = require("multer");

//from cloudConfig
const { storage } = require("../cloudConfig.js");

//this is to upload img in cloudinary storage
const upload = multer({ storage });

//Controller
const listingController = require("../controler/listing.js");

//Index, Create Routes
router
  .route("/")
  .get(asyncWrap(listingController.index))
  .post(
    upload.single("listing[image]"),
    validateListing,
    isLoggedIn,
    asyncWrap(listingController.create)
  );

// New Route
router.get("/new", isLoggedIn, listingController.new);

//Show, Update, Delete Routes
router
  .route("/:id")
  .get(asyncWrap(listingController.show))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    asyncWrap(listingController.update)
  )
  .delete(isLoggedIn, isOwner, asyncWrap(listingController.destroy));

//edit page
router.get("/:id/edit", isLoggedIn, asyncWrap(listingController.edit));

module.exports = router;