'use strict';
const _ = require('underscore');
const keystone = require('keystone');
const Program = keystone.list('Program');
const Playlist = keystone.list('Playlist');

exports = module.exports = (req, res) => {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'post-playlist';

	function loadPrograms() {
		return Program.model.find().exec().then(programs => locals.programs = programs);
	}
	
	function loadPlaylist() {
		const playlistId = req.params.id;
		if (playlistId) {  // Loading an existing playlist by id/slug
			return Playlist.model.findOne({ slug: playlistId }).exec().then(playlist => locals.playlist = playlist);
		}
		else {
			return Promise.resolve();
		}
	}
	
	function normalizeTrackField(field) {
		field = field.trim();
		if (field === '') {
			return null;
		}
		else {
			return field;
		}
	}

	function addTracksToPlaylist(playlist, trackData, callback) {
		const artists = _.map(trackData.artist, normalizeTrackField);
		const albums = _.map(trackData.artist, normalizeTrackField);
		const titles = _.map(trackData.title, normalizeTrackField);
		
		const tracks = _.map(_.range(trackData.title.length), i => ({
			artist: artists[i],
			album: albums[i],
			title: titles[i]
		}));
		
		_.each(tracks, track => {
			if (track.artist && track.album && track.title) {
				playlist.tracks.push(track);
			}
		});
		
		playlist.save(callback);
	}
	
	view.on('init', next => {
		loadPrograms().then(loadPlaylist).then(next, err => res.err(err));
	});

	// Accept form post submit
	view.on('post', { action: 'post-playlist' }, next => {

		// TODO: refactor into a reusable function?
		if (!locals.user) {
			req.flash('error', 'Please log in');
			res.redirect('/keystone/signin');
			return;
		}

		const playlistId = req.params.id;
		if (playlistId) {  // Appending to an existing playlist by id/slug
			Playlist.model.findOne({ id: playlistId })
				.exec((err, playlist) => {
					if (err) {
						locals.validationErrors = err.errors;
					}
					else if (playlist) {  // Only give a care if the ID exists
						addTracksToPlaylist(playlist, req.body, err => {
							if (err) {
								locals.validationErrors = err.errors;
							}
							else {
								req.flash('success', 'Playlist updated');
							}
						});
						
						// TODO: Do we need this?
						//locals.playlist = playlist;
					}
				});
		}
		else {  // Creating a new playlist
			const programSlug = req.body.program;
			if (!programSlug) {
				req.flash('error', 'You must choose a program');
				next();
			}
			else {
				Program.model.findOne({ slug: programSlug })
				.exec((err, program) => {
					if (err) {
						locals.validationErrors = err.errors;
						next();
					}
					else {
						const newPlaylist = new Playlist.model({
							program: program.id,
							title: '???',
							author: locals.user
						});
						newPlaylist.save(err => {
							if (err) {
								locals.validationErrors = err.errors;
								next();
							}
							else {
								addTracksToPlaylist(newPlaylist, req.body, err => {
									if (err) {
										locals.validationErrors = err.errors;
									}
									else {
										req.flash('success', 'Playlist created');
									}
									res.redirect('/post-playlist?id=' + newPlaylist.id);
								});	
							}
						});
					}
				});
			}
		}
	});

	// TODO: refactor into a reusable function?
	if (locals.user) {
		view.render('post_playlist');
	}
	else {
		res.redirect('/keystone/signin');
	}
};
