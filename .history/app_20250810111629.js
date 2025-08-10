require("dotenv").config();
console.log("✅ .env loaded regardless of NODE_ENV");


const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const ExpressError = require("./utils/expressError.js");
const User = require("./models/user.js");

// Routes
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const app = express();

// Set view engine
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// Async init wrapper
async function init() {
    const dbUrl = process.env.ATLASDB_URL;
    const secret = process.env.SECRET || "thisshouldbeabettersecret";

    // Connect MongoDB
    try {
        await mongoose.connect(dbUrl);
        console.log("✅ MongoDB connected successfully");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    }

    // Session Store
    const store = MongoStore.create({
        mongoUrl: dbUrl,
        crypto: {
            secret,
        },
        touchAfter: 24 * 3600,
    });

    store.on("error", function (e) {
        console.log("❌ SESSION STORE ERROR", e);
    });

    console.log("DB URL:", process.env.ATLASDB_URL);


    const sessionOptions = {
        store,
        secret,
        resave: false,
        saveUninitialized: true,
        cookie: {
            httpOnly: true,
            expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
            maxAge: 1000 * 60 * 60 * 24 * 7,
        },
    };

    app.use(session(sessionOptions));
    app.use(flash());

    // Passport
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    // Local variables middleware
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

