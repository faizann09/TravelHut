const User = require("../models/user.js");

// Render Signup Form
module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

// Handle User Signup
module.exports.userSignup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Validate fields
    if (!username || !email || !password) {
      req.flash("error", "All fields are required!");
      return res.redirect("/signup");
    }

    // Create and register user
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    // Automatically log in the user
    req.login(registeredUser, (err) => {
      if (err) {
        console.error("Login after signup error:", err);
        return next(err);
      }
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
    });

  } catch (e) {
    console.error("Signup error:", e);
    let errorMessage = e.message || "Something went wrong during signup.";

    // More user-friendly duplicate email/username error handling
    if (e.name === "UserExistsError") {
      errorMessage = "Username already taken. Please choose another.";
    }
    req.flash("error", errorMessage);
    res.redirect("/signup");
  }
};

// Render Login Form
module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

// Handle User Login
module.exports.login = (req, res) => {
  req.flash("success", "Welcome back to Wanderlust!");
  const redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

// Handle Logout
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
};
