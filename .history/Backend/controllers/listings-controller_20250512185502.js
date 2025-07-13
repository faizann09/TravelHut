const Listing = require('../models/listing.js');

// INDEX route: Show all listings
module.exports.index = async (req, res) => {
    let allListings = await Listing.find({});
    res.render('listings/index.ejs', { allListings });
};

// NEW form: Render the form for a new listing
module.exports.renderNewForm = (req, res) => {
    res.render("./listings/new.ejs");
};

// SHOW route: Show a specific listing
module.exports.showListings = async (req, res) => {
    let { id } = req.params;  // Correctly access the dynamic parameter 'id'
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested doesn't exist!");
        return res.redirect("/listings");
    }
    res.render("./listings/show.ejs", { listing });
};

// CREATE route: Create a new listing
module.exports.createListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

// EDIT route: Edit a specific listing
module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs", { listing });
};

// UPDATE route: Update a specific listing
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

// DELETE route: Delete a specific listing
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("error", "Listing Deleted!");
    res.redirect("/listings");
};
