'use strict';
const _ = require('underscore');
const keystone = require('keystone');
const Program = keystone.list('Program');
const User = keystone.list('User');
require('../../utils/date');  // Loads in Date extensions

exports = module.exports = (req, res) => {
	const locals = res.locals;
	const action = req.body.action;
	
	function fillDJs(program, djs) {
		program.djs = [];
		return Promise.all(_.map(_.filter(djs, d => d !== ''), dj => {
			return User.model.findByFullName(dj).exec().then(user => {
				program.djs.push(user.id);
				return Promise.resolve();
			})
		})).then(() => Promise.resolve(program.save()));
	}
	
	function parseTime(timeString) {
		const parts = timeString.split(' ');
		const time = parts[0];
		const amPm = parts[1];
		const timeParts = time.split(':');
		const hours = parseInt(timeParts[0]);
		const minutes = parseInt(timeParts[1]);
		return (hours + (amPm === 'PM' ? (hours === 12 ? 0 : 12) :
				(hours === 12 ? -12 : 0))) * 100 + minutes;
	}
	
	function fillStartTime(program, timeString) {
		program.startTime = parseTime(timeString);
		return Promise.resolve(program);
	}

	function fillEndTime(program, timeString) {
		program.endTime = parseTime(timeString);
		return Promise.resolve(program);
	}

	function fillDate(program, dateString) {
		const date = new Date(dateString);
		program.day = date.getDay();
		program.biweeklyState = program.isBiweekly && date.getWeekOfYear() % 2 == 0;
		return Promise.resolve(program);
	}
	
	function fillProgram(program, editing) {
		const updater = program.getUpdateHandler(req, res, {
			errorMessage: 'There was an error creating your new program:'
		});
		return fillDJs(program, req.body.dj)
		.then(() => fillStartTime(program, req.body.startTime))
		.then(() => fillEndTime(program, req.body.endTime))
		.then(() => fillDate(program, req.body.date))
		.then(() => new Promise((resolve, reject) => {
			updater.process(req.body, {
				flashErrors: true,
				logErrors: true,
				fields: 'title, isBiweekly, description, genre'
			}, err => {
				if (err) return reject(err);
				req.flash('success', 'Program ' + (editing ? 'updated' : 'created'));
				return resolve(program);
			});
		})).then(program => new Promise((resolve, reject) => {
			program.save(err => {
				if (err) return reject(err);
				return resolve(program);
			})
		}));
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
