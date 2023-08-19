# pull-stream/throughs/take

## Example usage

```js
var pull = require('pull-stream')
// var take = require('pull-stream/throughs/take') // if you just need take

pull(
  pull.values(['a', 'b', 'c', 'd', 'e']),
  pull.take(3),
  pull.collect((err, data) => {
    console.log(data)
    // => ['a', 'b', 'c']
  })
)
```

## API

take has 2 valid signatures: 

### `take(n) => through`

Where `n` is a positive integer.
`take` pulls n values from the source and then closes the stream.
This is really useful for limiting how much you pull.

### `take(testFn [, opts]) => through`

If `testFn` is a function, read data from the source stream and forward it downstream until `testFn(data)` returns false, then close the stream.

`opts` is an optional Object of form `{ last: Boolean }`, where `opts.last` determines whether the last value tested (before closing the stream) is included or excluded (default). e.g.

```js
pull(
  pull.values([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
  pull.take(n => n < 4.6), { last: true }),  // include the last value tested (5)
  pull.collect(function (err, results) {
    console.log(results)
    // => [1, 2, 3, 4, 5]
  })
})
```

```js
pull(
  pull.values([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
  pull.take(n => n < 4.6), { last: false }),  // exclude the last value tested (5)
  pull.collect(function (err, results) {
    console.log(results)
    // => [1, 2, 3, 4]
  })
})
```
