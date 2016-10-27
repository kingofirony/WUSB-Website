'use strict';
const keystone = require('keystone');
const Pledge = keystone.list('Pledge');

exports = module.exports = (req, res) => {
	
  let view = new keystone.View(req, res);
  let locals = res.locals;

  // locals.section is used to set the currently selected
  // item in the header navigation.
  locals.section = 'pledge';

  console.log('YOOOOOOOO');
  console.log(locals);
  console.log('AYYYYYYYYYYYY');


  // Accept form post submit
  view.on('post', { action: 'pledge' }, next => {
    let newPledge = new Pledge.model({
      author: locals.user.id
    });   
    let updater = newPledge.getUpdateHandler(req, res, {
      errorMessage: 'There was an error submitting your pledge:'
    });

    updater.process(req.body, {
      flashErrors: true,
      logErrors: true,
      fields: 'firstName, lastName, address, phone, email, amount, gift, giftName, comments, method'
    }, err => {
      if (err) {
        locals.validationErrors = err.errors;
        next();
      } else {
        req.flash('success', 'Pledge submitted');
        res.redirect('/pledge');
      }
    });
  });

	view.render('pledge');
};
