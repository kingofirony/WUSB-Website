// Keystone API Docs: https://github.com/keystonejs/keystone/wiki/Keystone-API

// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require('dotenv').load();

// Requires and constants if we need any
const keystone = require('keystone');
const http = require('http');

/* Sets up the server options. Consult the docs before editing.
	Docs: http://keystonejs.com/guide/config */
keystone.init({

	'name': 'WUSB',
	'brand': 'WUSB',
	
	'sass': 'public',
	'static': 'public',
	'favicon': 'public/favicon.ico',
	'views': 'templates/views',
	'view engine': 'jade',
	
	'auto update': true,
	'session': true,
	'auth': true,
	'user model': 'User'

	/* TODO: Remove this comment when the HTTPS certificate is ready. 
		Ensure the file names are accurate and are in the root directory. 
		Also, add a comma to the end of 'User' in the line above when 
		that happens.

	'ssl': 'only',
	'ssl key': 'private-key.pem',
	'ssl cert': 'public-cert.pem'
	//'ssl port': 8443 // !!! LOCAL ENVIRONMENT ONLY !!!
	*/

});

// Load the database schema models.
keystone.import('models');

// Setup common locals for your templates. The following are required for the
// bundled templates and layouts. Any runtime locals (that are set uniquely
// for each request) should be added to ./routes/middleware.js
keystone.set('locals', {
	_: require('underscore'),
	env: keystone.get('env'),
	utils: keystone.utils,
	editable: keystone.content.editable
});

// TODO: Will we use routes?
keystone.set('routes', require('./routes'));

// This sets up the navbar in the admin UI page.
keystone.set('nav', {
	'users': 'users',
	'posts': 'text-posts'
});

// Initialize the web server. It will also listen for the events specified.
// Docs: https://github.com/keystonejs/keystone/wiki/Keystone-API#startevents
keystone.start({

	onHttpServerCreated: function () {
		console.log('Server was started in non-secure mode!');
	}

	/* TODO: Remove this comment when HTTPS is ready.
	onHttpsServerCreated: function () {
		console.log('Server is HTTPS secured.);
	} */

});

/* TODO: Remove this comment when the HTTPS certificate is ready.
// Redirect stubborn http users
const httpPort = 80;
//const httpPort = 8000; // !!! LOCAL USE ONLY
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + 
    	req.headers['host'] + req.url });
    res.end();
}).listen(httpPort); */
