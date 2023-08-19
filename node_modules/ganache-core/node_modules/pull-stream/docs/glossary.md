# Glossary

## read (end, cb)

A function that retrives the next chunk.
All readable streams (sources, and throughs)
must return a `read` function.

## reader (read,...)

A function to create a reader. It takes a `read` function
as the first argument, and any other options after that.

When passed to `pipeable` or `pipeableSource`,
a new function is created that adds `.pipe(dest)`

## Lazy vs Eager

Lazy means to avoid doing something until you know you have
to do it.

Eager means to do something early, so you have it ready
immediately when you need it.

## [Source](sources/index.md)

The first stream in the pipeline. The Source is not a reader (not writable).

## [Sink](sinks/index.md)

The last stream in the pipeline. The Sink is not readable.

## [Through](throughs/index.md)

The stream (or streams) in the middle of the pipeline, between your source and sink.  A through is a reader and readable.

## Push vs Pull

A pull-stream is a stream where the movement of data
is initiated by the sink, and a push-stream
is a stream where the movement of data is initiated
by the source.

## Reader vs Writable

In push streams, destination streams (Through and Sink),
are _writable_. They are written to by the source streams.

In pull streams, destination streams _read_ from the source
streams. They are the active participant, so they are called
_readers_ rather than _writables_.
