const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res, next) => {
  let listing = await Listing.find();

  let category = req.query.category;
  let filterListing = await Listing.find({ category: `${category}` });

  if (category == undefined) {
    res.render("listing/index.ejs", { listing, category });
  } else {
    res.render("listing/index.ejs", { filterListing, category });
  }
};

module.exports.new = (req, res) => {
  res.render("listing/new.ejs");
};

module.exports.show = async (req, res, next) => {
  let { id } = req.params;
  const listings = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listings) {
    req.flash("error", "Listing you requested for does not Exists!!");
    res.redirect("/listings");
  }
  res.render("listing/show.ejs", { listings });
};

module.exports.create = async (req, res, next) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  let url = req.file.path;
  let filename = req.file.filename;

  // let { title, description, price, location, country } = req.body;
  let listing = req.body.listing;

  listing.owner = req.user._id;

  listing.image = { url, filename };

  listing.geometry = response.body.features[0].geometry;

  const listings = new Listing(listing);
  await listings.save();

  req.flash("success", "New Listing Created!!");
  res.redirect("/listings");
};

module.exports.edit = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id).populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not Exists!!");
    res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_200,w_300");

  res.render("listing/edit.ejs", { listing, originalImageUrl });
};

module.exports.update = async (req, res, next) => {
  if (!req.body.listing) {
    throw new Error(400, "Bad Request!!");
  }
  let { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
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

module.exports.destroy = async (req, res, next) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("delete", "Listing Deleted!!");
  res.redirect("/listings");
};

// module.exports.trending = async (req, res, next) => {
//   let category = req.query.category;
//   console.log(category);
//   let listing = await Listing.find({ category: `${category}` });
//   res.render("listing/filter.ejs", { listing, category });
// };
