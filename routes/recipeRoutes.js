const express = require("express");
const recipeController = require("./../Controller/recipeController");
const authController = require("./../Controller/authController");
const reviewRouter = require("./../routes/reviewRoutes");
const recipeRouter = new express.Router();

recipeRouter
  .route("/")
  .get(recipeController.getAllRecipe)
  .post(
    authController.Protect,
    recipeController.uploadImage,
    recipeController.createRecipe
  );

recipeRouter.route("/filter").get(recipeController.getFilterRecipe);
recipeRouter
  .route("/group")
  .get(authController.Protect, recipeController.getGroupRecipe);

recipeRouter
  .route("/:id")
  .get(recipeController.getrecipe)
  .patch(
    authController.Protect,
    recipeController.uploadImage,
    recipeController.updateRecipe
  )
  .delete(
    authController.Protect,
    authController.restrictTo("admin"),
    recipeController.deleteRecipe
  );

recipeRouter.use("/:recipeId/reviews", reviewRouter);

module.exports = recipeRouter;
