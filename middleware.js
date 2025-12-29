const Listing = require("./models/listing");
const Review = require("./models/review.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/expressError.js");

// ✅ Check if the user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash('error', 'You must be logged in to perform this action');
        return res.redirect('/login');
    }
    next();
};

// ✅ Save redirect URL for after login
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

// ✅ Check if the logged-in user is the owner of the listing
module.exports.isOwned = async (req, res, next) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);

        if (!listing) {
            req.flash('error', 'Listing not found');
            return res.redirect('/listings');
        }

        if (!listing.owner || !listing.owner.equals(res.locals.currUser._id)) {
            req.flash('error', 'You are not the owner of this listing');
            return res.redirect(`/listings/${id}`);
        }

        next();
    } catch (err) {
        next(err);
    }
};

// ✅ Validate listing data using Joi
module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(', ');
        return next(new ExpressError(errMsg, 400));
    }
    next();
};

// ✅ Validate review data using Joi
module.exports.validatereview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(', ');
        return next(new ExpressError(errMsg, 400));
    }
    next();
};

// ✅ Check if the logged-in user is the author of the review
module.exports.isReviewAuthor = async (req, res, next) => {
    try {
        const { id, reviewId } = req.params;
        const review = await Review.findById(reviewId);

        if (!review) {
            req.flash('error', 'Review not found');
            return res.redirect(`/listings/${id}`);
        }

        if (!review.author || !review.author.equals(res.locals.currUser._id)) {
            req.flash('error', 'You are not the author of this review');
            return res.redirect(`/listings/${id}`);
        }

        next();
    } catch (err) {
        next(err);
    }
};
