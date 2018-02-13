const Action = require('./lib/Action');
const { ObjectId } = require('bson');
const { applySpec } = require('ramda');
const co = require('co');
const debug = require('debug');
const get = require('lodash.get');

module.exports = _lib => function applyParamsAndMiddleware() {
  const _applySpec = applySpec(_lib);
  const lib = arguments.length ? _applySpec.apply(_applySpec, arguments) : _lib;

  Object.defineProperty(lib, '$middleware', {
    enumerable: false,
    writable: false,
    configurable: false,
    value: []
  });
  Object.defineProperty(lib, 'use', {
    enumerable: false,
    writable: false,
    configurable: false,
    value: fn => lib.$middleware.push(fn)
  });

  visit(lib);

  return lib;
}

function visit(lib, cur, curPath) {
  cur = cur || lib;
  curPath = curPath || [];

  if (typeof cur !== 'object') {
    throw new Error(`Expected object at path "${curPath}"`);
  }

  for (let path of Object.keys(cur)) {
    if (typeof cur[path] === 'function') {
      const $original = cur[path];
      cur[path] = _wrap(lib, curPath.concat([path]).join('.'));
      cur[path].$original = $original;
      continue;
    }
    visit(lib, cur[path], curPath.concat([path]));
  }
}

function _wrap(lib, fnName) {
  return function wrapped() {
    const args = arguments;
    return co(function*() {
      const callId = new ObjectId();
      const originalStack = new Error().stack;
      const startTime = Date.now();

      let actionReject;
      let actionResolve;
      let action = new Action({
        callId,
        timestamp: new Date(),
        params: args[0],
        fnName,
        originalStack,
        // "cold" promise, we'll kick it off after middleware with the
        // promise returned from the original function.
        promise: new Promise((resolve, reject) => {
          actionReject = reject
          actionResolve = resolve
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

      let res = get(lib, action.fnName).$original.call(null, args[0]);

      actionResolve(res);
      return action.promise;
    });
  };
}
