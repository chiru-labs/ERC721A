# pull-stream/throughs/unique

## usage

### `unique = require('pull-stream/throughs/unique')`

### `unique(prop)`

Filter items that have a repeated value for `prop()`,
by default, `prop = function (it) {return it }`, if prop is a string,
it will filter nodes which have repeated values for that property.
