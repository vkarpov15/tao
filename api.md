# Action

## Action()

An action is an object representation of a function call. It contains
properties like the `name` of the function that was called, the first
argument to the function `params`, and a `promise`.

## Action.prototype.promise

The promise the function call returns. The `promise` property is *not*
enumerable, so actions are serializable.

