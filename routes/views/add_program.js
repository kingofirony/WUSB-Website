'use strict';
const keystone = require('keystone');
const Program = keystone.list('Program');

exports = module.exports = (req, res) => {

	const view = new keystone.View(req, res);
	const locals = res.locals;
	
	view.render('add_program');

};
