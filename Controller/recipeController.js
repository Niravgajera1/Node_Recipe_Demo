const Recipe = require("./../models/recipeModel");
const multer = require("multer");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "img");
  },

  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `user-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    throw new Error("not a image Upload only image", 400);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadImage = upload.single("images");

exports.createRecipe = async (req, res) => {
  try {
    const newRecipe = await Recipe.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        data: newRecipe,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.getAllRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.find();
    res.status(200).json({
      satus: "success",
      results: recipe.length,
      data: {
        data: recipe,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.getrecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate("reviews");
    console.log(recipe);
    if (!recipe) {
      throw new Error("recipe with this id is not found");
    }
    res.status(200).json({
      status: "success",
      data: {
        data: recipe,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.updateRecipe = async (req, res) => {
  try {
    const filterBody = filterObj(req.body);
    if (req.file) filterBody.images = req.file.filename;
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, filterBody, {
      new: true,
      runValidators: true,
    });
    if (!recipe) {
      throw new Error("no recipe found with this id");
    }
    res.status(201).json({
      status: "success",
      data: {
        data: recipe,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: error.message,
    });
  }
};

exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) {
      throw new Error("No recipe Found With This Id", 404);
    }
    res.status(204).json({
      status: "success",
      data: {
        data: "Recipe Deleted Successfully",
      },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.getFilterRecipe = async (req, res) => {
  try {
    //filtering
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);
    let query = Recipe.find(queryObj);
    /// sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    //// field
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    const recipe = await query;
    res.status(200).json({
      satus: "success",
      results: recipe.length,
      data: {
        data: recipe,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.getGroupRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.aggregate([
      {
        $group: {
          _id: "$difficulty",
          num: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json({
      status: "success",
      data: {
        recipe,
      },
    });
  } catch (error) {
    res.send(error.message, 500);
  }
};
