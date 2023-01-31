const express = require('express');
const path = require('path')
const mongoose = require('mongoose');
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


app.get('/', (req,res)=>{
    // res.send('Hello World!');
    res.render('home')
})
app.get('/makecamp', async (req,res)=>{
    const camp = new Campground({title: 'My backyard', description: 'home like stay'});
    await camp.save();
    res.send(camp)
})

app.listen(3000, ()=>{
    console.log('Serving on port 3000!');
})