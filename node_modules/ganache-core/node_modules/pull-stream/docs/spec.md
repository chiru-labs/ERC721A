# Synopsis

In Pull-Streams, there are two fundamental types of streams `Source`s and `Sink`s. There are two composite types of streams `Through` (aka transform) and `Duplex`. A Through Stream is a sink stream that reads what goes into the Source Stream, it can also be written to. A duplex stream is a pair of streams (`{Source, Sink}`) streams.

# Pull-Streams
## Source Streams

A Source Stream (aka readable stream) is a asynchronous function that may be called repeatedly until it returns a terminal state. Pull-streams have back pressure, but it is implicit instead of sending an explicit back pressure signal. If a source
needs the sink to slow down, it may delay returning a read. If a sink needs the source to slow down, it just waits until it reads the source again.

For example, the Source Stream `fn(abort, cb)` may have an internal implementation that will read data from a disk or network. If `fn` is called with the first argument (`abort`) being truthy, the callback will be passed `abort` as it's first argument. The callback has three different argument configurations...

  1. `cb(null, data)`, indicates there there is data.
  2. `cb(true)`, indicates the stream has ended normally.
  3. `cb(error)`, indicates that there was an error.

The read method *must not* be called until the previous call has returned, except for a call to abort the stream.

### End
The stream may be terminated, for example `cb(err|end)`. The read method *must not* be called after it has terminated. As a normal stream end is propagated up the pipeline, an error should be propagated also, because it also means the end of the stream. If `cb(end=true)` that is a "end" which means it's a valid termination, if `cb(err)` that is an error.
`error` and `end` are mostly the same. If you are buffering inputs and see an `end`, process those inputs and then the end.
If you are buffering inputs and get an `error`, then you _may_ throw away that buffer and return the end.

### Abort
Sometimes it's the sink that errors, and if it can't read anymore then we _must_ abort the source. (example, source is a file stream from local fs, and sink is a http upload. prehaps the network drops or remote server crashes, in this case we should abort the source, so that it's resources can be released.)

To abort the sink, call read with a truthy first argument. You may abort a source _before_ it has returned from a regular read. (if you wait for the previous read to complete, it's possible you'd get a deadlock, if you a reading a stream that takes a long time, example, `tail -f` is reading a file, but nothing has appended to that file yet).

When a stream is aborted during a read, the callback provided to the read function *must* be called first, with an error, and then the abort callback.

## Sink Streams

A Sink Stream (aka writable stream) is a function that a Source Stream is passed to. The Sink Stream calls the `read` function of the Source Stream, abiding by the rules about when it may not call. 

### Abort
The Sink Stream may also abort the source if it can no longer read from it.

## Through Streams

A through stream is a sink stream that returns another source when it is passed a source.
A through stream may be thought of as wrapping a source.

## Duplex Streams

A pair of independent streams, one Source and one Sink. The purpose of a duplex stream is not transformation of the data that passes though it. It's meant for communication only.

# Composing Streams

Since a Sink is a function that takes a Source, a Source may be fed into a Sink by simply passing the Source to the Sink.
For example, `sink(source)`. Since a transform is a Sink that returns a Source, you can just add to that pattern by wrapping the source. For example, `sink(transform(source))`. This works, but it reads from right-to-left, and we are used to left-to-right.

A method for creating a left-to-rihght reading pipeline of pull-streams. For example, a method could implement the following interface...

```
pull([source] [,transform ...] [,sink ...])
```

The interface could alllow for the following scenarios...

1. Connect a complete pipeline: `pull(source, transform,* sink)` this connects a source to a sink via zero or more transforms.

2. If a sink is not provided: `pull(source, transform+)` then pull should return the last `source`,
this way streams can be easily combined in a functional way.

3. If a source is not provided: `pull(transform,* sink)` then pull should return a sink that will complete the pipeline when
it's passed a source. `function (source) { return pull(source, pipeline) }`
If neither a source or a sink are provided, this will return a source that will return another source (via 2) i.e. a through stream.
