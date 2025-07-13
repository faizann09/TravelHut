const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,
    filename: String,
  },
  price: {
    type: Number,
    required: true,  // Added required validation for price if necessary
  },
  location: {
    type: String,
    required: true,  // Add validation to ensure location is provided
  },
  country: {
    type: String,
    required: true,  // Add validation to ensure country is provided
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
    required: true,  // Ensure that the owner field is always provided
  },
  category: {
    type: String,
    enum: [
      "Trending",
      "Rooms",
      "Iconic Cities",
      "Hill Stations",
      "Amazing Pools",
      "Castle",
      "Camping",
      "Farms",
      "Arctic",
      "Domes",
      "Boats",
    ],
    required: true,  // Ensure that a category is always selected
  },
});

module.exports = mongoose.model("Listing", listingSchema);
