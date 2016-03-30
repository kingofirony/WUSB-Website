/**
 * This file is where you define your application routes and controllers.
 * 
 * Start by including the middleware you want to run for every request;
 * you can attach middleware to the pre('routes') and pre('render') events.
 * 
 * For simplicity, the default setup for route controllers is for each to be
 * in its own file, and we import all the files in the /routes/views directory.
 * 
 * Each of these files is a route controller, and is responsible for all the
 * processing that needs to happen for the route (e.g. loading data, handling
 * form submissions, rendering the view template, etc).
 * 
 * Bind each route pattern your application should respond to in the function
 * that is exported from this module, following the examples below.
 * 
 * See the Express application routing documentation for more information:
 * http://expressjs.com/api.html#app.VERB
 */

const keystone = require('keystone');
const middleware = require('./middleware');
const importRoutes = keystone.importer(__dirname);

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

keystone.set('signin url', '/');

// Import Route Controllers
var routes = {
	views: importRoutes('./views'),
	api: importRoutes('./api'),
	post: importRoutes('./post')
};

// Setup Route Bindings
exports = module.exports = app => {
	
	app.all('/', routes.views.index);
	app.all('/sign-up', routes.views.sign_up); 
	app.all('/profile', middleware.requireUser, routes.views.profile);
	app.get('/playlists', routes.views.playlists);
	app.get('/programs', middleware.loadPrograms, routes.views.programs);
	
	// Playlist
	app.get('/playlist', routes.views.add_playlist);
	app.all('/playlist/:id*', middleware.loadPlaylist);
	app.get('/playlist/:id', routes.views.playlist);
	app.get('/playlist/:id/edit', middleware.requireUser, routes.views.edit_playlist);
	app.post('/playlist',middleware.requireUser,  routes.post.post_playlist);
	app.post('/playlist/:id/edit', middleware.requireUser, routes.post.post_playlist);
	
	// Program
	app.get('/program', routes.views.add_program);
	app.all('/program/:slug*', middleware.loadProgram);
	app.get('/program/:slug', middleware.loadProgram, routes.views.program);
	app.get('/program/:slug/edit', middleware.requireAdmin, routes.views.edit_program);
	app.post('/program', middleware.requireAdmin, routes.post.post_program);
	app.post('/program/:slug/edit', middleware.requireAdmin, routes.post.post_program);
	
	// API
	app.get('/api/users', middleware.loadUsers, routes.api.users);
	app.get('/api/programs', middleware.loadPrograms, routes.api.programs);
};
