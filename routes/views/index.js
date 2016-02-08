var keystone = require('keystone');
var TextPost = keystone.list('TextPost');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'home';

	// Accept form post
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
			} else {
				req.flash('success', 'Post added');
			}
			next();
		});

	});
	
	// Render the view
	view.render('index');
};
