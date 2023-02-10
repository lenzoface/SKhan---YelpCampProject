const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');


// https://res.cloudinary.com/demo/image/upload/w_500,h_300,c_fill/shoe.jpg


const CampgroundSchema = new Schema({
    title: String,
    images: [{
        url: String,
        filename: String
    }],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});


// reviews under camp will be deleted too, using this delete middleware
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

CampgroundSchema.path('images').schema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload/', '/upload/w_200/')
});

// const storage = new CloudinaryStorage({
//     cloudinary,
//     params: {
//         folder: 'YelpCamp',
//         allowedFormats: ['jpeg', 'png', 'jpg', 'heic'],
//         transformation: [
//             { width: 400, height: 300, gravity: "auto", crop: "fill" },
//         ], 
//         format: 'jpg'
//     }
// });

module.exports = mongoose.model('Campground', CampgroundSchema)