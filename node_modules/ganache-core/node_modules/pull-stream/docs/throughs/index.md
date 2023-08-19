# Throughs

A Through is a stream that both reads and is read by
another stream.

Through streams are optional.

Put through streams in-between [sources](../sources/index.md) and [sinks](../sinks/index.md),
like this:

```js
pull(source, through, sink)
```

Also, if you don't have the source/sink yet,
you can pipe multiple through streams together
to get one through stream!

```js
var throughABC = function () {
  return pull(
    throughA(),
    throughB(),
    throughC()
  )
}
```

Which can then be treated like a normal through stream!

```js
pull(source(), throughABC(), sink())
```

See also:
* [Sources](../sources/index.md)
* [Sinks](../sinks/index.md)

## [map](./map.md)
## [asyncMap](./async-map.md)
## [filter](./filter.md)
## [filterNot](./filter-not.md)
## [unique](./unique.md)
## [nonUnique](./non-unique.md)
## [take](./take.md)
## [flatten](./flatten.md)
