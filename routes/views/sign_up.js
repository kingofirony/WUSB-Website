'use strict';
const keystone = require('keystone');
const User = keystone.list('User');

exports = module.exports = (req, res) => {

	let view = new keystone.View(req, res);
	let locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'sign-up';
	
	// Accept form post submit
	view.on('post', { action: 'sign-up' }, next => {
		
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
		}, err => {
			if (err) {
				locals.validationErrors = err.errors;
				next();
			} else {
				req.flash('success', 'Go ahead - log in!');
				res.redirect('/');
			}
		});
	});

	// Render the view
	view.render('sign_up');
};
