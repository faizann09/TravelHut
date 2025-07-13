const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwned, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings-controller.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });


// ✅ ✅ ✅ STEP 1: Country Search route
router.get("/country-search", wrapAsync(async (req, res) => {
    const { country } = req.query;
    if (!country) return res.redirect("/listings");

    const listings = await Listing.find({
        country: { $regex: new RegExp(country, "i") }
    });

    res.render("listings/index", { listings, query: country });
}));


// ✅ STEP 2: Main listing route
router.route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.createListing)
    );

// ✅ STEP 3: New listing form
router.get("/new", isLoggedIn, listingController.renderNewForm);


// ✅ ✅ ✅ STEP 4: Make sure this is LAST
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

router.get("/:id/edit",
    isLoggedIn,
    isOwned,
    wrapAsync(listingController.editListing)
);

module.exports = router;



