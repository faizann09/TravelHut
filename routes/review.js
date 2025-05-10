const express = require("express");
const router = express.Router({ mergeParams: true }); // IMPORTANT: to access :id from parent

const Review = require("../models/review");
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const {validatereview,isLoggedIn,isReviewAuthor} =require("../middleware.js");
const reviewController=require("../controllers/review-controller.js");


router.post("/",isLoggedIn ,validatereview, wrapAsync(reviewController.postReview));



// DELETE review route (with both :id and :reviewId)
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;
