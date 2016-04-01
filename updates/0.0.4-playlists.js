const keystone = require('keystone'),
	_ = require('underscore'),
	env = keystone.get('env'),
	User = keystone.list('User'),
	Program = keystone.list('Program');
	Playlist = keystone.list('Playlist');

if (env === 'development') {
	const playlists = [
		{
			title: 'Playlist 1',
			genre: 'J-Pop',
			isPublished: true,
			tracks: [
				{
					artist: '17 Years Old and Berlin Wall',
					album: 'Aspect',
					title: 'A Thousand Days'
				},
				{
					artist: '17 Years Old and Berlin Wall',
					album: 'Aspect',
					title: 'Talking Eggs'
				},
				{
					artist: '17 Years Old and Berlin Wall',
					album: 'Aspect',
					title: '27:00'
				},
				{
					artist: '17 Years Old and Berlin Wall',
					album: 'Aspect',
					title: 'Lilac'
				},
				{
					artist: '17 Years Old and Berlin Wall',
					album: 'Aspect',
					title: 'June'
				},
				{
					artist: '17 Years Old and Berlin Wall',
					album: 'Aspect',
					title: 'All Day Long'
				}
			]
		},
		{
			genre: 'Experimental',
			isPublished: false,
			tracks: [

			]
		}
	];

	exports = module.exports = done => {
		User.model.findOne((err, user) => {
			if (err) {
				console.error(err);
				done(err);
			}
			else {
				Program.model.findOne(function(err, program) {
					if (err) {
						console.error(err);
						done(err);
					}
					else {
						_.each(playlists, p => {
							const playlist = new Playlist.model(p);
							playlist.author = user.id;
							playlist.program = program.id;
							playlist.save(err => {
								if (err) {
									console.error(err);
								}
							});
						});
						done(err);
					}
				});
			}
		});
	};
} else {
	exports = module.exports = done => {
		console.log('Patch 0.0.4 is not applicable in production or ' +
			'testing.');
		done();
	}
}
