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

	function fillPlaylist(playlist, data) {
		const updater = playlist.getUpdateHandler(req, res, {
			errorMessage: 'There was an error creating your new playlist:'
		});
		return Program.model.findOne({ title: data.program }).exec()
		.then(program => {
			playlist.program = program.id;
			return Promise.resolve(playlist);
		}).then(playlist => new Promise((resolve, reject) => {
			updater.process(data, {
				flashErrors: true,
				logErrors: true,
				fields: 'title, description'
			}, err => {
				if (err) return reject(err);
				addTracksToPlaylist(playlist, data);
				return resolve(playlist);
			})
		})).then(playlist => new Promise((resolve, reject) => {
			playlist.save(err => {
				if (err) return reject(err);
				return resolve(playlist);
			})
		}));
	}
	
	if (action === 'add-playlist') {
		const playlist = new Playlist.model({ author: locals.user.id });
		fillPlaylist(playlist, req.body).then(() => {
			req.flash('success', 'Playlist created');
			res.redirect(`/playlist/${playlist.id}/edit`);
		},
		err => {
			locals.validationErrors = err.errors;
			res.redirect(req.originalUrl);
		});
	}
	else if (action === 'edit-playlist') {
		fillPlaylist(locals.playlist, req.body).then(() => {
			req.flash('success', 'Playlist updated');
			res.redirect(req.originalUrl);
		},
		err => {
			locals.validationErrors = err.errors;
			res.redirect(req.originalUrl);
		});
	}
	else {
		throw new Error("Invalid form action: " + action);
	}
};
