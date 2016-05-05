'use strict';
const keystone = require('keystone');
const _ = require('underscore');
const Program = keystone.list('Program');

const COLORS = [
	['blue', 'green'],  // Even columns
	['red', 'orange']	// Odd columns
];

/* Jan 1 is 0, etc. JS Date objects handle leap years.
	Argument is optional. */
function daysSinceBeginningOfYear(date) {
	const now = (date === undefined) ? new Date() : date;
	const janFirst = new Date(now.getFullYear(), 0, 0);
	const diff = now - janFirst;
	const millisPerDay = 86400000;
	// Think units: millisec div (millisec div day) = days
	return Math.floor(diff / millisPerDay);
}

exports = module.exports = (req, res) => {
	const view = new keystone.View(req, res);
	const locals = res.locals;
	const today = new Date();
	locals.week = parseInt(req.query.weekState || new Date().getWeekOfYear() % 2);
	locals.section = 'schedule';
	locals.days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	locals.timeslots = Program.model.getTimeSlots();
	locals.calendar = {};
	_.each(_.range(7), day => {
		locals.calendar[locals.days[day]] = {};
		var programNumberOfTheDay = 0;
		const colorSet = COLORS[day % 2];
		const colorSetLength = colorSet.length;
		_.each(locals.timeslots, timeslot => {
			Program.model.findBySlotStart(locals.week, day, timeslot.number)
			.exec().then(p => {
				if (p) {
					locals.calendar[locals.days[day]][timeslot.number] = {
						color: colorSet[programNumberOfTheDay % colorSetLength],
						program: p
					};
					programNumberOfTheDay += 1;
				}
			});
		});
	});
	// Set date depending on whether you're going backwards or forwards
	if (req.query.date1 === undefined) {
		locals.date1 = new Date();
	} else {
		const dateString = req.query.date1.split('q');
		const dateObj = new Date((Number(dateString[0]) + 1) + ' ' +
			dateString[1] + ' ' + today.getFullYear());
		locals.date1 = dateObj;
	}
	if (req.query.date2 === undefined) {
		locals.date2 = new Date();
	} else {
		const dateString = req.query.date2.split('q');
		const dateObj = new Date((Number(dateString[0]) + 1) + ' ' +
			dateString[1] + ' ' + today.getFullYear());
		locals.date2 = dateObj;
	}
	if (req.query.week === 'back') {
		locals.date1.setDate(locals.date1.getDate() - 7);
		locals.date2.setDate(locals.date2.getDate() - 7);
	} else if (req.query.week === 'fwd') {
		locals.date1.setDate(locals.date1.getDate() + 7);
		locals.date2.setDate(locals.date2.getDate() + 7);
	} else {
		locals.date1.setDate(locals.date1.getDate() - locals.date1.getDay());
		locals.date2.setDate(locals.date2.getDate() + (6 - locals.date2.getDay()));
	}
	
	Promise.all(_.map(_.range(7), day => {
		return Promise.all(_.map(locals.timeslots, timeslot => {
			return Program.model.slotHasProgram(locals.week, day, timeslot.number)
				.then(p => Promise.resolve(!!p));
		}));
	})).then(x => {
		locals.slotBoolMatrix = x;
		view.render('weekly_schedule');
	});
};
