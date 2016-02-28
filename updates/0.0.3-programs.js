var keystone = require('keystone'),
	_ = require('underscore'),
	env = keystone.get('env'),
	User = keystone.list('User'),
	Program = keystone.list('Program');

if (env === 'development') {
	var programs = [
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

	exports = module.exports = function (done) {
		User.model.findOne(function (err, user) {
			if (err) {
				console.error(err);
				done(err);
			}
			else {
				_.each(programs, function (post) {
					var program = new Program.model(post);
					program.djs = [user.id];
					program.save(function (err) {
						if (err) {
							console.error(err);
						}
					});
				});
				done(err);
			}
		});
	};
}
