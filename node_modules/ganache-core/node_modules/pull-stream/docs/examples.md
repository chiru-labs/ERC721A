
This document describes some examples of where various features
of pull streams are used in simple real-world examples.

Much of the focus here is handling the error cases. Indeed,
distributed systems are _all about_ handling the error cases.

# A simple source that ends correctly. (read, end)

A normal file (source) is read, and sent to a sink stream
that computes some aggregation upon that input such as 
the number of bytes, or number of occurances of the `\n`
character (i.e. the number of lines).

The source reads a chunk of the file at each time it's called,
there is some optimium size depending on your operating system,
file system, physical hardware,
and how many other files are being read concurrently.

When the sink gets a chunk, it iterates over the characters in it
counting the `\n` characters. When the source returns `end` to the
sink, the sink calls a user provided callback.

# A source that may fail. (read, err, end)

A file is downloaded over http and written to a file.
The network should always be considered to be unreliable,
and you must design your system to recover if the download
fails. (For example if the wifi were to cut out).

The read stream is just the http download, and the sink
writes it to a temporary file. If the source ends normally,
the temporary file is moved to the correct location.
If the source errors, the temporary file is deleted.

(You could also write the file to the correct location,
and delete it if it errors, but the temporary file method has the advantage
that if the computer or process crashes it leaves only a temporary file
and not a file that appears valid. Stray temporary files can be cleaned up
or resumed when the process restarts.)

# A sink that may fail

If we read a file from disk, and upload it, then the upload is the sink that may error.
The file system is probably faster than the upload and
so it will mostly be waiting for the sink to ask for more data.
Usually the sink calls `read(null, cb)` and the source retrives chunks of the file
until the file ends. If the sink errors, it then calls `read(true, cb)`
and the source closes the file descriptor and stops reading.
In this case the whole file is never loaded into memory.

# A sink that may fail out of turn.

A http client connects to a log server and tails a log in realtime.
(Another process will write to the log file,
but we don't need to worry about that.)

The source is the server's log stream, and the sink is the client.
First the source outputs the old data, this will always be a fast
response, because that data is already at hand. When the old data is all
written then the output rate may drop significantly because the server (the source) will
wait for new data to be added to the file. Therefore,
it becomes much more likely that the sink will error (for example if the network connection
drops) while the source is waiting for new data. Because of this,
it's necessary to be able to abort the stream reading (after you called
read, but before it called back). If it was not possible to abort
out of turn, you'd have to wait for the next read before you can abort
but, depending on the source of the stream, the next read may never come.

# A through stream that needs to abort.

Say we wish to read from a file (source), parse each line as JSON (through),
and then output to another file (sink).
If the parser encounters illegal JSON then it will error and,
if this parsing is a fatal error, then the parser needs to abort the pipeline
from the middle. Here the source reads normaly, but then the through fails.
When the through finds an invalid line, it should first abort the source,
and then callback to the sink with an error. This way,
by the time the sink receives the error, the entire stream has been cleaned up.

(You could abort the source and error back to the sink in parallel.
However, if something happened to the source while aborting, for the user
discover this error they would have to call the source again with another callback, as
situation would occur only rarely users would be inclined to not handle it leading to
the possiblity of undetected errors.
Therefore, as it is better to have one callback at the sink, wait until the source
has finished cleaning up before callingback to the pink with an error.)

In some cases you may want the stream to continue, and the the through stream can just ignore
an any lines that do not parse. An example where you definately
want a through stream to abort on invalid input would be an encrypted stream, which
should be broken into chunks that are encrypted separately.
