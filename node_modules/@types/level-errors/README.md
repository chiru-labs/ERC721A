# Installation
> `npm install --save @types/level-errors`

# Summary
This package contains type definitions for level-errors (https://github.com/Level/errors).

# Details
Files were exported from https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/level-errors.
## [index.d.ts](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/level-errors/index.d.ts)
````ts
// Type definitions for level-errors 3.0
// Project: https://github.com/Level/errors
// Definitions by: Junxiao Shi <https://github.com/yoursunny>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

export class LevelUPError extends Error {}

export class InitializationError extends LevelUPError {}

export class OpenError extends LevelUPError {}

export class ReadError extends LevelUPError {}

export class WriteError extends LevelUPError {}

export class NotFoundError extends LevelUPError {
    readonly notFound: true;
    readonly status: 404;
}

export class EncodingError extends LevelUPError {}

````

### Additional Details
 * Last updated: Wed, 30 Jun 2021 22:31:24 GMT
 * Dependencies: none
 * Global values: none

# Credits
These definitions were written by [Junxiao Shi](https://github.com/yoursunny).
