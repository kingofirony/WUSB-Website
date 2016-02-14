var keystone = require('keystone'),
	_ = require('underscore'),
	env = keystone.get('env'),
	User = keystone.list('User'),
	TextPost = keystone.list('TextPost');
	
if (env === 'development') {
	var posts = [
		{
			title: 'Post 1',
			textContent: 'blah blah blah'
		},
		{
			title: 'Post 2',
			textContent: 'WUSB :)'
		}
	];

	exports = module.exports = function (done) {
		User.model.findOne(function (err, user) {
			if (err) {
				console.error(err);
				done(err);
			}
			else {
				_.each(posts, function (post) {
					var textPost = new TextPost.model(post);
					textPost.author = user.id;
					textPost.save(function (err) {
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
