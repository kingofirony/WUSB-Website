/* A primer on testing:
	Do not use arrow functions!	They bind 'this' weirdly and cause
		strange behavior in mocha.
	Clean up after yourself if you go into the database or you might
		break things that require fields to be unique.
	before, after, beforeEach, afterEach don't bind variables/consts.
	this.slow(###) sets the slow time in ms.
	Docs: https://mochajs.org/#getting-started
*/
'use strict';
const assert = require('assert');
const keystone = require('keystone');
const env = 'development';	// Keystone prefers this over "testing"
const uri = 'mongodb://localhost:27017/wusb_test';

describe('Keystone', function () {

	before(function () {
		keystone.init({
			'name': 'Test Mode',
			'brand': 'If you see this, notify us immediately',
			'cookie secret': 'I keep nothing secret',
			'port': 9001,	// No one will stumble onto the server this way
			'env': env,
			'mongo': uri,
			'views': 'templates/views',
			'headless': true 	// Stops most default behavior
		});
		keystone.import('../models');
		keystone.set('routes', require('../routes'));
		keystone.set('locals', {
			_: require('underscore'),
			env: env,
			utils: keystone.utils,
			editable: keystone.content.editable
		});
	});

  	describe('#server.js', function () {
  		this.slow(1000);

    	it('should start up without error.', function (done) {
      		keystone.start({
      			onHttpServerCreated: function (err) {
      				if (err) throw err;
      				done();
      			}
      		});
    	});
  	});

  	describe('models/', function () {
        this.slow(500); // DB operations take longer in dev mode.

  		describe('#User.js', function () {

  			it('should accept this user', function (done) {
  				const User = keystone.list('User');
  				const newUser = new User.model({
  					name: 'Hi',
  					email: 'test1@test.com',
  					password: 'test'
  				});
  				newUser.save(function (err) {
  					if (err) throw err;
  					done();
  				});
  			});

  			it('should NOT accept this user', function (done) {
  				const User = keystone.list('User');
  				const badUser = new User.model({
  					name: 'Lol',
  					email: 'bad@test.com',
  					isConfirmed: 130
  				});
  				badUser.save(function (err) {
  					if (err) done();
  					else throw 'Saved a bad user... isConfirmed was wrong ' +
  						'type and password was missing.';
  				});
  			});

  			after(function () {
  				const User = keystone.list('User');
  				User.model.remove({ email: 'test1@test.com' }, 
                  function (err) {
  					if (err) console.log(err);
  				});
  				User.model.remove({ email: 'bad@test.com' }, 
                  function (err) {
  					if (err) console.log(err);
  				});
  			})
  		});

      describe('#TextPost.js', function () {

        before(function () {
            const User = keystone.list('User');
            const firstUser = new User.model({
                name: 'User1',
                email: '1@test.com',
                password: 'test'
            });
            firstUser.save(function (err) {
            });
        });

        it('should accept this post (unpublished)', function (done) {
            const TextPost = keystone.list('TextPost');
            const User = keystone.list('User');
            const assocOne = User.model.findOne({ email: '1@test.com' })
            .exec(function (err, assocOne) {
                const newPost = new TextPost.model({
                    title: 'Test',
                    author: assocOne._id,
                    textContent: '<p>Hi</p>'
                });
                newPost.save(function (err) {
                    if (err) throw err;
                    done();
                });
            });
        });

        it('should set the publishedAt date properly', function (done) {
            const TextPost = keystone.list('TextPost');
            TextPost.model.update({ title: 'Test' },
                { $set: { isPublished: true } },
                function (err) {
                    if (err) throw err;
                    done();
                });
        });

        it('should increment the edit count when appropriate', function () {
            const TextPost = keystone.list('TextPost');
            TextPost.model.findOne( { title: 'Test' })
            .exec(function (err, post) {
                if (err) throw err;
                post.textContent = '<p>Hello</p>'
                post.save(function (err) {
                    if (err) throw err;
                    assert.equal(1, post.editCount);
                });
            });
        });

        after(function () {
            const TextPost = keystone.list('TextPost');
            const User = keystone.list('User');
            TextPost.model.remove({ title: 'Test' },
                function (err) {
            });
            User.model.remove({ email: '1@test.com' },
                function (err) {
            });
        });
      });

      describe('#Playlist.js', function () {
        it('should accept a basic playlist (unpublished)');
        it('should update assoc\'d program when published');
        it('should accept JSON for serializedTracks');
      });

      describe('#Program.js', function () {

        before(function () {
            const User = keystone.list('User');
            const newUser = new User.model({
                    name: 'Hello World',
                    email: 'test@test.com',
                    password: 'test'
            });
            newUser.save(function (err) {
            });
        });

        it('should accept a program', function (done) {
            const Program = keystone.list('Program');
            const User = keystone.list('User');
            const assocUser = User.model.findOne({ 
                email: 'test@test.com' 
            }).exec(function (err, assocUser) {
                if (err) throw err;
                const prg = new Program.model({
                    title: 'Test',
                    djs: assocUser._id,
                    genre: 'Testing Music',
                    day: 0,
                    startTime: 1,
                    endTime: 3
                });
                prg.save(function (err) {
                    if (err) throw err;
                    done();
                });
            });
        });

        it('should perform bounds checks on programs');
        it('should perform special bounds checks on biweekly programs');
        it('should associate created playlists with itself');

        after(function () {
            const Program = keystone.list('Program');
            const User = keystone.list('User');
            User.model.remove({ email: 'test@test.com' },
                function (err) {
            });
            Program.model.remove({ title: 'Test' },
                function (err) { 
            });
        });

      });
  	});
});
