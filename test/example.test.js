const assert = require('assert');
const co = require('co');
const express = require('express');
const get = require('lodash.get');
const sinon = require('sinon');
const superagent = require('superagent');
const tao = require('../');

describe('Examples', function() {
  let stub;

  beforeEach(function() {
    sinon.stub(console, 'log');
  });

  afterEach(function() {
    console.log.restore && console.log.restore();
  });

  /**
   * Tao is a framework for aspect-oriented programming that is meant to run
   * anywhere: client or server, React or Express, wherever you need
   * cross-cutting business logic. One mechanism Tao provides for aspect
   * oriented programming is middleware, or functions that run every time
   * you call a function in your Tao library.
   */

  it('Provides Middleware for Arbitrary Function Libraries', function() {
    return co(function*() {
      const lib = tao({
        // In tao, an "action" is a function that takes one parameter and
        // returns a promise
        stub: () => param => Promise.resolve(param),
        plusOne: () => param => Promise.resolve(param + 1)
      })();

      lib.use(action => {
        // Prints the name of the function (action) that was called
        // "stub"
        // "plusOne"
        console.log(action.name);
      });

      assert.equal(yield lib.stub(42), 42);
      assert.equal(yield lib.plusOne(41), 42);

      // acquit:ignore:start
      assert.equal(console.log.callCount, 2);
      assert.deepEqual(console.log.args[0], ['stub']);
      assert.deepEqual(console.log.args[1], ['plusOne']);
      // acquit:ignore:end
    });
  });

  /**
   * Tao is meant to be a meta-framework that lets you write business logic
   * in a framework-agnostic way, and then use the `wrap()` function to
   * glue your business logic to a particular framework. For example, you
   * can write business logic and then `wrap()` your functions into
   * Express route handlers.
   */

  it('Integrates with Express', function() {
    return co(function*() {
      // acquit:ignore:start
      console.log.restore();
      // acquit:ignore:end
      const app = express();

      const lib = tao({
        hello: () => params => {
          return Promise.resolve(params.val || 'Hello');
        }
      })();

      lib.wrap((lib, name) => {
        const fn = get(lib, name);
        return (req, res) => {
          fn(Object.assign({}, req.query, req.params)).
            then(val => res.send(val)).
            catch(err => res.status(500).send(err.message));
        };
      });

      app.get('*', lib.hello);

      const server = app.listen(3000);

      const { text } = yield superagent.get('http://localhost:3000/?val=hello');

      assert.equal(text, 'hello');

      // acquit:ignore:start
      server.close();
      // acquit:ignore:end
    });
  })
});
