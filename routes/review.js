const express = require("express");
const router = express.Router({ mergeParams: true }); // ✅ Enables access to parent route params like :id

const Review = require("../models/review");
const Listing = require("../models/listing");

const wrapAsync = require("../utils/wrapAsync");
const { validatereview, isLoggedIn, isReviewAuthor } = require("../middleware.js");
const reviewController = require("../controllers/review-controller.js");

// ✅ POST a new review
router.post("/", 
    isLoggedIn,
    validatereview,
    wrapAsync(reviewController.postReview)
);

// ✅ DELETE a review
router.delete("/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewController.destroyReview)
);

module.exports = router;

