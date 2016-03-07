'use strict';
const keystone = require('keystone');

exports = module.exports = (req, res) => {

	const view = new keystone.View(req, res);
	let locals = res.locals;
	if (locals.program) {
		view.render('program');
	}
	else {
		res.status(404).render('errors/404', {
			errorTitle: 'Program not found',
			errorMsg: "This program doesn't exist anymore"
		});
	}
};
