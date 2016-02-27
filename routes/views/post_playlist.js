'use strict';
const keystone = require('keystone');

exports = module.exports = function (req, res) {

	let view = new keystone.View(req, res);
	let locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'post-playlist';

	// Accept form post submit
	view.on('post', { action: 'post-playlist' }, function (next) {

		// TODO: refactor into a reusable function?
		if (!locals.user) {
			req.flash('error', 'Please log in');
			res.redirect('/keystone/signin');
			return;
		}

	});

	// TODO: refactor into a reusable function?
	if (locals.user) {
		view.render('post_playlist');
	}
	else {
		res.redirect('/keystone/signin');
	}
};
