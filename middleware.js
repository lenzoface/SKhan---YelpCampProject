// Prevent access to routes and  requests: 
//no acces to the page without signing in, but u still can use postman to send requests, if you won't put it in router.post/delete, etc.
module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){ 
        //store the url they are requiring:
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in!');
        return res.redirect('/login')
    }
    next()
};
