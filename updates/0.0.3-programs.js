const keystone = require('keystone'),
	_ = require('underscore'),
	env = keystone.get('env'),
	User = keystone.list('User'),
	Program = keystone.list('Program');

if (env === 'development') {
	const programs = [
		{
			title: 'Program 1',
			textContent: 'blah blah blah',
			genre: 'J-Pop'
		},
		{
			title: 'Program 2',
			textContent: 'WUSB :)',
			genre: 'Dream pop'
		}
	];

	exports = module.exports = done => {
		User.model.findOne((err, user) => {
			if (err) {
				console.error(err);
				done(err);
			}
			else {
				_.each(programs, p => {
					const program = new Program.model(p);
					program.djs = [user.id];
					program.save(err => {
						if (err) {
							console.error(err);
						}
					});
				});
				done(err);
			}
		});
	};
} else {
	exports = module.exports = done => {
		console.log('Patch 0.0.3 is not applicable in production or ' +
			'testing.');
		done();
	}
}
