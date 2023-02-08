const express = require('express');
const router = express.Router();
const passport = require('passport')
const LocalStrategy = require('passport-local');
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users')

// const { campgroundSchema } = require('../schemas.js'); //Joi validation (npm)
// const ExpressError = require('../utils/ExpressError');

router.get('/register', users.renderRegister)

router.post('/register', catchAsync(users.register))


router.get('/login', users.renderLogin)

router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login', keepSessionInfo: true}), users.loginFlashAndRedir)

router.get('/logout', users.logout); 


module.exports = router;