# tao

Functional, aspect-oriented middleware for browser-side JavaScript and Node.js

[![CircleCI](https://circleci.com/gh/vkarpov15/tao.svg?style=svg)](https://circleci.com/gh/vkarpov15/tao)


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

## Integrates with Express

acquit:ignore:end

```javascript

    return co(function*() {
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
    });
  
```
