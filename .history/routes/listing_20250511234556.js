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



router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn,  upload.single('listing[image]'), wrapAsync(listingController.createListing))
    .post((req, res) => {
        res.send(req.file);
    });


//new route 
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
    .get(wrapAsync(listingController.showListings))
    .put(isLoggedIn, isOwned,upload.single('listing[image]'), validateListing,wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwned, wrapAsync(listingController.destroyListing));





//edit route 
router.get("/:id/edit", isLoggedIn, isOwned, wrapAsync(listingController.editListing));

module.exports = router;


