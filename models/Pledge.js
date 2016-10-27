'use strict';

const keystone = require('keystone');

// Docs: http://keystonejs.com/docs/database/#fieldtypes
const Types = keystone.Field.Types;

// Docs: http://keystonejs.com/docs/database/#lists-options
const options = {
  autokey: { path: 'slug', from: '_id', unique: true },
  singular: 'Pledge',
  plural: 'Pledges'
};

const Pledge = new keystone.List('Pledge', options);

Pledge.add({
  firstName: { type: Types.Text },
  lastName: { type: Types.Text },
  address : { type: Types.Text },
  phone : { type: Types.Number },
  email : { type: Types.Text },
  amount : { type: Types.Number },
  gift: { type: Types.Boolean, default: false },
  giftName: { type: Types.Text },
  comments: { type: Types.Text },
  method : { type: Types.Select, numeric: true, options: [{ value: 0, label: 'Mail invoice' }, { value: 1, label: 'Monthly credit card' }, { value: 2, label: 'Once credit card' }] }
});

Pledge.defaultColumns = 'firstName, lastName, address,' +
  ' email, amount';

Pledge.register();