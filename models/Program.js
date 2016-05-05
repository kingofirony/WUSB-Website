'use strict';
const keystone = require('keystone');
const _ = require('underscore');
require('../utils/date');  // Loads in Date extensions

// Docs: http://keystonejs.com/docs/database/#fieldtypes
const Types = keystone.Field.Types;

// Docs: http://keystonejs.com/docs/database/#lists-options
const options = {
	autokey: { path: 'slug', from: 'title', unique: true },
	map: { name: 'title' },
	singular: 'Program',
	plural: 'Programs',
	sortable: true,
	defaultSort: '-title',
	drilldown: 'djs playlists'
};

const Program = new keystone.List('Program', options);

Program.add({
	title: { type: Types.Text, required: true },
	djs: { type: Types.Relationship, ref: 'User', many: true, 
		required: true, initial: true },
	day: { type: Types.Number, required: true, initial: true },
	startTime: { type : Types.Number, required: true, initial: true },
	endTime: { type: Types.Number, required: true, initial: true },
	isBiweekly: { type: Types.Boolean, initial: true, default: false },

	/* Set to true if the program will play on the first week
		of the year, set to false otherwise (or null if not biweekly) */
	biweeklyState: { type: Types.Boolean, initial: true, default: null },
	description: { type: Types.Text, default: '', note: 'Optional' },
	playlists: { type: Types.Relationship, ref: 'Playlist', many: true },
	genre: { type: Types.Text, required: true, initial: true }
});

Program.schema.pre('save', function (next) {
	if ((this.isModified('isBiweekly') || this.isNew) && this.isBiweekly) {
		this.biweeklyState = isTodayInWeekA();
	} else if (this.isModified('isBiweekly') && !this.isBiweekly) {
		this.bieeklyState = null;
	}
	// Bounds checking starts here
	if (this.isBiweekly) {
		/* Alternate query for biweekly programs. 
			Because of the odd way JS logic works, $ne: !this.biweeklyState
			will actually capture undefined/null even though it seems
			counterintuitive at first. */
		Program.model.find({ 
			_id: { $ne: this._id },
			day: { $eq: this.day },
			biweeklyState: { $ne: !this.biweeklyState }
		})
		.exec((err, results) => {
			if (err) next(err);
			if (results !== null && results !== undefined) {
				for (let result of results) {
					const start = result.startTime;
					const end = result.endTime;
					/* If any time occurs between two other times, then
						the bounds check failed. The first line checks start,
						second checks this.startTime, similar pattern for
						lines 3 and 4 */
					if (start >= this.startTime && start <= this.endTime ||
					  this.startTime >= start && this.startTime <= end ||
					  end >= this.startTime && end <= this.endTime ||
					  this.endTime >= start && this.endTime <= end) {
						Program.model.findById(this._id)
						.remove((err) => {
							console.log('Time conflict detected.');
							next(new Error('This program has a time ' +
								'conflict in range: ' + 
								start + ' - ' + end));
						});
					}
				}
			}
		});
	} else {
		// Complex verification is best done in a callback
		Program.model.find({
			_id: { $not: { $eq: this._id } },
			day: { $eq: this.day }
		})
		.exec((err, results) => {
			if (err) next(err);
			if (results !== null && results !== undefined) {
				for (let result of results) {
					const start = result.startTime;
					const end = result.endTime;
					/* If any time occurs between two other times, then
						the bounds check failed. The first line checks start,
						second checks this.startTime, similar pattern for
						lines 3 and 4 */
					if (start >= this.startTime && start <= this.endTime ||
					  this.startTime >= start && this.startTime <= end ||
					  end >= this.startTime && end <= this.endTime ||
					  this.endTime >= start && this.endTime <= end) {
					  	Program.model.findById(this._id)
						.remove((err) => {
							console.log('Time conflict detected.');
							next(new Error('This program has a time ' +
								'conflict in range: ' +
								start + ' - ' + end));
						});
					}
				}
			}
		});
	}
	next();
});

Program.defaultColumns = 'title, djs, genre, day, startTime, endTime,' +
	'isBiweekly, biweeklyState, playlists';

function toTimeString(value) {
	let hours = Math.floor(value / 100);
	if (hours > 12) {
		hours -= 12;
	}
	if (hours == 0) {
		hours = 12;
	}
	let minutes = value % 100;
	if (minutes < 10) {
		minutes = '0' + String(minutes); // Dumb JS type coercion guard
	}
	if (value < 1200) {
		return hours + ':' + minutes + ' AM';
	} else if (value >= 1200) {
		return hours + ':' + minutes + ' PM';
	}
}

function isDateInWeekA(date) {
	return date.getWeekOfYear() % 2 === 0;
}

function isTodayInWeekA() {
	return isDateInWeekA(new Date());
}

