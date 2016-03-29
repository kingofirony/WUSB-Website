'use strict';
const keystone = require('keystone');

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
		this.biWeeklystate = null;
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
								'conflict in ' + 'range: ' +
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
								'conflict in ' + 'range: ' +
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
	if (value === 0) {
		return '12:00 AM'
	}
	if (value < 1200) {
		return value / 100 + ':' + value % 100 + ' AM';
	}
	if (value === 1200) {
		return '12:00 PM';
	}
	return (value - 1200) / 100 + ':' + value % 100 + ' PM';
}

Program.schema.virtual('startTimeString').get(function() {
	return toTimeString(this.startTime);
});

Program.schema.virtual('endTimeString').get(function() {
	return toTimeString(this.endTime);
});

Program.schema.virtual('nextAirDate').get(function() {
	// TODO: Implement date calculation functions
	return new Date();
});

Program.schema.virtual('nextAirDateMMDDYY').get(function() {
	const d = this.nextAirDate;
	return ("0" + (d.getMonth() + 1).toString()).substr(-2) + "/" +
		("0" + d.getDate().toString()).substr(-2) + "/" + d.getFullYear();
});

Program.register();
