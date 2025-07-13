const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwned, validateListing } = require("../middleware.js");
const User = require('../models/user.js');
const listingController = require("../controllers/listings-controller.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// INDEX & CREATE routes
router.route("/")
    .get(wrapAsync(listingController.index))  // View all listings
    .post(
        isLoggedIn,  // Ensure user is logged in
        upload.single('listing[image]'),  // Handle image upload
        wrapAsync(listingController.createListing)  // Create new listing
    );

// NEW listing form
router.get("/new", isLoggedIn, listingController.renderNewForm);  // Render new listing form

// SHOW, UPDATE, DELETE specific listing by ID
router.route("/:id")
    .get(wrapAsync(listingController.showListings))  // Show specific listing by ID
    .put(
        isLoggedIn,  // Ensure user is logged in
        isOwned,  // Ensure the user owns the listing
        upload.single('listing[image]'),  // Handle image upload
        validateListing,  // Validate the listing
        wrapAsync(listingController.updateListing)  // Update the listing
    )
    .delete(isLoggedIn, isOwned, wrapAsync(listingController.destroyListing));  // Delete the listing

// EDIT form
router.get("/:id/edit", isLoggedIn, isOwned, wrapAsync(listingController.editListing));  // Render edit form

module.exports = router;
