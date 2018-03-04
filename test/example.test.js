const assert = require('assert');
const co = require('co');
const sinon = require('sinon');
const tao = require('../');

describe('examples', function() {
  let stub;

  beforeEach(function() {
    sinon.stub(console, 'log');
  });

  afterEach(function() {
    console.log && console.log.restore();
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
});
