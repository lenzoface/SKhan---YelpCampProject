const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

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

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({});
    // const c = new Campground({title: 'purple field'});
    // await c.save();
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) +10;
        const camp = new Campground({
            author: '63e368f6ef4ac0a42bddf121', //YOUR USER ID
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                  url: 'https://res.cloudinary.com/dgmgtwci0/image/upload/v1675951772/YelpCamp/hoi9tmorwvjecfkykatd.jpg',
                  filename: 'YelpCamp/hoi9tmorwvjecfkykatd'
                },
                {
                  url: 'https://res.cloudinary.com/dgmgtwci0/image/upload/v1675951772/YelpCamp/wbj7fp68tkh9jp8tvufm.jpg',
                  filename: 'YelpCamp/wbj7fp68tkh9jp8tvufm'
                },
                {
                  url: 'https://res.cloudinary.com/dgmgtwci0/image/upload/v1675951773/YelpCamp/qvynbstlm6myqktf5bu6.jpg',
                  filename: 'YelpCamp/qvynbstlm6myqktf5bu6'
                }
              ],
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ducimus culpa quisquam laboriosam sed sint atque, tenetur similique! Voluptas vero laudantium adipisci, praesentium iusto doloremque ipsa repudiandae voluptatem illum, nobis modi.',
            price,
            geometry: {
              type: 'Point',
              coordinates: [
                cities[random1000].longitude,
                cities[random1000].latitude
              ]}
        })
        await camp.save()
    }
}

seedDB().then(() => {
    console.log('Successfully mixed and remade everything! Bye ///');
    mongoose.connection.close();
});