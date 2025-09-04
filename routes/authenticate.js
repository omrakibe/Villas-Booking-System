const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controler/user.js");

router
  .route("/signup")
  .get((req, res) => {
    res.render("users/signup.ejs");
  })

  .post(saveRedirectUrl, wrapAsync(userController.signUp));


router.get("/verify-otp", userController.verifyOtpPage);


router.post("/verify-otp", wrapAsync(userController.verifyOtp));


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



router.get("/logout", userController.logout);

// Forgot Password - Enter Email
router.get("/forgot-password", (req, res) => {
  res.render("users/forgotPassword");
});

router.post("/forgot-password", userController.forgotPassword);

// Reset Password Form
router.get("/reset-password/:token", userController.resetPasswordPage);
router.post("/reset-password/:token", userController.resetPassword);


module.exports = router;
