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
	schedule: { type: Types.Date, required: true, default: Date.now },
	isBiweekly: { type: Types.Boolean, default: false },
	description: { type: Types.Text, default: '', note: 'Optional' },
	playlists: { type: Types.Relationship, ref: 'Playlist', many: true },
	genre: { type: Types.Text, required: true, initial: true }
});

Program.defaultColumns = 'title, djs, genre, schedule, description, ' +
	'isBiweekly, playlists';

Program.register();
