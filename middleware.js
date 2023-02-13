const { campgroundSchema, reviewSchema } = require('./schemas.js'); //Joi validation (npm)
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review')


// Prevent access to routes and  requests: 
//no acces to the page without signing in, but u still can use postman to send requests, if you won't put it in router.post/delete, etc.
module.exports.isLoggedIn = (req, res, next) => { //safe measures from requests through postman, etc.
    if (!req.isAuthenticated()) {
        //store the url they are requiring:
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in!');
        return res.redirect('/login')
    }
    next()
};

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => { //safe measures from requests through postman, etc.
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!req.user.id === '63ea244c31da5c71b6c34394' || '63ea16006d523c60eb476e1e') {// local and atlas admin
        if (!campground.author.equals(req.user._id)) { //preventing unauthorized user to make changes
            req.flash('error', 'You do not have permission to do that!');
            return res.redirect(`/campgrounds/${id}`)
        }
        return
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!req.user.id === '63ea244c31da5c71b6c34394' || '63ea16006d523c60eb476e1e') { // local and atlas admin
        if (!review.author.equals(req.user._id)) { //preventing unauthorized user to make changes
            req.flash('error', 'You do not have permission to do that!');
            return res.redirect(`/campgrounds/${id}`)
        }
        return
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}