const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwned, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings-controller.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// INDEX & CREATE routes
router.route("/")
    .get(wrapAsync(listingController.index))  // View all listings
    .post(
        isLoggedIn,                            // Ensure user is logged in
        upload.single("listing[image]"),       // Handle image upload
        validateListing,                       // Validate listing data
        wrapAsync(listingController.createListing)  // Create new listing
    );

// NEW listing form
router.get("/new", isLoggedIn, listingController.renderNewForm);  // Render form to create listing

// SHOW, UPDATE, DELETE listing by ID
router.route("/:id")
    .get(wrapAsync(listingController.showListings))  // Show specific listing
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

// EDIT form route
router.get("/:id/edit",
    isLoggedIn,
    isOwned,
    wrapAsync(listingController.editListing)
);

module.exports = router;

