const express = require('express');
const router = express.Router();
const passport = require('passport')
const LocalStrategy = require('passport-local');
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users')

// const { campgroundSchema } = require('../schemas.js'); //Joi validation (npm)
// const ExpressError = require('../utils/ExpressError');

router.route('/register')
.get(users.renderRegister)
.post(catchAsync(users.register))

router.route('/login')
.get(users.renderLogin)
.post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login', keepSessionInfo: true}), users.loginFlashAndRedir)

router.get('/logout', users.logout); 

module.exports = router;