'use strict';
const keystone = require('keystone');
const Program = keystone.list('Program');

exports = module.exports = (req, res) => {
	const view = new keystone.View(req, res);
	const locals = res.locals;
	locals.section = 'schedule';
	locals.days = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
	locals.timeslots = [ '1200', '1230' ];

	view.render('weekly_schedule');
};
