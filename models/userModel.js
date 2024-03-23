const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "user name is require"],
  },
  email: {
    type: String,
    required: [true, "user email addres is require"],
    unique: true,
    validate: [validator.isEmail, "Enter valid Email Id"],
  },
  password: {
    type: String,
    required: [true, "password is require"],
    minlength: 8,
  },
  confirmPassword: {
    type: String,
    required: [true, "password confirm is require"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "passwords are not same",
    },
  },
  photo: String,
  role: {
    type: String,
    default: "user",
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre("find", function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatepassword,
  userpassword
) {
  return await bcrypt.compare(candidatepassword, userpassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  // Generate a random reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash the reset token
  const hashedResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set the hashed token and expiration time
  this.passwordResetToken = hashedResetToken;
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes
  console.log({ resetToken }, this.passwordResetToken);

  // Return the unhashed reset token for sending it to the user
  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
