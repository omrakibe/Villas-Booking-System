const Joi = require("joi");
const { default: mongoose } = require("mongoose");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.object({
      url: Joi.string().allow("", null),
    }),
    price: Joi.number().required().min(0),
    location: Joi.string(),
    country: Joi.string().required(),
  }).required(),
});

//Review Schema

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    comment: Joi.string().required(),
    rating: Joi.number().required().min(1).max(5),
  }).required(),
});
