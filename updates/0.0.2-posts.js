const keystone = require('keystone'),
	_ = require('underscore'),
	env = keystone.get('env'),
	User = keystone.list('User'),
	TextPost = keystone.list('TextPost');
	
if (env === 'development') {
	const posts = [
		{
			title: 'Post 1',
			textContent: 'blah blah blah'
		},
		{
			title: 'Post 2',
			textContent: 'WUSB :)'
		}
	];

	exports = module.exports = done => {
		User.model.findOne((err, user)  => {
			if (err) {
				console.error(err);
				done(err);
			}
			else {
				_.each(posts, function (post) {
					const textPost = new TextPost.model(post);
					textPost.author = user.id;
					textPost.save(err => {
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
		console.log('Patch 0.0.2 is not applicable in production or ' +
			'testing');
		done();
	}
}
