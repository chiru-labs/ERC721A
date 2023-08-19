[![Build Status](https://travis-ci.org/hildjj/nofilter.svg?branch=master)](https://travis-ci.org/hildjj/nofilter)
[![Coverage Status](https://coveralls.io/repos/hildjj/nofilter/badge.svg?branch=master&service=github)](https://coveralls.io/github/hildjj/nofilter?branch=master)

# NoFilter

A node.js package to read and write a stream of data into or out of what looks
like a growable [Buffer](https://nodejs.org/api/buffer.html).

I kept needing this, and none of the existing packages seemed to have enough
features, test coverage, etc.

# Examples

As a data sink:
```javascript
var NoFilter = require('nofilter');
nf = new NoFilter();
nf.on('finish', function() {
  console.log(nf.toString('base64'));
});
process.stdin.pipe(nf);
```

As a data source:
```javascript
var NoFilter = require('nofilter');
nf = new NoFilter('010203', 'hex');
nf.pipe(process.stdout);
```

Read the [API Docs](http://hildjj.github.io/nofilter/).
