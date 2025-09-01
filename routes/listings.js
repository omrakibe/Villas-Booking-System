require("dotenv").config();
const express = require("express");
const router = express.Router();
const asyncWrap = require("../utils/wrapAsync.js");
const { isLoggedIn, isAdmin, validateListing } = require("../middleware.js");
const multer = require("multer");

// from cloudConfig
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// Controller
const listingController = require("../controler/listing.js");

// ✅ Index (all users can view), Create (only Admin)
router
  .route("/")
  .get(asyncWrap(listingController.index))   // everyone can see listings
  .post(
    isLoggedIn,
    isAdmin,                                // only admin can create
    upload.single("listing[image]"),
    validateListing,
    asyncWrap(listingController.create)
  );

// ✅ New Route (comes BEFORE :id route to avoid CastError)
router.get("/new", isLoggedIn, isAdmin, listingController.renderNewForm);

// ✅ Show, Update, Delete Routes
router
  .route("/:id")
  .get(asyncWrap(listingController.show))   // everyone can see villa details
  .put(
    isLoggedIn,
    isAdmin,                                // only admin can edit
    upload.single("listing[image]"),
    validateListing,
    asyncWrap(listingController.update)
  )
  .delete(
    isLoggedIn,
    isAdmin,                                // only admin can delete
    asyncWrap(listingController.destroy)
  );

// ✅ Edit Page
router.get(
  "/:id/edit",
  isLoggedIn,
  isAdmin,
  asyncWrap(listingController.edit)
);

module.exports = router;
