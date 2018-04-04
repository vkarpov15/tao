'use strict';

/*!
 * ignore
 */

const Action = require('./Action');
const { applySpec } = require('ramda');
const co = require('co');
const debug = require('debug');
const get = require('lodash.get');

module.exports = Library;

/**
 * A library is a hash of functions that all have the same dependencies and
 * share the same middleware structure. A library also lets you `wrap()` every
 * function in the library to integrate your library with other frameworks,
 * like Express or React.
 *
 * @api public
 * @param {Object} obj hash of functions
 * @param {Array} args arguments to pass into each function
 */

function Library(obj, args) {
  this.$middleware = [];

  const _applySpec = applySpec(obj);
  const _args = Array.prototype.slice.call(args).concat([this]);

  // Check to see if every path in `obj` is an object or function, otherwise
  // ramda throws a not-user-friendly error.
  visit(obj, v => v);
  Object.assign(this, _applySpec.apply(_applySpec, _args));
  visit(this, _wrap);
}

/**
 * The middleware added to this library using the `use()` function.
 *
 * @api public
 * @property $middleware
 * @memberOf Library
 */

Object.defineProperty(Library.prototype, '$middleware', {
  enumerable: false,
  writable: true,
  configurable: false,
  value: null
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

/*!
 * ignore
 */

function visit(lib, wrap, cur, curPath) {
  cur = cur || lib;
  curPath = curPath || [];

  if (typeof cur !== 'object') {
    throw new Error(`Expected object at path "${curPath}"`);
  }

  for (let path of Object.keys(cur)) {
    if (typeof cur[path] === 'function') {
      cur[path] = wrap(lib, curPath.concat([path]).join('.'));
      continue;
    }
    visit(lib, wrap, cur[path], curPath.concat([path]));
  }
}

/*!
 * ignore
 */

function _wrap(lib, fnName) {
  const _fn = get(lib, fnName);
  return function wrapped() {
    const args = arguments;
    return co(function*() {
      const originalStack = new Error().stack;
      const startTime = Date.now();

      let actionReject;
      let actionResolve;
      let action = new Action({
        timestamp: new Date(),
        params: args[0],
        name: fnName,
        fnName,
        originalStack,
        // "cold" promise, we'll kick it off after middleware with the
        // promise returned from the original function.
        promise: new Promise((resolve, reject) => {
          actionReject = reject;
          actionResolve = resolve;
        })
      });

      for (const middleware of lib.$middleware) {
        try {
          const res = middleware(action);
          if (res != null && typeof res.then === 'function') {
            action = (yield res) || action;
          } else {
            action = res || action;
          }
        } catch (error) {
          actionReject(error);
          return action.promise;
        }
      }

      let res = _fn.call(null, args[0]);

      actionResolve(res);
      return action.promise;
    });
  };
}
