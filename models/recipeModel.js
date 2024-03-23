const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      //required: true,
    },
    description: {
      type: String,
      //required: true,
    },
    steps: Array,
    createby: {
      type: String,
      // required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    ingredients: Array,
    difficulty: {
      type: String,
      // required: [true, "difficulty is require"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "difficulty is either : easy,medium,difficult",
      },
    },
    cookTime: String,
    images: {
      type: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

recipeSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "recipe",
  localField: "_id",
});

const Recipe = mongoose.model("Recipe", recipeSchema);
module.exports = Recipe;
