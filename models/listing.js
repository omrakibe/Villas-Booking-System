const { required } = require("joi");
const mongoose = require("mongoose");
const Review = require("./review.js");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    filename: {
      type: String,
    },
    url: {
      type: String,
      set: function (v) {
        return v === ""
          ? "https://th.bing.com/th/id/OIP.WaXJnwHDuE7_rHoKjQpO8QAAAA?rs=1&pid=ImgDetMain"
          : v;
      },
    },
  },
  price: {
    type: Number,
    // required: true,
  },
  location: {
    type: String,
  },
  country: {
    type: String,
    required: true,
  },
  reviews: [
    
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
