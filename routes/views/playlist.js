'use strict';
const keystone = require('keystone');

exports = module.exports = (req, res) => {

	const view = new keystone.View(req, res);
	let locals = res.locals;
	if (locals.playlist) {
		view.render('playlist');	
	}
	else {
		res.status(404).render('errors/404', {
			errorTitle: 'Playlist not found',
			errorMsg: "This playlist doesn't exist anymore"
		});
	}
};
