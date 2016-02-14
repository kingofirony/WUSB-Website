var keystone = require('keystone');
var TextPost = keystone.list('TextPost');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'home';
	
	// Load posts
	view.on('init', function (next) {
		TextPost.model.find()
			.populate('author', 'name')
			.exec(function (err, posts) {
			if (err) return res.err(err);
			locals.posts = posts;
			next();
		});
	});
	
	// Accept form post submit
	view.on('post', { action: 'create-post' }, function(next) {

		// handle form
		var newPost = new TextPost.model({
				author: locals.user.id,
				publishedDate: new Date()
			}),

			updater = newPost.getUpdateHandler(req, res, {
				errorMessage: 'There was an error creating your new post:'
			});

		// automatically publish posts by admin users
		if (locals.user.isAdmin) {
			newPost.state = 'published';
		}

		updater.process(req.body, {
			flashErrors: true,
			logErrors: true,
			fields: 'title, textContent'
		}, function(err) {
			if (err) {
				locals.validationErrors = err.errors;
				next();
			} else {
				req.flash('success', 'Post added');
				res.redirect('/');
			}
			
		});
	});

	// Delete a post
	view.on('get', { remove: 'post' }, function (next) {
		if (!req.user) {
			req.flash('error', 'You must be signed in to delete a post.');
			return next();
		}
		TextPost.model.findOne({
				_id: req.query.post
			})
			.exec(function (err, post) {
				if (err) {
					if (err.name === 'CastError') {
						req.flash('error', 'The post ' + req.query.post + ' could not be found.');
						return next();
					}
					return res.err(err);
				}
				if (!post) {
					req.flash('error', 'The post ' + req.query.post + ' could not be found.');
					return next();
				}
				if (post.author != req.user.id) {
					req.flash('error', 'Sorry, you must be the author of a post to delete it.');
					return next();
				}
				post.remove(function (err) {
					if (err) return res.err(err);
					req.flash('success', 'Your post has been deleted.');
					return res.redirect('/');
				});
			});
	});
	
	// Render the view
	view.render('index');
};
