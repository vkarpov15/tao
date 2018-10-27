const Action = require('../lib/Action');
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

  it('params', function() {
    return co(function*() {
      const lib = tao({
        stub: () => param => Promise.resolve(param)
      })();

      const params = [];
      lib.use(action => params.push(action.params));

      yield lib.stub({ key: 'value' });

      assert.deepEqual(params, [{ key: 'value' }]);
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
      });

      assert.equal(yield lib.math.plusOne(41), 42);
      assert.equal(yield lib.test.stub(42), 42);

      assert.equal(actions.length, 2);
      assert.deepEqual(actions.map(a => a.fnName), ['math.plusOne', 'test.stub']);
      assert.ok(actions[0] instanceof Action);
      assert.ok(actions[1] instanceof Action);
    });
  });

  it('throws if path is not object or function', function() {
    return co(function*() {
      assert.throws(function() {
        tao({ num: 5 })();
      }, /Expected object/);
    });
  });

  it('handles middleware that returns a promise', function() {
    return co(function*() {
      const lib = tao({
        stub: () => param => Promise.resolve(param),
        plusOne: () => param => Promise.resolve(param + 1)
      })();

      lib.use(co.wrap(function*(action) {
        yield cb => setTimeout(() => cb(), 100);
        action.params = 42;
      }));

      assert.equal(yield lib.stub('answer'), 42);
    });
  });

  it('middleware errors throw', function() {
    return co(function*() {
      let called = false;
      const lib = tao({
        stub: () => param => {
          called = true;
          return Promise.resolve(param)
        }
      })();

      lib.use(() => {
        throw new Error('Woops');
      });

      let threw = false;
      try {
        yield lib.stub();
      } catch (err) {
        threw = true;
        assert.equal(err.message, 'Woops');
      }

      assert.ok(threw);
    });
  });

  it('clone', function() {
    return co(function*() {
      const lib = tao({
        stub: () => param => {
          return Promise.resolve(param)
        }
      })();

      const fn1 = v => v;
      lib.use(fn1);

      const lib2 = lib.clone();

      assert.equal(yield lib2.stub(42), 42);
      assert.equal(lib2.$middleware.length, 1);
      assert.equal(lib2.$middleware[0], fn1);
    });
  });
});
