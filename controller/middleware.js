//Middleware for passing through if person is logged in already
module.exports.isLoggedIn = function isLoggedIn(req, res, next) {

	// If user is already logged in the session, proceed
	if (req.isAuthenticated())
		return next();

	// If they aren't logged in, redirect user to the login page
	res.redirect('/');
}

//Middleware to log activity
module.exports.logger = function logger(req, res, next) {
	//console.log(req.body.username);
	//console.log(req.body.password);
	return next();
}

//Middleware for passing through if person is not logged in 
module.exports.isNotLoggedIn = function isNotLoggedIn(req, res, next) {

	// if user is not authenticated in the session, proceed
	if (!req.isAuthenticated())
		return next();

	// if they are logged in, redirect user to the profile page
	res.redirect('/main');
}

