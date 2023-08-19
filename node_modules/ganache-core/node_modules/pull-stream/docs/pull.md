# pull-stream/pull

> pipe many pull streams into a pipeline

## Background

In pull-streams, you need a complete pipeline before data will flow.

That means: a source, zero or more throughs, and a sink.

But you can still create a _partial_ pipeline, which is a great for tiny pull-stream modules.

## Usage

```js
var pull = require('pull-stream/pull')
```

Create a simple complete pipeline:

```js
pull(source, sink) => undefined
```

Create a source modified by a through:

```js
pull(source, through) => source
```

Create a sink, but modify it's input before it goes.

```js
pull(through, sink) => sink
```

Create a through, by chainging several throughs:

```js
pull(through1, through2) => through
```

These streams combine just like normal streams.

```js
pull(
  pull(source, through),
  pull(through1, through2),
  pull(through, sink)
) => undefined
```

The complete pipeline returns undefined, because it cannot be piped to anything else.

Pipe duplex streams like this:

```js
var a = duplex()
var b = duplex()

pull(a.source, b.sink)
pull(b.source, a.sink)

//which is the same as

b.sink(a.source); a.sink(b.source)

//but the easiest way is to allow pull to handle this

pull(a, b, a)

//"pull from a to b and then back to a"
```

## Continuable

[Continuables](https://github.com/Raynos/continuable) let you defer a stream and handle the completion of the sink stream.  For example:

```js
var cont = pull(...streams, sink)

// ...

cont(function (err) {
  // stream finished
})
```

Or call beside it if you are not deferring:

```js
pull(...streams, sink)(function (err) {
  // stream finished
})
```

They are created by making a sink stream return a continuable, which uses it's callback and reads:

```js
function sink (read) {
  return function continuable (done) {
    // Do reads and eventually call `done`
    read(null, function (end, data) {
      if (end === true) return done(null)
      if (end) return done(end)
      // ... otherwise use `data`
    })
  }
}
```

## API

```js
var pull = require('pull-stream/pull')
```

### `pull(...streams)`

`pull` is a function that receives n-arity stream arguments and connects them into a pipeline.

`pull` detects the type of stream by checking function arity, if the function takes only one argument it's either a sink or a through. Otherwise it's a source. A duplex stream is an object with the shape `{ source, sink }`.

If the pipeline is complete (reduces into a source being passed into a sink), then `pull` returns `undefined`, as the data is flowing.

If the pipeline is partial (reduces into either a source, a through, or a sink), then `pull` returns the partial pipeline, as it must be composed with other streams before the data will flow.

## Install

With [npm](https://npmjs.org/) installed, run

```sh
$ npm install pull-stream
```

## See Also

- [`mafintosh/pump`](https://github.com/mafintosh/pump)
- [`mafintosh/pumpify`](https://github.com/mafintosh/pumpify)

## License

[MIT](https://tldrlegal.com/license/mit-license)
