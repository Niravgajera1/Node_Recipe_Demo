const mongoose = require("mongoose");
const Recipe = require("./recipeModel");
const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "review can not be empty"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    recipe: {
      type: mongoose.Schema.ObjectId,
      ref: "Recipe",
      required: [true, "review belong to recipe"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "review must have a user"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  //   this.populate({
  //     path: "recipe",
  //     select: "name",
  //   }).populate({
  //     path: "user",
  //     select: "name",
  //   });

  this.populate({
    path: "user",
    select: "name",
  });
  next();
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
