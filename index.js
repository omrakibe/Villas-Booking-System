const express = require("express");
const app = express();
const mongoose = require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/greatpark";
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

//express-router
const listingRouter = require("./routes/listings.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter = require("./routes/authenticate.js");

const expressError = require("./utils/expressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

const sessionOption = {
  secret: "helloworld!",
  resave: false,
  saveUninitialized: true,
};

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.successMsg = req.flash("success");
  res.locals.delMsg = req.flash("delete");
  res.locals.revSuccess = req.flash("revSuccess");
  res.locals.revDel = req.flash("revDel");
  res.locals.errMsg = req.flash("error");
  res.locals.curUser = req.user;
  next();
});

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.get("/", (req, res) => {
  res.render("home.ejs");
});

//Error handler middleware

app.all("*", (req, res, next) => {
  next(new expressError(404, "Page not Found!!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went Wrong!!" } = err;
  res.status(statusCode).render("error.ejs", { message, err });
  res.status(statusCode).send(message);
});

app.listen(8000, () => {
  console.log("App is Listening to Port 8000");
});
