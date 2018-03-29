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
