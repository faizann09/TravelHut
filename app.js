require("dotenv").config();
console.log(".env loaded regardless of NODE_ENV");

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

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const aiRouter = require("./routes/ai.js");

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

async function init() {
  const dbUrl = process.env.ATLASDB_URL;
  const secret = process.env.SECRET || "thisshouldbeabettersecret";

  try {
    await mongoose.connect(dbUrl);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }

  const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: { secret },
    touchAfter: 24 * 3600,
  });

  store.on("error", (e) => {
    console.error("SESSION STORE ERROR", e);
  });

  const sessionOptions = {
    store,
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  };

  app.use(session(sessionOptions));
  app.use(flash());

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(User.authenticate()));
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

  app.use((req, res, next) => {
    res.locals.message = req.flash("success")[0] || null;
    res.locals.error = req.flash("error")[0] || null;
    res.locals.currUser = req.user;
    next();
  });

  app.use("/listings", listingsRouter);
  app.use("/listings/:id/reviews", reviewsRouter);
  app.use("/", userRouter);
  app.use("/ai", aiRouter);

  app.get("/", (req, res) => {
    res.redirect("/listings");
  });

  app.all("/*splat", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
  });

  app.use((err, req, res, next) => {
    const status = err.status || 500;
    if (!err.message) err.message = "Something went wrong";
    res.status(status).render("error", { err });
  });

  const PORT = process.env.PORT || 8080;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

init();
