const express = require("express");
const userRouter = require("./routes/userRoutes");
const recipeRouter = require("./routes/recipeRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const app = express();

app.use(express.json());
// // app.post("/", (req, res) => {
// //   res.status(200).send("you can upload a data ");
// // });
app.use("/api/users", userRouter);
app.use("/api/recipes", recipeRouter);
app.use("/api/reviews", reviewRouter);

module.exports = app;
