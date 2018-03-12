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

  it('Integrates with Express', function() {
    return co(function*() {
      // acquit:ignore:start
      console.log.restore();
      // acquit:ignore:end
      const app = express();

      const lib = tao({
        hello: () => req => {
          return Promise.resolve(req.query.val || 'Hello');
        }
      })();

      lib.wrap((lib, name) => {
        const fn = get(lib, name);
        return (req, res) => {
          fn(req).
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
