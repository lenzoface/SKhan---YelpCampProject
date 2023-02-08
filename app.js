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


const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');


mongoose.set('strictQuery', true);
main().catch(err => console.log(err));

async function main() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
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

const sessionConfig = {
    secret: 'fakesecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // security from the third party, default is true by itself
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //exp date, default is none (a week here)
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig)) //sends a cookie stated above
app.use(flash());

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