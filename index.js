require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");

// Mongo Atlas URL
const dbUrl = process.env.ATLASDB_URL;

const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

// Routers
const listingRouter = require("./routes/listings.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter = require("./routes/authenticate.js");
const adminRouter = require("./routes/admin.js"); // ✅ new
const bookingRouter = require("./routes/bookings");

const expressError = require("./utils/expressError.js");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");

// Middleware
const { isLoggedIn, isAdmin } = require("./middleware.js");

app.use((req, res, next) => {
  res.locals.curUser = req.user; 
  next();
});


// View engine & public
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

// Mongo Session Store
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: { secret: process.env.SECRET_CODE },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("error in Mongo Session", err);
});

const sessionOption = {
  store,
  secret: process.env.SECRET_CODE,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOption));
app.use(flash());

// Passport config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash messages & current user middleware
app.use((req, res, next) => {
  res.locals.successMsg = req.flash("success");
  res.locals.delMsg = req.flash("delete");
  res.locals.revSuccess = req.flash("revSuccess");
  res.locals.revDel = req.flash("revDel");
  res.locals.errMsg = req.flash("error");
  res.locals.curUser = req.user;
  next();
});

// Mongo connection
main()
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbUrl, {
    serverSelectionTimeoutMS: 20000, // 20 seconds
  });
}

// Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.use("/bookings", bookingRouter);
app.use("/listings/:id/bookings", bookingRouter);

// 🔑 Admin-only routes
app.use("/admin", isLoggedIn, isAdmin, adminRouter);

app.get("/", (req, res) => {
  res.render("home.ejs");
});

// Error handler
app.all("*", (req, res, next) => {
  next(new expressError(404, "Page not Found!!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went Wrong!!" } = err;
  res.status(statusCode).render("error.ejs", { message, err });
});

app.listen(8000, () => {
  console.log("App is Listening to Port 8000");
});
