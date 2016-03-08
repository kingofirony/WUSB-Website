'use strict';
const keystone = require('keystone');
const Playlist = keystone.list('Playlist');

exports = module.exports = (req, res) => {
	const view = new keystone.View(req, res);
	const locals = res.locals;
	locals.section = 'playlists';

	// Load playlists
	view.on('init', function (next) {
		Playlist.paginate({
			page: req.query.page || 1,
			perPage: 10
		}).populate(['program', 'author'])
			.exec(function (err, playlists) {
				locals.playlists = playlists.results;
				next();
			});
	});

	view.render('playlists');
};
