const assert = require('assert');
const tao = require('../');

describe('tao', function() {
  it('applies middleware to functions', async function() {
    const lib = tao({
      stub: param => Promise.resolve(param),
      plusOne: param => Promise.resolve(param + 1)
    })();

    assert.equal(await lib.stub(42), 42);
    assert.equal(await lib.plusOne(41), 42);

    // Always use `plusOne`
    lib.use(action => Object.assign(action, { fnName: 'plusOne' }));
    assert.equal(await lib.stub(41), 42);
    assert.equal(await lib.plusOne(41), 42);
  });

  it('uses applySpec', async function() {
    const lib = tao({
      plusOne: x => param => Promise.resolve(param + x)
    })(1);

    assert.equal(await lib.plusOne(41), 42);
  });

  it('nested objects', async function() {
    const lib = tao({
      math: {
        plusOne: param => Promise.resolve(param + 1)
      },
      test: {
        stub: param => Promise.resolve(param)
      }
    })();

    const actions = [];
    lib.use(action => {
      actions.push(action);
    })

    assert.equal(await lib.math.plusOne(41), 42);
    assert.equal(await lib.test.stub(42), 42);

    assert.equal(actions.length, 2);
    assert.deepEqual(actions.map(a => a.fnName), ['math.plusOne', 'test.stub']);
    assert.ok(actions[0] instanceof require('../lib/Action'));
    assert.ok(actions[1] instanceof require('../lib/Action'));
  });
});
