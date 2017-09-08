module.exports = function (app) {

	// Require Routes
	var user = require('./routes/user');

	// Use Routes
	app.use('/user', user);
};
