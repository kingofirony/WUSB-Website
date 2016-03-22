'use strict';
const _ = require('underscore');
const keystone = require('keystone');
const Program = keystone.list('Program');
const User = keystone.list('User');

exports = module.exports = (req, res) => {
	const locals = res.locals;
	const action = req.body.action;
	
	function fillDJs(program, djs) {
		program.djs = [];
		return Promise.all(_.map(_.filter(djs, dj => dj != ''), dj => {
			return User.model.findByFullName(dj).exec().then(user => {
				program.djs.push(user.id);
				return Promise.resolve();
			})
		})).then(() => Promise.resolve(program.save()));
	}
	
	function fillProgram(program, editing) {
		const updater = program.getUpdateHandler(req, res, {
			errorMessage: 'There was an error creating your new program:'
		});
		return fillDJs(program, req.body.dj).then(() => {
			return new Promise((resolve, reject) => {
				updater.process(req.body, {
					flashErrors: true,
					logErrors: true,
					fields: 'title, schedule, isBiweekly, description, genre'
				}, err => {
					if (err) {
						return reject(err);
					} else {
						req.flash('success', 'Program ' + editing ? 'updated' : 'created');
						return resolve(program);
					}
				});
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
