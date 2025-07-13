const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().required().min(0),
    
    category: Joi.string().valid(
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
  }).required().unknown(true)  // ✅ Add .unknown(true) here to allow image or any extra keys
});

