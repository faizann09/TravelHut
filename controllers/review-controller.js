
const Review = require("../models/review");
const Listing = require("../models/listing");

module.exports.postReview=async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    newReview.author=req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","New Review Added !");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview=async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("error","Review Deleted !");
    res.redirect(`/listings/${id}`);
};