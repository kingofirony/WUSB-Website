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
		},
		{
			title: 'Post 3',
			textContent: 'Milhouse front page robot troll IRL OP gilded. Sanic Bernie Sanders fallout Putin troll reddiquette Patrick Stewart sweet Zoidberg. Sanic MRW rage banana self lose skyrim aliens win hot. Lose gilded ipsum pepe Milhouse sanic Nic Cage actually drone. Bernie Sanders Patrick Stewart vega journalism Zoidberg pooch unidan dank IRL.'
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
