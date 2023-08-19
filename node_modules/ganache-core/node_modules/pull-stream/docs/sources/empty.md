# pull-stream/sources/empty

## usage

### `empty = require('pull-stream/sources/empty')`

### `empty()`

A stream with no contents (it just ends immediately)

``` js
pull(
  pull.empty(),
  pull.collect(function (err, ary) {
    console.log(arg)
    // ==> []
  })
}
```

