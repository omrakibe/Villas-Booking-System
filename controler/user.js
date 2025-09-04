const User = require("../models/user.js");
const nodemailer = require("nodemailer");
const ADMIN_EMAIL = "omrakibe@greatpark.com";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // app password
  },
});


module.exports.signUp = async (req, res) => {
  try {
    let { username, email, password } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    req.session.tempUser = { username, email, password };
    req.session.otp = otp;
  
    await transporter.sendMail({
      from: `"GreatPark Villas" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "GreatPark Email Verification - OTP",
     html: `
        <h2>Welcome to GreatPark Villas ✨</h2>
        <p>Hi <b>${username}</b>, Thank you for signing up with <b>GreatPark Villas 🏡</b></p>
        
        <p>To complete your signup, please verify your email address using the OTP below:</p>

        <h3 style="color:#2c3e50;">Your OTP Code: <b>${otp}</b></h3>

        <p>This code is valid for <b>10 minutes</b>. Please do not share it with anyone.</p>

        <p>If you did not request this, you can safely ignore this email.</p>
        <br>
        <p>Best regards, <br>
        Om Rakibe</p>
      `,
    });

    req.flash("success", "OTP sent to your email. Please verify.");
    res.redirect("/verify-otp");
  } catch (err) {
    console.error(err);
    req.flash("error", "Error during signup. Try again.");
    res.redirect("/signup");
  }
};


module.exports.verifyOtpPage = (req, res) => {
  res.render("users/verifyOtp.ejs");
};


module.exports.verifyOtp = async (req, res, next) => {
  try {
    const { otp } = req.body;

    if (!req.session.tempUser) {
      req.flash("error", "Session expired. Please signup again.");
      return res.redirect("/signup");
    }

    if (otp !== req.session.otp) {
      req.flash("error", "Invalid OTP. Please try again.");
      return res.redirect("/verify-otp");
    }

    const { username, email, password } = req.session.tempUser;
    const role = email === ADMIN_EMAIL ? "admin" : "user";

    const newUser = new User({ email, username, role });
    let registerUser = await User.register(newUser, password);

    // Auto login
    req.login(registerUser, (err) => {
      if (err) return next(err);

      // Clear session temp data
      delete req.session.tempUser;
      delete req.session.otp;

      req.flash("success", `Welcome ${role === "admin" ? "Admin" : "User"}!`);
      res.redirect("/listings");
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "OTP verification failed.");
    res.redirect("/signup");
  }
};

module.exports.loginPage = async (req, res) => {
  res.render("users/login.ejs");
};


module.exports.loginPost = async (req, res) => {
  req.flash("success", "Login Successfully!!");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};


module.exports.logout = async (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Logged Out!!");
    res.redirect("/login");
  });
};
