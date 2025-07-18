// Load environment variables from .env file if not in production
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// Required modules
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const ExpressError = require("./utils/expressError.js");
const User = require("./models/user.js");

// Routers
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require('./routes/review.js');
const userRouter = require("./routes/user.js");

// Initialize app
const app = express();

// MongoDB connection (Atlas only)
const dbUrl = process.env.ATLASDB_URL;

// ✅ Debug log to verify environment variable
console.log("✅ Loaded ATLASDB_URL from .env:", dbUrl);

async function main() {
    try {
        await mongoose.connect(dbUrl);
        console.log("✅ MongoDB connected successfully");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1); // Stop the app if DB doesn't connect
    }
}

main();

// View engine and middleware setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// Session configuration
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET || "thisshouldbeabettersecret",
    },
    touchAfter: 24 * 3600, // time period in seconds
});

store.on("error", function (e) {
    console.log("❌ SESSION STORE ERROR", e);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET || "thisshouldbeabettersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
};

app.use(session(sessionOptions));
app.use(flash());

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash and user info in locals
app.use((req, res, next) => {
    res.locals.message = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// Routes
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

app.get("/", (req, res) => {
    res.redirect("/listings");
});

// 404 handler
app.all("/*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

// General error handler
app.use((err, req, res, next) => {
    const status = err.status || 500;
    if (res.headersSent) return next(err); // avoid double render
    res.status(status).render("error", { err });
});

// Server listener
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
