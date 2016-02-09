/**
 * This script automatically creates a default Admin user when an
 * empty database is used for the first time. You can use this
 * technique to insert data into any List you have defined.
 * 
 * Alternatively, you can export a custom function for the update:
 * module.exports = function(done) { ... }
 */

// TODO: MAKE SURE THE USER CREATED BY THIS IS DELETED IN PROD. !!!
exports.create = function() {
	console.log('ATTN: An empty MongoDB instance was used!' +
		' If this was unintentional, please check that your' +
		' mongo instance is set up properly.');
	return {
		User: [
			{
				'name.first': 'Admin',
				'name.last': 'User',
				email: 'user@keystonejs.com',
				password: 'admin',
				isAdmin: true
			}
		]
	};
}();

/*

// This is the long-hand version of the functionality above:

var keystone = require('keystone'),
	async = require('async'),
	User = keystone.list('User');

var admins = [
	{ email: 'user@keystonejs.com', password: 'admin', name: { first: 'Admin', last: 'User' } }
];

function createAdmin(admin, done) {
	
	var newAdmin = new User.model(admin);
	
	newAdmin.isAdmin = true;
	newAdmin.save(function(err) {
		if (err) {
			console.error("Error adding admin " + admin.email + " to the database:");
			console.error(err);
		} else {
			console.log("Added admin " + admin.email + " to the database.");
		}
		done(err);
	});
	
}

exports = module.exports = function(done) {
	async.forEach(admins, createAdmin, done);
};

*/
