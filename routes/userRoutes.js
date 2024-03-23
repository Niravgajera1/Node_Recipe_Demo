const express = require("express");
const userController = require("./../Controller/userController");
const authController = require("./../Controller/authController");
const userRouter = new express.Router();

userRouter
  .route("/")
  .get(
    authController.Protect,
    authController.restrictTo("admin"),
    userController.getAlluser
  );
userRouter.route("/:id").get(authController.Protect, userController.getUser);
userRouter
  .route("/updateme")
  .patch(authController.Protect, userController.updateMe);
userRouter
  .route("/deleteme")
  .delete(authController.Protect, userController.deleteMe);

userRouter.route("/signup").post(authController.signup);
userRouter.route("/login").post(authController.login);
userRouter.route("/forgotpassword").post(authController.forgotPassword);
userRouter.route("/resetpassword/:token").patch(authController.resetPassword);
userRouter
  .route("/updatePassword")
  .patch(authController.Protect, authController.updatePassword);

userRouter
  .route("/makeadmin/:id")
  .patch(
    authController.Protect,
    authController.restrictTo("admin"),
    authController.makeAdmin
  );

module.exports = userRouter;
