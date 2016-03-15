'use strict';

exports = module.exports = (req, res) => {
	return res.json(res.locals.programs.map(p => p.title));
};
