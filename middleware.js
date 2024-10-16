const Listing = require("./models/listing.js");

//this function is used to see whether user is logged in or not
module.exports.isLoggedIn = (req, res, next) => {
  // console.log(req.path, "..", req.originalUrl);

  //this is use for directly jump on page after login which user wants to access.
  req.session.redirectUrl = req.originalUrl;

  if (!req.isAuthenticated()) {
    req.flash("error", "User is not Logged in to Create Listing!!");
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
};

module.exports.isOwnerDel = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner.equals(res.locals.curUser._id)) {
    req.flash("error", "You don't have access to Delete Listing");
    return res.redirect(`/listings/${id}`);
  }
};
