const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

router.get("/signup", async (req, res) => {
  res.render("users/signup.ejs");
});

//signUp Route
router.post(
  "/signup",
  saveRedirectUrl,
  wrapAsync(async (req, res) => {
    try {
      let { username, email, password } = req.body;
      const newUser = new User({ email, username });
      let registerUser = await User.register(newUser, password);

      //This is used automatic login for user after signup.
      req.login(registerUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "Welcome to GreatPark!!");
        res.redirect("/listings");
      });
    } catch (err) {
      req.flash("error", err.message); 
      res.redirect(res.locals.redirectUrl);
    }
  })
);

//Login Route
router.get("/login", async (req, res) => {
  res.render("users/login.ejs");
});

router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash("success", "Login Successfully!!");

    //this is for again redirecting to listings after logout the user.
    let redirectUrl = res.locals.redirectUrl || "/listings";

    res.redirect(redirectUrl);
  }
);

//Logout route
router.get("/logout", async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logged Out!!");
    res.redirect("/login");
  });
});

module.exports = router;
