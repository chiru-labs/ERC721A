# pull-stream/throughs/filter

## usage

### `filter = require('pull-stream/throughs/filter')`

### `filter(test)`

Like `[].filter(function (data) {return true || false})`
only `data` where `test(data) == true` are let through
to the next stream.

`test` defaults to `function id (e) { return e }` this means
any truthy javascript value is allowed through.
