const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { object } = require("joi");

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
  price: Number,
  location: String,
  country: String,
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
  category: {
    type: String,
    enum: ["Trending","Rooms","Iconic Cities","Hill Stations","Amazing Pools","Castle","Camping","Farms","Arctic","Domes","Boats"],
  }
});

module.exports = mongoose.model("Listing", listingSchema);
