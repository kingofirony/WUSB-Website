'use strict';
const keystone = require('keystone');
const Program = keystone.list('Program');

exports = module.exports = (req, res) => {
	const view = new keystone.View(req, res);
	const locals = res.locals;
	locals.section = 'programs';

	// Load programs
	view.on('init', next => {
		Program.model.getLiveProgram(function (err, prg) {
			keystone.populateRelated(prg, 'djs', (err) => {
				locals.prg = prg;
				next();
			});
		});
	});

	view.render('live');
};
