'use strict';

/*!
 * ignore
 */

module.exports = Action;

/**
 * An action is an object representation of a function call. It contains
 * properties like the `name` of the function that was called, the first
 * argument to the function `params`, and a `promise`.
 *
 * @api public
 * @param {Object} obj the properties to assign to this action
 */

function Action(obj) {
  Object.assign(this, obj);
}

/**
 * The time at which this function was initially called.
 *
 * @api public
 * @property timestamp
 * @type Date
 * @memberOf Action
 */

Object.defineProperty(Action.prototype, 'timestamp', {
  configurable: false,
  enumerable: true,
  writable: true,
  value: null
});

/**
 * The name of the function being called. Currently, this cannot be changed.
 *
 * ```javascript
 * const lib = tao({
 *   stub: () => param => Promise.resolve(param)
 * })();
 *
 * lib.use(action => console.log(action.name));
 *
 * lib.stub(42); // Prints "stub"
 * ```
 *
 * @api public
 * @property name
 * @type String
 * @memberOf Action
 */

Object.defineProperty(Action.prototype, 'name', {
  configurable: false,
  enumerable: true,
  writable: true,
  value: null
});

/**
 * The first argument passed to the function. Generally, this will be an object.
 * You can change this parameter to whatever you like.
 *
 * ```javascript
 * const lib = tao({
 *   stub: () => param => Promise.resolve(param)
 * })();
 *
 * lib.use(action => { action.params = 'Hello'; });
 *
 * const res = await lib.stub(42); // `res` will be 'Hello'
 * ```
 *
 * @api public
 * @property params
 * @type Any
 * @memberOf Action
 */

Object.defineProperty(Action.prototype, 'params', {
  configurable: false,
  enumerable: true,
  writable: true,
  value: null
});

/**
 * The stack trace `new Error().stack` when the function was called
 *
 * @api public
 * @property originalStack
 * @type String
 * @memberOf Action
 */

Object.defineProperty(Action.prototype, 'originalStack', {
  configurable: false,
  enumerable: true,
  writable: true,
  value: null
});

/**
 * The promise the function call returns. The `promise` property is *not*
 * enumerable, so actions are serializable.
 *
 * @api public
 * @property promise
 * @memberOf Action
 */

Object.defineProperty(Action.prototype, 'promise', {
  configurable: false,
  enumerable: false,
  writable: true,
  value: null
});
