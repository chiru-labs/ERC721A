# pull-stream/throughs/async-map

## usage

### `asyncMap = require('pull-stream/throughs/async-map')`

### `asyncMap(fn)`

Like [`map`](./map.md) but the signature of `fn` must be
`function (data, cb) { cb(null, data) }`
