const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

//controller
const userController = require("../controler/user.js");

//signupForm and signup Route
router
  .route("/signup")
  .get(async (req, res) => {
    res.render("users/signup.ejs");
  })
  .post(saveRedirectUrl, wrapAsync(userController.signUp));

//loginForm and Login Route
router
  .route("/login")
  .get(userController.loginPage)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.loginPost
  );

//Logout route
router.get("/logout", userController.logout);

module.exports = router;
