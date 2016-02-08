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
			if (err) {
				return res.err(err);
			}
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

		// automatically pubish posts by admin users
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
	
	// Render the view
	view.render('index');
};
