const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');


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

app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

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