const Review = require("./../models/reviewModel");

exports.getAllReview = async (req, res) => {
  try {
    let filter = {};
    if (req.params.recipeId) filter = { recipe: req.params.recipeId };
    const review = await Review.find(filter);
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
