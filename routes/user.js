const express = require('express');
const router = express.Router();
const passport = require("passport");

const User = require("../models/user.js");
const wrapAsync = require('../utils/wrapAsync.js');
const { saveRedirectUrl } = require('../middleware.js');
const userController = require("../controllers/user-controller.js");

// Signup Routes
router.route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.userSignup));

// Login Routes
router.route("/login")
    .get(userController.renderLoginForm)
    .post(
        saveRedirectUrl,
        passport.authenticate('local', {
            failureRedirect: '/login',
            failureFlash: true
        }),
        userController.login // no wrapAsync here
    );

// Logout Route
router.get("/logout", userController.logout);

module.exports = router;
