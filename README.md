# tao

Functional, aspect-oriented middleware for browser-side JavaScript and Node.js

[![CircleCI](https://circleci.com/gh/vkarpov15/tao.svg?style=svg)](https://circleci.com/gh/vkarpov15/tao)


# Examples

## Provides Middleware for Arbitrary Function Libraries


Tao is a framework for aspect-oriented programming that is meant to run
anywhere: client or server, React or Express, wherever you need
cross-cutting business logic. One mechanism Tao provides for aspect
oriented programming is middleware, or functions that run every time
you call a function in your Tao library.


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


Tao is meant to be a meta-framework that lets you write business logic
in a framework-agnostic way, and then use the `wrap()` function to
glue your business logic to a particular framework. For example, you
can write business logic and then `wrap()` your functions into
Express route handlers.


```javascript

    return co(function*() {
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
    });
  
```
