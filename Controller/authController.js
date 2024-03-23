const { promisify } = require("util");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const sendEmail = require("./../utils/email");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statuscode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  user.password = undefined;
  user.active = undefined;
  user.role = undefined;
  res.status(statuscode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      role: req.body.role,
    });
    if (req.body.role === "admin") {
      throw new Error("admin already exists");
    }
    const token = signToken(newUser._id);
    res.status(200).json({
      status: "success",
      token,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error("Please provide email and password", 400);
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new Error("Incorrect email or password", 401);
    }

    createSendToken(user, 200, res);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.Protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new Error("You are not logged in,Please login", 401);
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      throw new Error("User with this ID no longer exists", 401);
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      throw new Error(
        "User recently changed password! Please log in again.",
        401
      );
    }

    req.user = currentUser;
    next();
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log(req.user.role);
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};

exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    throw new Error("user not found with this email addres");
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/users/resetpassword/${resetToken}`;

  const message = `forgot password? send request to resetpassword : ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "your reset password token(valid for 10 minuts)",
      message,
    });

    res.status(201).json({
      status: "success",
      message: "token send to your email",
    });
  } catch (error) {
    (user.passwordResetToken = undefined),
      (user.passwordResetExpires = undefined),
      await user.save({ validateBeforeSave: false });
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const hashToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      throw new Error("Token is invalid or expried");
    }
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    (passwordResetToken = undefined), (passwordResetExpires = undefined);
    await user.save();
    const token = signToken(user._id);
    res.status(200).json({
      status: "success",
      token,
    });
  } catch (error) {
    res.send(error.message, 500);
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("+password");
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      throw new Error("Current Password Dose not match", 401);
    }
    (user.password = req.body.password),
      (user.confirmPassword = req.body.confirmPassword);
    await user.save();
    const token = signToken(user._id);
    res.status(201).json({
      status: "success",
      token,
    });
  } catch (error) {
    res.send(error.message, 500);
  }
};

exports.makeAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      passwordResetExpires: undefined,
      passwordResetToken: undefined,
      passwordChangedAt: undefined,
    });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Check if the user is already an admin
    if (user.role === "admin") {
      return res.status(400).json({
        status: "fail",
        message: "User is already an admin",
      });
    }
    res.status(200).json({
      status: "success",
      message: "User promoted to admin successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to promote user to admin",
      error: error.message,
    });
  }
};
