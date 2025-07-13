const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwned, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings-controller.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });


// ✅ ✅ ✅ COUNTRY SEARCH — this MUST come BEFORE `/:id` route
router.get("/country-search", wrapAsync(async (req, res) => {
    const { country } = req.query;

    if (!country) {
        return res.redirect("/listings");
    }

    const listings = await Listing.find({
        country: { $regex: new RegExp(country, "i") } // Case-insensitive match
    });

    res.render("listings/index", { listings, query: country });
}));


// ✅ GET listings by category
router.get("/category", wrapAsync(async (req, res) => {
    const { name } = req.query;
    if (!name) return res.redirect("/listings");

    const listings = await Listing.find({
        category: { $regex: new RegExp(name, "i") }
    });

    res.render("listings/index", { listings, query: name });
}));


// ✅ LIST ALL LISTINGS + CREATE NEW LISTING
router.route("/")
    .get(wrapAsync(listingController.index))  // Show all listings
    .post(
        isLoggedIn,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.createListing)
    );


// ✅ RENDER NEW LISTING FORM
router.get("/new", isLoggedIn, listingController.renderNewForm);


// ✅ SHOW / EDIT / UPDATE / DELETE a single listing (must be last)
router.route("/:id")
    .get(wrapAsync(listingController.showListings))
    .put(
        isLoggedIn,
        isOwned,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(
        isLoggedIn,
        isOwned,
        wrapAsync(listingController.destroyListing)
    );


// ✅ RENDER EDIT FORM
router.get("/:id/edit",
    isLoggedIn,
    isOwned,
    wrapAsync(listingController.editListing)
);


module.exports = router;



