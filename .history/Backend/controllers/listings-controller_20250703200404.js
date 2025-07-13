// CREATE route: Create a new listing
module.exports.createListing = async (req, res, next) => {
    try {
        const newListing = new Listing(req.body.listing); // Get form data
        newListing.owner = req.user._id; // Attach current user as owner

        // ✅ Handle file upload safely
        if (req.file) {
            newListing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
        }

        await newListing.save(); // Save to DB
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
    } catch (err) {
        next(err); // Pass any error to error handler middleware
    }
};
