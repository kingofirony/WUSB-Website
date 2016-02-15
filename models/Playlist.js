'use strict';
const keystone = require('keystone');

// Docs: http://keystonejs.com/docs/database/#fieldtypes
const Types = keystone.Field.Types;

// Docs: http://keystonejs.com/docs/database/#lists-options
const options = {
	autokey: { path: 'slug', from: 'title', unique: true },
	map: { name: 'title' },
	singular: 'Playlist',
	plural: 'Playlists',
	sortable: true,
	defaultSort: '-date',
	drilldown: 'author'
};

const Playlist = new keystone.List('Playlist', options);

/* On Create Playlist: Add title, author, date if not today.
	Description is optional. Set isPublished and isPromoted if necessary.
	You should treat "tracks" below as if it were in Playlist.add and
	the constructor works like you'd expect. */
Playlist.add({
	title: { type: Types.Text, required: true },
	author: { type: Types.Relationship, ref: 'User', required: true,
		initial: true, noedit: true },
	date: { type: Types.Date, required: true, default: Date.now },
	description: { type: Types.Html, default: '' }, //Not required currently
	isPublished: { type: Types.Boolean, default: false },
	isPromoted: { type: Types.Boolean, default: false },
	/* Docs: JSON.stringify objects that follow this standard:
		{ artist: String, album: String, title: String, label: String, 
		link: String, weight: Number } (we can always add more if needed).
		JSON.deserialize should be used upon getting the string array,
		expect to get objects from it (naturally). */
	// !!! Do not set to required/initial, causes undefined behavior !!!
	serializedTracks: { type: Types.TextArray, default: [],
		note: 'Serialized JSON, deserialize to use.'}
});

// Treat this as if it were part of the Playlist.add above!
/* Appropriate usage:
	list = new Playlist.model.add({ // stuff });
	list.add(tracks: [{
		artist: 'str',
		album: 'str',
		//etc
	}]);
*/
Playlist.schema.add({
	tracks: [{
		artist: String,
		album: String,
		title: String,
		label: String,
		link: String,
		weight: Number
	}] // Bypasses Keystone, it doesn't support this.
});

Playlist.defaultColumns = 'title, author, date, description,' +
	' isPublished, isPromoted, serializedTracks';

Playlist.register();