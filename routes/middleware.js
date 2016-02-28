/**
 * This file contains the common middleware used by your routes.
 * 
 * Extend or replace these functions as your application requires.
 * 
 * This structure is not enforced, and just a starting point. If
 * you have more middleware you may want to group it as separate
 * modules in your project's /lib directory.
 */

const _ = require('underscore');
const keystone = require('keystone');


/**
	Initialises the standard view locals
	
	The included layout depends on the navLinks array to generate
	the navigation in the header, you may wish to change this array
	or replace it with your own templates / logic.
*/

exports.initLocals = function(req, res, next) {

	const locals = res.locals;
	
	locals.navLinks = [
		{ label: 'Home', key: 'home', href: '/' },
		{ label: 'Sign up', key: 'sign-up',	href: '/sign-up' },
		{ label: 'Profile', key: 'profile',	href: '/profile' },
		{ label: 'Post playlist', key: 'post-playlist', href: '/post-playlist' }
	];
	
	locals.user = req.user;
	next();
};


/**
	Fetches and clears the flashMessages before a view is rendered
*/

exports.flashMessages = function(req, res, next) {

	const flashMessages = {
		info: req.flash('info'),
		success: req.flash('success'),
		warning: req.flash('warning'),
		error: req.flash('error')
	};
	
	res.locals.messages = _.any(flashMessages, function(msgs) { return msgs.length; }) ? flashMessages : false;
	
	next();
	
};


/**
	Prevents people from accessing protected pages when they're not signed in
 */

exports.requireUser = function(req, res, next) {
	
	if (!req.user) {
		req.flash('error', 'Please sign in to access this page.');
		res.redirect('/keystone/signin');
	} else {
		next();
	}
	
};


/**
 	Make programs universally available
 */

exports.loadPrograms = function(req, res, next) {
	keystone.list('Program').model.find().exec((err, programs) => {
		if (err) return next(err);
		req.programs = programs;
		res.locals.programs = programs;
		next();
	});
};


/**
 	Load a playlist 
 */

exports.loadPlaylist = function(req, res, next) {
	const playlistId = req.params.id;
	if (playlistId) {
		keystone.list('Playlist').model.findOne({ slug: playlistId }).exec((err, playlist) => {
			if (err) return next(err);
			req.playlist = playlist;
			res.locals.playlist = playlist;
			next();
		});
	}
	else {
		next();
	}
};
