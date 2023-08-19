# pull-stream/throughs/flatten

## usage
### `flatten = require('pull-stream/throughs/flatten')`
### `flatten(streams)`
Turn a stream of streams or a stream of arrays into a stream of their items, (undoes group).


## example
```js
test('flatten arrays', function (t) {
  pull(
    pull.values([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ]),
    pull.flatten(),
    pull.collect(function (err, numbers) {
      t.deepEqual([1, 2, 3, 4, 5, 6, 7, 8, 9], numbers)
      t.end()
    })
  )
})

test('flatten stream of streams', function (t) {

  pull(
    pull.values([
      pull.values([1, 2, 3]),
      pull.values([4, 5, 6]),
      pull.values([7, 8, 9])
    ]),
    pull.flatten(),
    pull.collect(function (err, numbers) {
      t.deepEqual([1, 2, 3, 4, 5, 6, 7, 8, 9], numbers)
      t.end()
    })
  )

})
```
