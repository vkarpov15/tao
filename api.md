# Action

## Action()

An action is an object representation of a function call. It contains
properties like the `name` of the function that was called, the first
argument to the function `params`, and a `promise`.

## Action.prototype.timestamp

The time at which this function was initially called.

## Action.prototype.name

The name of the function being called. Currently, this cannot be changed.

```javascript
const lib = tao({
  stub: () => param => Promise.resolve(param)
})();

lib.use(action => console.log(action.name));

lib.stub(42); // Prints "stub"
```

## Action.prototype.params

The first argument passed to the function. Generally, this will be an object.
You can change this parameter to whatever you like.

```javascript
const lib = tao({
  stub: () => param => Promise.resolve(param)
})();

lib.use(action => { action.params = 'Hello'; });

const res = await lib.stub(42); // `res` will be 'Hello'
```

## Action.prototype.originalStack

The stack trace `new Error().stack` when the function was called

## Action.prototype.promise

The promise the function call returns. The `promise` property is *not*
enumerable, so actions are serializable.

# Library

## Library()

A library is a hash of functions that all have the same dependencies and
share the same middleware structure. A library also lets you `wrap()` every
function in the library to integrate your library with other frameworks,
like Express or React.

## Library.prototype.$middleware

The middleware added to this library using the `use()` function.

## Library.prototype.use()

Add middleware to execute for every function call in this library. A
middleware is a function that takes a single parameter, an action, and
may return either:
a) a modified action
b) `undefined` to indicate the action hasn't changed
c) a promise that resolves to (a) or (b), or rejects to indicate an error

## Library.prototype.wrap()

Wraps every function in this library with a given function.

