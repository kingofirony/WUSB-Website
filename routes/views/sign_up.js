'use strict';
const keystone = require('keystone');
const User = keystone.list('User');

exports = module.exports = function (req, res) {

	let view = new keystone.View(req, res);
	let locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'sign-up';
	
	// Accept form post submit
	view.on('post', { action: 'sign-up' }, function (next) {

		// handle form
		let newUser = new User.model({
			}),

			updater = newUser.getUpdateHandler(req, res, {
				errorMessage: 'There was an error creating your new user:'
			});

		updater.process(req.body, {
			flashErrors: true,
			logErrors: true,
			fields: 'email, name, password'
		}, function (err) {
			if (err) {
				locals.validationErrors = err.errors;
				next();
			} else {
				req.flash('success', 'User added');
				res.redirect('/');
			}

		});
	});

	// Render the view
	view.render('sign_up');
};
