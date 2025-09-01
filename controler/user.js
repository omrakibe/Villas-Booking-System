const User = require("../models/user.js");
const ADMIN_EMAIL = "omrakibe@greatpark.com";

module.exports.signUp = async (req, res) => {
  try {
    let { username, email, password } = req.body;

    const role = email === ADMIN_EMAIL ? "admin" : "user";


    const newUser = new User({ email, username, role });
    let registerUser = await User.register(newUser, password);

    //This is used automatic login for user after signup.
    req.login(registerUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", `Welcome ${role === "admin" ? "Admin" : "User"}!`);
      res.redirect("/listings");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signup");
  }
};

module.exports.loginPage = async (req, res) => {
  res.render("users/login.ejs");
};

module.exports.loginPost = async (req, res) => {
  req.flash("success", "Login Successfully!!");

  //this is for again redirecting to listings after logout the user.
  let redirectUrl = res.locals.redirectUrl || "/listings";

  res.redirect(redirectUrl);
};

module.exports.logout = async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logged Out!!");
    res.redirect("/login");
  });
};
