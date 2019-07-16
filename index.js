'use strict';

const Library = require('./lib/Library');

module.exports = _lib => function applyParamsAndMiddleware() {
  return new Library(_lib, arguments);
};

module.exports.Action = require('./lib/Action');
module.exports.Library = Library;
