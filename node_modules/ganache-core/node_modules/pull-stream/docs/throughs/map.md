# pull-stream/throughs/map

> [].map for pull-streams

## Background

Pull-streams are arrays of data in time rather than space.

As with a [`[].map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map), we may want to map a function over a stream.

## Example

```js
var map = require('pull-stream/throughs/map')
```

```js
pull(
  values([0, 1, 2, 3]),
  map(function (x) {
    return x * x
  }),
  log()
)
// 0
// 1
// 4
// 9
```

## Usage

### `map = require('pull-stream/throughs/map')`

### `map((data) => data)`

`map(fn)` returns a through stream that calls the given `fn` for each chunk of incoming data and outputs the return value, in the same order as before.

## Install

With [npm](https://npmjs.org/) installed, run

```
$ npm install pull-stream
```

## See Also

- [`brycebaril/through2-map`](https://github.com/brycebaril/through2-map)
- [`Rx.Obsevable#map`](http://xgrommx.github.io/rx-book/content/observable/observable_instance_methods/map.html)

## License

[MIT](https://tldrlegal.com/license/mit-license)
