'use strict';
const keystone = require('keystone');

exports = module.exports = function (req, res) {

	let view = new keystone.View(req, res);
	let locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'profile';

	// Accept form post submit
	view.on('post', { action: 'edit-profile' }, function (next) {

		if (!locals.user) {
			req.flash('error', 'Please log in');
			res.redirect('/keystone/signin');
			return;
		}
		
		let updater = locals.user.getUpdateHandler(req, res, {
			errorMessage: 'There was an error editing your profile:'
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
				req.flash('success', 'Profile updated');
				res.redirect('/');
			}
		});
	});

	if (locals.user) {
		view.render('profile');  // Only render edit profile page if signed in
	}
	else {
		res.redirect('/keystone/signin');
	}
};
