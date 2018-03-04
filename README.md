# tao

Functional, aspect-oriented middleware for browser-side JavaScript and Node.js


# Examples

## Provides Middleware for Arbitrary Function Libraries

```javascript

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
    });
  
```
