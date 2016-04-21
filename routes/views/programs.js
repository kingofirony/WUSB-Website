'use strict';
const keystone = require('keystone');
const Program = keystone.list('Program');

exports = module.exports = (req, res) => {
	const view = new keystone.View(req, res);
	const locals = res.locals;
	locals.section = 'programs';

	// Load programs
	view.on('init', next => {
		Program.paginate({
			page: req.query.page || 1,
			perPage: 10
		}).populate(['djs'])
			.exec(function (err, programs) {
				locals.programs = programs;
				next();
			});
	});

	view.render('programs');
};
