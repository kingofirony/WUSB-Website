'use strict';
const keystone = require('keystone');
const fs = require('fs');

exports = module.exports = function (req, res) {

	let view = new keystone.View(req, res);
	let locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'profile';

	// Accept form post submit
	view.on('post', { action: 'edit-profile' }, (next) => {

		function saveImage(image, callback) {
			const fileName = locals.user.slug;

			// Gives .jpg, .png, etc even if ext is not 3 char long
			const fileExt = image.name.substr(
				image.name.search(/\..+$/), image.name.length);

			fs.readFile(image.path, (err, image) => {
				fs.writeFile('public/images/profile/' + fileName + fileExt, 
				  image, (err) => {
					if (err) throw err;
					console.log('Saved ' + fileName + fileExt + '...');
					console.log('to public/images/profile');
				});
			});
			callback();
		}
		
		function acceptImageUpload(callback) {
			const image = req.files.profile_picture;
			if (image) {
				saveImage(image, (err) => {
					if (err) {
						callback(err);
					}
					else {
						locals.user.hasProfilePicture = true;
						locals.user.save(callback);
					}
				});
			}
			else {
				callback();
			}
		}
		
		if (!locals.user) {
			req.flash('error', 'Please log in');
			res.redirect('/keystone/signin');
			return;
		}
		
		let updater = locals.user.getUpdateHandler(req, res, {
			errorMessage: 'There was an error editing your profile:'
		});

		updater.process(req.body, {
			flashErrors: true,
			logErrors: true,
			fields: 'email, name, password'
		}, (err) => {
			if (err) {
				locals.validationErrors = err.errors;
				next();
			} else {
				acceptImageUpload((err) => {
					if (err) {
						locals.validationErrors = err.errors;
						next();
					}
					else {
						req.flash('success', 'Profile updated');
						res.redirect('/profile');
					}
				});
			}
		});
	});

	if (locals.user) {
		view.render('profile');  // Only render edit profile page if signed in
	}
	else {
		res.redirect('/keystone/signin');
	}
};
