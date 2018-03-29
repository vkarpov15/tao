const assert = require('assert');
const co = require('co');
const tao = require('../');

describe('tao', function() {
  it('applies middleware to functions', function() {
    return co(function*() {
      const lib = tao({
        stub: () => param => Promise.resolve(param),
        plusOne: () => param => Promise.resolve(param + 1)
      })();

      assert.equal(yield lib.stub(42), 42);
      assert.equal(yield lib.plusOne(41), 42);

      // Always use `plusOne`
      lib.use(action => Object.assign(action, { fnName: 'plusOne' }));
      assert.equal(yield lib.stub(41), 41);
      assert.equal(yield lib.plusOne(41), 42);
    });
  });

  it('uses applySpec', function() {
    return co(function*() {
      const lib = tao({
        plusOne: x => param => Promise.resolve(param + x)
      })(1);

      assert.equal(yield lib.plusOne(41), 42);
    });
  });

  it('calling other functions', function() {
    return co(function*() {
      const lib = tao({
        plusOne: () => param => Promise.resolve(param + 1),
        plusTwo: lib => param => lib.plusOne(param).then(res => lib.plusOne(res))
      })();

      assert.equal(yield lib.plusTwo(40), 42);
    });
  });

  it('nested objects', function() {
    return co(function*() {
      const lib = tao({
        math: {
          plusOne: () => param => Promise.resolve(param + 1)
        },
        test: {
          stub: () => param => Promise.resolve(param)
        }
      })();

      const actions = [];
      lib.use(action => {
        actions.push(action);
      })

      assert.equal(yield lib.math.plusOne(41), 42);
      assert.equal(yield lib.test.stub(42), 42);

      assert.equal(actions.length, 2);
      assert.deepEqual(actions.map(a => a.fnName), ['math.plusOne', 'test.stub']);
      assert.ok(actions[0] instanceof require('../lib/Action'));
      assert.ok(actions[1] instanceof require('../lib/Action'));
    });
  });
});
