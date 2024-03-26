const User = require("../models/userModel");
const Review = require("./../models/reviewModel");

exports.getAllReview = async (req, res) => {
  try {
    let filter = {};
    if (req.params.recipeId) filter = { recipe: req.params.recipeId };
    const review = await Review.find(filter).populate("user");
    res.status(200).json({
      status: "success",
      results: review.length,
      data: {
        data: review,
      },
    });
  } catch (error) {
    res.send(error.message);
  }
};

exports.createReview = async (req, res) => {
  try {
    if (!req.body.recipe) req.body.recipe = req.params.recipeId;
    if (!req.body.user) req.body.user = req.user.id;
    const newreview = await Review.create(req.body);
    res.status(200).json({
      status: "success",
      data: {
        data: newreview,
      },
    });
  } catch (error) {
    res.send(error.message, 500);
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;

    const isAdmin = req.user.role === "admin";

    const reviewId = req.params.id;
    const review = await Review.findById(reviewId);

    if (!review) {
      res.status(404).json({ message: "with this id no rieview found" });
    }

    if (review.user._id.toString() == userId || isAdmin) {
      await Review.deleteOne({ _id: reviewId });
      res.status(200).json({
        status: "success",
        data: null,
      });
    } else {
      res.status(403).json({ message: "you are not authorized user" });
    }
  } catch (error) {
    res.send(error.message);
  }
};
