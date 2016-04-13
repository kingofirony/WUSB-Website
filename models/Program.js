'use strict';
const keystone = require('keystone');
const _ = require('underscore');

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
	if ((this.isModified('isBiweekly') || this.isNew) && this.isBiweekly &&
		(this.biweeklyState === null)) {
		this.biweekylState = false;
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
	return Math.floor(Math.floor(daysSinceBeginningOfYear() / 7) / 2) == 0;
}

/* Uses JS Date object functions to get the time
	in the format expected by the DB */
function getTime() {
	const now = new Date();
	return (now.getHours() * 100) + now.getMinutes()
}

Program.schema.virtual('startTimeString').get(function() {
	return toTimeString(this.startTime);
});

Program.schema.virtual('endTimeString').get(function() {
	return toTimeString(this.endTime);
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
		const state = getCurrentBiweeklyState();
		if (this.biweeklyState != state) {
			return false;
		}
	}
	// General bounds check
	const now = new Date();
	if (this.day == now.getDay()) {
		const time = getTime();
		if (this.startTime < time && this.endTime > time) {
			return true;
		}
	}
	return false; // No sense in repeating this
});

/* Call this with a callback expecting an error object
	and a program. If program is null there is no live
	program at the moment. */
Program.schema.statics.getLiveProgram = function (next) {
	const state = getCurrentBiweeklyState();
	const now = new Date();
	const time = getTime();
	this.findOne({ 
		day: now.getDay(),
		startTime: {$lte: time},
		endTime: {$gte: time},
		biweeklyState: {$ne: !state} //capture undefined+null
	}).populate(['djs']).exec(next);
};

Program.schema.statics.getTimeSlots = function() {
	return _.map(_.flatten(_.map(_.range(24), h => [h*100, h*100+30])), num => ({
		number: num,
		string: toTimeString(num)
	}));
};

Program.schema.statics.findBySlot = function(day, time, cb) {
	return this.findOne({'day': day, 'startTime': time}, cb)
};

Program.register();
