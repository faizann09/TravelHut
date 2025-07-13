const joi = require("joi");

module.exports.listingSchema = joi.object({
  listing: joi.object({
    title: joi.string().required(),
    description: joi.string().required(),
    location: joi.string().required(),
    country: joi.string().required(),
    price: joi.number().required().min(0),
    image: joi.string().allow("", null),
    
    // ✅ Add category here
    category: joi.string().valid(
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
      "Boats"
    ).required()
  }).required()
});

module.exports.reviewSchema = joi.object({
  review: joi.object({
    rating: joi.number().required(),
    comment: joi.string().required(),
  }).required()
});
