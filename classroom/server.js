const express = require("express");
const app = express();
const path = require("path");
const users = require("./routes/user.js");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const sessionOption = {
  secret: "thestringisrakibeom",
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

app.use((req, res, next) => {
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  next();
});

app.get("/register", (req, res) => {
  let { name = "Anonymous" } = req.query;
  req.session.name = name;

  if (name === "Anonymous") {
    req.flash("error", "User not registered");
  } else {
    req.flash("success", "User registered successfully");
  }

  res.redirect("/hello");
});

app.get("/hello", (req, res) => {
  res.render("page.ejs", { name: req.session.name });
});

// app.get("/reqcount", (req, res) => {
//   if (req.session.count) {
//     req.session.count++;
//   } else {
//     req.session.count = 1;
//   }

//   res.send(`you sent a request ${req.session.count} times`);
// });

app.get("/test", (req, res) => {
  res.send("test successful!!");
});

app.use("/user", users);
app.use(cookieParser("secretcode"));

app.listen(3000, () => {
  console.log("App is listening to 3000");
});

// app.get("/getsignedcookie", (req, res) => {
//   res.cookie("made-in", "US", { signed: true });
//   res.send("signed cookie sent");
// });

// app.get("/getCookies", (req, res) => {
//   res.cookie("greet", "Hello");
//   res.cookie("Madein", "India");
//   res.send("Sent you cookies");
// });

// app.get("/verify", (req, res) => {
//   console.log(req.signedCookies);
//   res.send("verifed");
// });

// app.get("/greet", (req, res) => {
//   let { name = "Anonymous" } = req.cookies;
//   res.send(`Hii, ${name}`);
// });

// app.get("/", (req, res) => {
//   console.dir(req.cookies);
//   res.send("Hii, Im root!!");
// });
