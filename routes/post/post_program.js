'use strict';
const _ = require('underscore');
const keystone = require('keystone');
const Program = keystone.list('Program');

exports = module.exports = (req, res) => {
	const locals = res.locals;
	const action = req.body.action;
	
	function fillProgram(program, editing) {
		const updater = program.getUpdateHandler(req, res, {
			errorMessage: 'There was an error creating your new program:'
		});
		return new Promise((resolve, reject) => {
			updater.process(req.body, {
				flashErrors: true,
				logErrors: true,
				fields: 'title, djs, schedule, isBiweekly, description, genre'
			}, err => {
				if (err) {
					return reject(err);
				} else {
					req.flash('success', 'Program ' + editing ? 'updated' : 'created');
					return resolve(program);
				}
			});
		});
	}
	
	if (action === 'add-program') {
		fillProgram(new Program.model({}), false).then(
			program => res.redirect(`/program/${program.slug}/edit`),
			err => {
				locals.validationErrors = err.errors;
				res.redirect(req.originalUrl);
			}
		);
	}
	else if (action === 'edit-program') {
		fillProgram(locals.program, true).then(
			program => res.redirect(req.originalUrl),
			err => {
				locals.validationErrors = err.errors;
				res.redirect(req.originalUrl);
			}
		);
	}
	else {
		throw new Error("Invalid form action: " + action);
	}
};
