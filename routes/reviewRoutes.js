const express = require("express");
const reviewController = require("./../Controller/reviewController");
const authController = require("./../Controller/authController");
const router = new express.Router({ mergeParams: true });

router
  .route("/")
  .get(reviewController.getAllReview)
  .post(authController.Protect, reviewController.createReview);
router
  .route("/:id")
  .delete(
    authController.Protect,
    authController.validateUser,
    reviewController.deleteReview
  );
module.exports = router;
