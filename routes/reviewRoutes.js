const express = require("express");
const reviewController = require("./../Controller/reviewController");
const authController = require("./../Controller/authController");
const router = new express.Router({ mergeParams: true });

router
  .route("/")
  .get(reviewController.getAllReview)
  .post(authController.Protect, reviewController.createReview);
module.exports = router;
