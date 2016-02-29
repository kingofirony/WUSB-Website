'use strict';
const _ = require('underscore');
const keystone = require('keystone');
const Program = keystone.list('Program');
const Playlist = keystone.list('Playlist');

exports = module.exports = (req, res) => {
	const locals = res.locals;
	const action = req.body.action;
	
	function addTracksToPlaylist(playlist, values) {
		
		// Turns an empty field into null
		function strip(field) {
			field = field.trim();
			return field === '' ? null : field;
		}
		
		// Turn parallel arrays of values into objects
		const tracks = _.map(_.range(values.title.length), i => ({
			artist: strip(values.artist[i]),
			album: strip(values.album[i]),
			title: strip(values.title[i])
		}));
		
		// Filter out rows that are completely empty
		playlist.tracks = _.reject(tracks, t => _.all(_.values(t), v => !v));
	}
	
	if (action === 'add-playlist') {
		const playlist = new Playlist.model({
			program: req.body.program,
			title: '???',  // TODO: Add playlist title
			author: locals.user.id
		});
		addTracksToPlaylist(playlist, req.body);
		playlist.save(err => {
			if (err) {
				locals.validationErrors = err.errors;
				res.redirect(req.originalUrl);
			}
			else {
				req.flash('success', 'Playlist created');
				res.redirect(`/playlist/${playlist.id}/edit`);
			}
		});
	}
	else if (action === 'edit-playlist') {
		const playlist = locals.playlist;
		playlist.program = req.body.program;
		addTracksToPlaylist(playlist, req.body);
		playlist.save(err => {
			if (err) {
				locals.validationErrors = err.errors;
			}
			else {
				req.flash('success', 'Playlist updated');
			}
			res.redirect(req.originalUrl);
		});
	}
	else {
		throw new Error("Invalid form action: " + action);
	}
};
