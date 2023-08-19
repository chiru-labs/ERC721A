# pull-stream/sinks/drain

## usage

### `drain = require('pull-stream/sinks/drain')`

### `drain(op?, done?)`

Drain the stream, calling `op` on each `data`.
call `done` when stream is finished.
If op returns `===false`, abort the stream.
