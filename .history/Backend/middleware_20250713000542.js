const Listing = require("./models/listing");
const Review = require("./models/review.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/expressError.js");

// Check if the user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash('error', 'You must be logged in to do any changes');
        return res.redirect('/login');
    }
    next();
}

// Save redirect URL to session for redirection after login
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

// Check if the logged-in user is the owner of the listing
module.exports.isOwned = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner._id.equals(res.locals.currUser._id)) {  // Correct comparison for ObjectId
        req.flash('error', 'You are not the owner of this listing');
        return res.redirect(`/listings/${id}`);
    }
    next();
}

// Validate the listing input data
module.exports.validateListing = async (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(', ');
        next(new ExpressError(errMsg, 400)); // ✅ FIXED ORDER
    } else {
        next();
    }
};


// Validate the review input data
module.exports.validatereview = async (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(',');
        next(new ExpressError(400, errMsg));  // Use correct capitalization of ExpressError
    } else {
        next();
    }
};

// Check if the logged-in user is the author of the review
module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review.author._id.equals(res.locals.currUser._id)) {  // Correct comparison for ObjectId
        req.flash('error', 'You are not the Author of this Review');
        return res.redirect(`/listings/${id}`);
    }
    next();
}
