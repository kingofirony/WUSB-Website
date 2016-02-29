'use strict';
const keystone = require('keystone');

exports = module.exports = (req, res) => {

	const view = new keystone.View(req, res);
	let locals = res.locals;
	if (locals.playlist) {
		view.render('playlist');	
	}
	else {
		// TODO: This doesn't show the custom error title and msg
		res.status(404).render('errors/404', {
			errorTitle: 'Playlist not found',
			errorMsg: 'This playlist does not exist anymore'
		});
	}
};
