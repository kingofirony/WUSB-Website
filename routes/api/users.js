'use strict';

exports = module.exports = (req, res) => {
	return res.json(res.locals.users.map(u => u.name.full));
};
