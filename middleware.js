const Listing = require("./models/listing.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const expressError = require("./utils/expressError.js");

//this function is used to see whether user is logged in or not
module.exports.isLoggedIn = (req, res, next) => {
  // console.log(req.path, "..", req.originalUrl);

  //this is use for directly jump on page after login which user wants to access.
  req.session.redirectUrl = req.originalUrl;

  if (!req.isAuthenticated()) {
    req.flash("error", "User is not Logged In!!");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner.equals(res.locals.curUser._id)) {
    req.flash("error", "You don't have access to Edit Listing");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.isOwnerDel = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner.equals(res.locals.curUser._id)) {
    req.flash("error", "You don't have access to Delete Listing");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

module.exports.validateListing = async (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new expressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new expressError(400, errMsg);
  } else {
    next();
  }
};
