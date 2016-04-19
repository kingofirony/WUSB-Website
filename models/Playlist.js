'use strict';
const keystone = require('keystone');

// Docs: http://keystonejs.com/docs/database/#fieldtypes
const Types = keystone.Field.Types;

// Docs: http://keystonejs.com/docs/database/#lists-options
const options = {
	singular: 'Playlist',
	plural: 'Playlists',
	sortable: true,
	defaultSort: '-date',
	drilldown: 'author program'
};

const Playlist = new keystone.List('Playlist', options);

/* On Create Playlist: Add author, date if not today.
	Description is optional. Set isPublished and isPromoted if necessary.
	You should treat "tracks" below as if it were in Playlist.add and
	the constructor works like you'd expect. */
Playlist.add({
	author: { type: Types.Relationship, ref: 'User', required: true,
		initial: true, noedit: true },
	program: { type: Types.Relationship, ref: 'Program', required: true,
		initial: true },
	date: { type: Types.Datetime, required: true, default: Date.now },
	description: { type: Types.Html, default: '' }, //Not required currently
	isPublished: { type: Types.Boolean, default: false },
	isPromoted: { type: Types.Boolean, default: false },
	/* Docs: JSON.stringify objects that follow this standard:
		{ isNew: Boolean, artist: String, album: String, title: String, 
			label: String, link: String, weight: Number } 
		(we can always add more if needed)
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

Playlist.schema.pre('save', function (next) {
	/* Doesn't remove previous playlist from program if edited, 
		but I'm not sure edits should be allowed in the first place. */
	if ((this.isNew && this.isPublished) || 
	 (this.isModified('program') && this.isPublished) ||
	 (this.isModified('isPublished') && this.isPublished)) {
		keystone.list('Program').model.update(
			{ _id: this.program }, 
			{ $push: { playlists: this } },
			function (err) {
				if (err) throw err;
			}
		);
	}
	next();
});

Playlist.schema.pre('update', function (next) {
	if ((this.isModified('program') && this.isPublished) ||
	  (this.isModified('isPublished') && this.isPublished)) {
		keystone.list('Program').model.update(
			{ _id: this.program }, 
			{ $push: { playlists: this } },
			function (err) {
				if (err) throw err;
			}
		);
	}
	next();
});

Playlist.defaultColumns = 'author, date, description,' +
	' isPublished, isPromoted, serializedTracks';

Playlist.register();
