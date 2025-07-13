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
    await newReview.save();

    // ✅ Use updateOne to avoid triggering validation errors (e.g. missing category)
    await Listing.updateOne(
        { _id: listing._id },
        { $push: { reviews: newReview._id } }
    );

    req.flash("success", "New Review Added!");
    res.redirect(`/listings/${listing._id}`);
};

// ✅ DELETE a review
module.exports.destroyReview = async (req, res) => {
    const { id, reviewId } = req.params;

    // ✅ Remove review reference from the listing
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // ✅ Delete the review document itself
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
};