/* Uses JS Date object functions to get the time
 in the format expected by the DB */
function getTimeOfDate(date) {
	return (date.getHours() * 100) + date.getMinutes()
}

function getCurrentTime() {
	return getTimeOfDate(new Date());
}

/**
 * @param week - 0 = this week, 1 = next week
 * @param day - day of week
 * @param time - time of day the program starts (1620 = 4:20 PM)
 * @returns Date object
 */
function createDateFromWeekDayTime(week, day, time) {
	var date = new Date();
	date = date.addDays(day - date.getDay());
	if (date.getWeekOfYear() % 2 !== week) {
		date = date.addDays(7);
	}
	date.setHours(time / 100);
	date.setMinutes(time % 100);
	date.setSeconds(0);
	return date;
}

function getDayString(dayNumber) {
	switch(dayNumber) {
		case 0: return 'Sunday';
		case 1: return 'Monday';
		case 2: return 'Tuesday';
		case 3: return 'Wednesday';
		case 4: return 'Thursday';
		case 5: return 'Friday';
		case 6: return 'Saturday';
	}
}

Program.schema.virtual('startTimeString').get(function() {
	return toTimeString(this.startTime);
});

Program.schema.virtual('endTimeString').get(function() {
	return toTimeString(this.endTime);
});

Program.schema.virtual('dayString').get(function() {
	return getDayString(this.day);
});

Program.schema.virtual('airTimeString').get(function() {
	return (this.isBiweekly ? 'Every other ' : 'Every ') +
		getDayString(this.day) + ' ' + toTimeString(this.startTime) + ' - ' +
		toTimeString(this.endTime)
});

Program.schema.virtual('nextAirDate').get(function() {
	// Not implemented yet
	return new Date();
});

Program.schema.virtual('nextAirDateMMDDYY').get(function() {
	const d = this.nextAirDate;
	return ("0" + (d.getMonth() + 1).toString()).substr(-2) + "/" +
		("0" + d.getDate().toString()).substr(-2) + "/" + d.getFullYear();
});

Program.schema.virtual('isLiveNow').get(function () {
	// Check biweekly first, then do a general bounds check.
	if (this.isBiweekly) {
		if (this.biweeklyState !== isTodayInWeekA()) {
			return false;
		}
	}
	// General bounds check
	const now = new Date();
	if (this.day == now.getDay()) {
		const time = getCurrentTime();
		if (this.startTime < time && this.endTime > time) {
			return true;
		}
	}
	return false; // No sense in repeating this
});

/**
 * Length of an episode in minutes
 */
Program.schema.virtual('lengthInMinutes').get(function () {
	// What if a program starts before midnight and ends the next day?
	const difference = this.endTime - this.startTime;
	const hours = difference / 100;
	const minutes = difference % 100;
	return hours * 60 + minutes;
});

/**
 Call this with a callback expecting an error object
 and a program. If program is null there is no live
 program at the moment. */
function getProgramAtTime(date, schemaObject, callback) {
	const time = getTimeOfDate(date);
	return schemaObject.findOne({
		day: date.getDay(),
		startTime: {$lte: time},
		endTime: {$gt: time},
		biweeklyState: {$ne: !isDateInWeekA(date)} //capture undefined+null
	}).populate(['djs']).exec(callback);
}

Program.schema.statics.getLiveProgram = function (callback) {
	return getProgramAtTime(new Date(), this, callback);
};

Program.schema.statics.getTimeSlots = function() {
	return _.map(_.flatten(_.map(_.range(24), h => [h*100, h*100+30])), num => ({
		number: num,
		string: toTimeString(num)
	}));
};

/**
 * @param week - 0 = this week, 1 = next week
 * @param day - day of week
 * @param startTime - time of day the program starts (1620 = 4:20 PM)
 * @param cb - callback
 * @returns {Promise}
 */
Program.schema.statics.findBySlotStart = function(week, day, startTime, cb) {
	const currentWeek = new Date().getWeekOfYear();
	const isWeekA = currentWeek % 2 === week;  // Week A vs. Week B
	return this.findOne({
		$or: [
			{
				'day': day,
				'startTime': startTime,
				'isBiweekly': false
			},
			{
				'day': day,
				'startTime': startTime,
				'biweeklyState': isWeekA
			}
		]
	}, cb)
};

/**
 * @param week - 0 = this week, 1 = next week
 * @param day - day of week
 * @param time - time of day (1620 = 4:20 PM)
 * @param cb - callback
 * @returns {Promise}
 */
Program.schema.statics.slotHasProgram = function(week, day, time, cb) {
	const date = createDateFromWeekDayTime(week, day, time);
	return getProgramAtTime(date, this).then(p => {
		const bool = !!p;
		if (cb) {
			cb(bool);
		}
		return Promise.resolve(bool);
	});
};

Program.register();
