'use strict';
const keystone = require('keystone');
const _ = require('underscore');
const Program = keystone.list('Program');

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

/* Uses daysSinceBeginningOfYear to get this week's 
	biweekly state. */
function getCurrentBiweeklyState() {
	return Math.floor(Math.floor(daysSinceBeginningOfYear() / 7) / 2);
}

exports = module.exports = (req, res) => {
	const view = new keystone.View(req, res);
	const locals = res.locals;
	const today = new Date();
	locals.section = 'schedule';
	locals.days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	locals.timeslots = Program.model.getTimeSlots();
	locals.calendar = {};
	_.each(_.range(7), i => {
		locals.calendar[locals.days[i]] = {};
		_.each(locals.timeslots, timeslot => {
			const week = req.query.weekState || 1;
			Program.model.findBySlot(week, i, timeslot.number).exec().then(p => {
				locals.calendar[locals.days[i]][timeslot.number] = p
			});
		});
	});
	// Set date depending on whether you're going backwards or forwards
	if (req.query.date1 === undefined) {
		locals.date1 = new Date();
	} else {
		const dateString = req.query.date1.split('q');
		const dateObj = new Date((Number(dateString[0]) + 1) + ' ' + dateString[1] + ' ' + today.getFullYear());
		locals.date1 = dateObj;
	}
	if (req.query.date2 === undefined) {
		locals.date2 = new Date();
	} else {
		const dateString = req.query.date2.split('q');
		const dateObj = new Date((Number(dateString[0]) + 1) + ' ' + dateString[1] + ' ' + today.getFullYear());
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

	if (req.query.weekState === undefined) {
		locals.weekState = Math.abs(1 - getCurrentBiweeklyState());
	} else {
		locals.weekState = req.query.weekState;
	}
	view.render('weekly_schedule');
};
