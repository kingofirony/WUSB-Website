'use strict';
const keystone = require('keystone');

exports = module.exports = (req, res) => {

	const view = new keystone.View(req, res);
	let locals = res.locals;

	console.log(locals)

	if (locals.dj) {
		view.render('dj');
	}
	else {
		res.status(404).render('errors/404', {
			errorTitle: 'DJ not found',
			errorMsg: "This DJ doesn't exist anymore"
		});
	}
};