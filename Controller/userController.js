const User = require("./../models/userModel");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAlluser = async (req, res) => {
  try {
    const data = await User.find();
    res.status(200).json({
      status: "success",
      results: data.length,
      data: {
        data,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new Error("User with this id is not found");
    }
    res.status(201).json({
      status: "success",
      data: {
        data: user,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.updateMe = async (req, res) => {
  try {
    if (req.body.password || req.body.confirmPassword) {
      throw new Error("for update password go to update password");
    }
    const filteredBody = filterObj(req.body, "name", "email");
    const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        data: updateUser,
      },
    });
  } catch (error) {
    res.send(error.message, 500);
  }
};

exports.deleteMe = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({
      status: "success",
      message: "delet User Successfully",
      data: null,
    });
  } catch (error) {
    res.send(error.message, 500);
  }
};
