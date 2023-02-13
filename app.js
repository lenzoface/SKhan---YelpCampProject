if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// console.log(process.env.CLOUDINARY_KEY);


const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash')
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");

const MongoDBStore = require('connect-mongo')


const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp'; // Mongo Atlas DB
// const dbUrl = 'mongodb://127.0.0.1:27017/yelp-camp' //Local DB 
// 'mongodb://127.0.0.1:27017/yelp-camp' // local DB

mongoose.set('strictQuery', true);
main().catch(err => console.log(err));

async function main() {
    try {
        await mongoose.connect(dbUrl);
        console.log('MONGO CONNECTION OPEN');
    } catch (err) {
        console.log('OH NO, MONGO ERORRRRR!');
        console.log(err);
    }
}

// const db = mongoose.connection; - just to shorten the code!

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize())

const secret = process.env.SECRET || 'fakesecret'
//              secret  || dev backup

const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60, // If don't wanna resave all the session on db every single time user refreshes the page, you can lazy update the session, by limiting a period of time. Here 24hrs in seconds 
    crypto: {
        secret
    },
});

store.on('error', function (e) {
    console.log('SESSION STORE ERROR', e);
})

const sessionConfig = {
    store, // store = store
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // security from the third party, default is true by itself
        // secure: true, //httpS, but that isn't gonna work with localhost
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //exp date, default is none (a week here, in miliseconds)
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig)) //sends a cookie stated above
app.use(flash());
// app.use(helmet()); 
// .crossOriginEmbedderPolicy({ policy: "credentialless" } - disables the `crossOriginEmbedderPolicy` middleware but keeps the rest.

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://res.cloudinary.com/dgmgtwci0/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://res.cloudinary.com/dgmgtwci0/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "https://cdn.jsdelivr.net",
    "https://res.cloudinary.com/dgmgtwci0/",
];
const fontSrcUrls = ["https://cdn.jsdelivr.net",];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dgmgtwci0/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
            mediaSrc   : [ "https://res.cloudinary.com/dgmgtwci0/" ],
            childSrc   : [ "blob:" ]
        },
    })
);


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(passport.initialize());
app.use(passport.session()); //use after our own session config
passport.use(new LocalStrategy(User.authenticate()));


app.use((req, res, next) => { //save flash into locals, to pass it without calling it fully in our views/partials pages (flash.ejs)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})




app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
    // res.send('Hello World!');
    res.render('home')
})





app.all('*', (req, res, next) => {
    next(new ExpressError('ERROR 404! PAGE NOT FOUND', 404))
    // res.send('ERROR 404! PAGE NOT FOUND')
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went wrong'
    res.status(statusCode).render('error', { err });
})

// app.use((req, res) => {
//     res.status(404).send('ERROR 404! PAGE NOT FOUND')
// })

app.listen(3000, () => {
    console.log('Serving on port 3000!');
})