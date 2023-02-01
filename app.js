const express = require('express');
const path = require('path')
const mongoose = require('mongoose');
const methodOverride= require('method-override')
const Campground = require('./models/campground')


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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'));

app.get('/', (req,res)=>{
    // res.send('Hello World!');
    res.render('home')
})

app.get('/campgrounds', async (req,res)=>{
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', {campgrounds})
})

app.get('/campgrounds/new', (req,res)=>{
    res.render('campgrounds/new');
})

app.post('/campgrounds', async (req,res)=>{
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
})

app.get('/campgrounds/:id', async (req,res)=>{
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', {campground})
})

app.get('/campgrounds/:id/edit', async (req,res)=>{
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {campground});
})
app.put('/campgrounds/:id', async(req,res)=>{
    // res.send('IT WORKED')
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`)
})

app.delete('/campgrounds/:id', async(req,res)=>{
    const {id}=req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

app.listen(3000, ()=>{
    console.log('Serving on port 3000!');
})