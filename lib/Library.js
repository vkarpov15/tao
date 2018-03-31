'use strict';

/*!
 * ignore
 */

const { applySpec } = require('ramda');

module.exports = Library;

/**
 * A library is a hash of functions that all have the same dependencies and
 * share the same middleware structure. A library also lets you `wrap()` every
 * function in the library to integrate your library with other frameworks,
 * like Express or React.
 *
 * @api public
 * @param {Object} obj hash of functions
 */

function Library() {}

/**
 * The middleware added to this library using the `use()` function.
 *
 * @api public
 * @property $middleware
 * @memberOf Library
 */

Object.defineProperty(Library.prototype, '$middleware', {
  enumerable: false,
  writable: false,
  configurable: false,
  value: []
});

/**
 * Add middleware to execute for every function call in this library. A
 * middleware is a function that takes a single parameter, an action, and
 * may return either:
 * a) a modified action
 * b) `undefined` to indicate the action hasn't changed
 * c) a promise that resolves to (a) or (b), or rejects to indicate an error
 *
 * @api public
 * @method use
 * @memberOf Library
 */

Object.defineProperty(Library.prototype, 'use', {
  enumerable: false,
  writable: false,
  configurable: false,
  value: function(fn) { this.$middleware.push(fn); }
});

/**
 * Wraps every function in this library with a given function.
 *
 * @api public
 * @method wrap
 * @memberOf Library
 */

Object.defineProperty(Library.prototype, 'wrap', {
  enumerable: false,
  writable: false,
  configurable: false,
  value: function(fn) {
    visit(this, fn);
    return this;
  }
});
