const Review = require("../models/review");
const Listing = require("../models/listing");

// ✅ POST a new review
module.exports.postReview = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    await newReview.save();                // Save the review
    listing.reviews.push(newReview._id);   // Add review reference to listing
    await listing.save();                  // Save the updated listing

    req.flash("success", "New Review Added!");
    res.redirect(`/listings/${listing._id}`);
};

// ✅ DELETE a review
module.exports.destroyReview = async (req, res) => {
    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
};

