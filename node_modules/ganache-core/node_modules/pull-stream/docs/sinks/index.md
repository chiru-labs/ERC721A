# Sinks

A Sink is a stream that is not readable.
You *must* have a sink at the end of a pipeline
for data to move towards.

You can only use _one_ sink per pipeline.

``` js
pull(source, through, sink)
```

See also:
* [Sources](../sources/index.md)
* [Throughs](../throughs/index.md)

## [drain](./drain.md)
## [reduce](./reduce.md)
## [concat](./collect.md)
## [collect](./collect.md)
## [onEnd](./on-end.md)
## [log](./log.md)
