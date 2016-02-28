'use strict';
const keystone = require('keystone');

// Docs: http://keystonejs.com/docs/database/#fieldtypes
const Types = keystone.Field.Types;

const options = {
	autokey: { path: 'slug', from: 'name', unique: true },
	singular: 'User',
	plural: 'Users'
};

// Default user accounts... might be good enough, maybe worth changing.
const User = new keystone.List('User', options);

User.add({
	name: { type: Types.Name, required: true, index: true },
	email: { type: Types.Email, initial: true, required: true, index: true, 
		unique: true },
	// Docs: Passwords are automatically encrypted
	password: { type: Types.Password, initial: true, required: true },
	isConfirmed: { type: Boolean, default: false },
	hasProfilePicture: { type: Boolean, default: false }
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Can access Keystone', index: true }
});

// Provide access to the Keystone admin pane if isAdmin is true
// Docs: This is also how you add public functions to the DB schema.
User.schema.virtual('canAccessKeystone').get(function () {
	return this.isAdmin;
});


/* When someone is browsing the admin pane, they'll see the DB columns
	in this order. */
User.defaultColumns = 'name, email, isAdmin';

// Docs: If you don't do this, the Model won't be available to Keystone.
User.register();
