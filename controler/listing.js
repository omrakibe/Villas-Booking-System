const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const ADMIN_EMAIL = "omrakibe@greatpark.com"; // define once at top

// INDEX
module.exports.index = async (req, res, next) => {
  let listing = await Listing.find(); 
  let { q, category } = req.query;

  let searchListing = [];
  let filterListing = [];
  let noResults = "";

  if (q) {
    let searchListingByTitle = await Listing.find({ title: { $regex: `${q}`, $options: "i" } });
    let searchListingByCountry = await Listing.find({ country: { $regex: `${q}`, $options: "i" } });
    let searchListingByLocation = await Listing.find({ location: { $regex: `${q}`, $options: "i" } });

    if (searchListingByTitle.length === 0 && searchListingByCountry.length === 0 && searchListingByLocation.length === 0) {
      noResults = "No Such Villa is Available.";
    } else {
      searchListing = [...searchListingByTitle, ...searchListingByCountry, ...searchListingByLocation];
    }
  }

  if (category) {
    filterListing = listing.filter((listings) => listings.category === category);
    if (filterListing.length === 0) {
      noResults = "There is No villa in this Category.";
    }
  }

  res.render("listing/index.ejs", {
    listing:
      searchListing.length > 0
        ? searchListing
        : category
        ? filterListing
        : listing,
    filterListing,
    category,
    noResults,
    q,
    curUser: req.user,
    ADMIN_EMAIL
  });
};

// NEW FORM
module.exports.renderNewForm = (req, res) => {
  res.render("listing/new.ejs", { curUser: req.user, ADMIN_EMAIL });
};

// SHOW
module.exports.show = async (req, res, next) => {
  let { id } = req.params;
  const listings = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listings) {
    req.flash("error", "Listing you requested for does not Exists!!");
    return res.redirect("/listings");
  }

  res.render("listing/show.ejs", { listings, curUser: req.user, ADMIN_EMAIL });
};

// CREATE
module.exports.create = async (req, res, next) => {
  let response = await geocodingClient
    .forwardGeocode({ query: req.body.listing.location, limit: 1 })
    .send();

  let url = req.file.path;
  let filename = req.file.filename;

  let listing = req.body.listing;
  listing.owner = req.user._id;
  listing.image = { url, filename };
  listing.geometry = response.body.features[0].geometry;

  const listings = new Listing(listing);
  await listings.save();

  req.flash("success", "New Listing Created!!");
  res.redirect("/listings");
};

// EDIT
module.exports.edit = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id).populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not Exists!!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url.replace("/upload", "/upload/h_200,w_300");
  res.render("listing/edit.ejs", { listing, originalImageUrl, curUser: req.user, ADMIN_EMAIL });
};

// UPDATE
module.exports.update = async (req, res, next) => {
  if (!req.body.listing) {
    throw new Error(400, "Bad Request!!");
  }
  let { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  let response = await geocodingClient
    .forwardGeocode({ query: req.body.listing.location, limit: 1 })
    .send();

  listing.geometry = response.body.features[0].geometry;
  await listing.save();

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  res.redirect(`/listings/${id}`);
};

// DESTROY
module.exports.destroy = async (req, res, next) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("delete", "Listing Deleted!!");
  res.redirect("/listings");
};
