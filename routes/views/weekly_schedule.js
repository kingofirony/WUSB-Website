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
			Program.model.findBySlot(i, timeslot.number).exec().then(p => {
				locals.calendar[locals.days[i]][timeslot.number] = p
			});
		});
	});
	locals.date1 = new Date();
	locals.date2 = new Date();
	locals.date1.setDate(locals.date1.getDate() - locals.date1.getDay());
	locals.date2.setDate(locals.date2.getDate() + (6 - locals.date2.getDay()));
	view.render('weekly_schedule');
};
