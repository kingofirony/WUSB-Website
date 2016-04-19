'use strict';
const keystone = require('keystone');
const _ = require('underscore');
const Program = keystone.list('Program');

exports = module.exports = (req, res) => {
	const view = new keystone.View(req, res);
	const locals = res.locals;
	locals.section = 'schedule';
	locals.days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	locals.timeslots = Program.model.getTimeSlots();
	locals.calendar = {};
	_.each(_.range(7), i => {
		locals.calendar[locals.days[i]] = {};
		_.each(locals.timeslots, timeslot => {
			const week = req.query.week || 1;
			Program.model.findBySlot(week, i, timeslot.number).exec().then(p => {
				locals.calendar[locals.days[i]][timeslot.number] = p
			});
		});
	});
	view.render('weekly_schedule');
};
