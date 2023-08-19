# pure-rand
#### Pure random number generator written in TypeScript

[![Build Status](https://github.com/dubzzz/pure-rand/workflows/Build%20Status/badge.svg?branch=main)](https://github.com/dubzzz/pure-rand/actions)
[![npm version](https://badge.fury.io/js/pure-rand.svg)](https://badge.fury.io/js/pure-rand)
[![dependencies Status](https://david-dm.org/dubzzz/pure-rand/status.svg)](https://david-dm.org/dubzzz/pure-rand)
[![devDependencies Status](https://david-dm.org/dubzzz/pure-rand/dev-status.svg)](https://david-dm.org/dubzzz/pure-rand?type=dev)

[![codecov](https://codecov.io/gh/dubzzz/pure-rand/branch/main/graph/badge.svg?token=KYN5IQCGE5)](https://codecov.io/gh/dubzzz/pure-rand)
[![Maintainability](https://api.codeclimate.com/v1/badges/7cb8cb395740446a3108/maintainability)](https://codeclimate.com/github/dubzzz/pure-rand/maintainability)

## Getting started

### In node

Install the module with: `npm install pure-rand`

Unlike classical random number generators, `pure-rand` comes with a set of *pure* and *seeded* generators (implementing the interface [RandomGenerator](https://github.com/dubzzz/pure-rand/blob/main/src/generator/RandomGenerator.ts)).
Each time a call to `.next()` method is done, the generator provides both the generated value and the next generator.

As a consequence, a given generator will always produce the same value. It can be called as many times as required without impacting its state. This ability makes it easier to replay code section relying on random without having to re-seed a new generator and replay the whole path to be in the same state.

### In a web-page

In order to use `pure-rand` from a web-page, you have to reference the web-aware script as follow:

```html
<script type="module">
   import * as prand from "https://unpkg.com/pure-rand/lib/esm/pure-rand.js";
   // prand is now available
</script>
```

You can also reference a precise version by setting the version you want in the url:

```html
<script type="module">
   import * as prand from "https://unpkg.com/pure-rand@1.2.0/lib/esm/pure-rand.js";
   // prand is now available
</script>
```

## Usage

```javascript
import prand from 'pure-rand'

const seed = 42;

// Instanciates a Mersenne Twister
// random number generator with the seed=42
const gen1 = prand.mersenne(seed);

// Build a random value `n` and the next generator `gen2`
// the random value `n` is within the range:
// gen1.min() (included) to gen1.max() (included)
const [n, gen2] = gen1.next();
// Calling again next on gen1 will provide the very same output:
// `n: number` and `gen2: RandomGenerator`

// In order to generate values within range,
// distributions are provided by the pure-rand

// Like `.next()` method,
// distributions take an incoming generator and extract a couple:
// (n: number, nextGenerator: RandomGenerator)

// The distribution built by the call to prand.uniformIntDistribution(0, 9)
// generates uniformly integers within 0 (included) and 9 (included)
const [nRange, gen3] = prand.uniformIntDistribution(0, 9)(gen1);
// Calling again the same Distribution with the same RandomGenerator
// will provide the same output

// Whenever you want to use the distribution only once you can directly call
// prand.uniformIntDistribution(from, to, rng) which is totally equivalent to prand.uniformIntDistribution(from, to)(rng)
// In terms of performances, the 3 parameters version is faster
const [nNoDistributionInstance, gen4] = prand.uniformIntDistribution(0, 9, gen3);

// Some generators come with built-in jump
// jump provides the ability to skip a very large number of intermediate values
// Calling jump is recommended whenever you want to build non-overlapping subsequences
const gen4 = prand.xoroshiro128plus(seed);
const offsetGen4 = gen4.jump();
// In the case of:
// - xoroshiro128plus - jump is equivalent to 2^64 calls to next
// - xorshift128plus  - jump is equivalent to 2^64 calls to next
```

Module import can also be done using one of the following syntaxes:

```javascript
import * as prand from 'pure-rand';
import { mersenne } from 'pure-rand';
const prand = require('pure-rand');
const { mersenne } = require('pure-rand');
```

## Documentation

### Random number generators

All the [RandomGenerator](https://github.com/dubzzz/pure-rand/blob/main/src/generator/) provided by `pure-rand` derive from the interface [RandomGenerator](https://github.com/dubzzz/pure-rand/blob/main/src/generator/RandomGenerator.ts) and are pure and seeded as described above.

The following generators are available:
- `prand.xorshift128plus(seed: number)`: xorshift128+ generator whose values are within the range -0x80000000 to 0x7fffffff
- `prand.xoroshiro128plus(seed: number)`: xoroshiro128+ generator whose values are within the range -0x80000000 to 0x7fffffff
- `prand.mersenne(seed: number)`: Mersenne Twister generator whose values are within the range 0 to 0xffffffff
- `prand.congruential(seed: number)`: Linear Congruential generator whose values are within the range 0 to 0x7fff
- `prand.congruential32(seed: number)`: Linear Congruential generator whose values are within the range 0 to 0xffffffff

Some helpers are also provided in order to ease the use of `RandomGenerator` instances:
- `prand.generateN(rng: RandomGenerator, num: number): [number[], RandomGenerator]`: generates `num` random values using `rng` and return the next `RandomGenerator`
- `prand.skipN(rng: RandomGenerator, num: number): RandomGenerator`: skips `num` random values and return the next `RandomGenerator`

### Distributions

All the [Distribution](https://github.com/dubzzz/pure-rand/tree/main/src/distribution) take a `RandomGenerator` as input and produce a couple `(n: number, nextGenerator: RandomGenerator)`. A `Distribution` is defined as `type Distribution<T> = (rng: RandomGenerator) => [T, RandomGenerator];`.

For the moment, available `Distribution` are:
- `prand.uniformIntDistribution(from: number, to: number): Distribution<number>`
- `prand.uniformBigIntDistribution(from: bigint, to: bigint): Distribution<bigint>`\*
- `prand.uniformArrayIntDistribution(from: ArrayInt, to: ArrayInt): Distribution<ArrayInt>`\*\*

\*Requires your JavaScript interpreter to support bigint

\*\*ArrayInt is an object having the structure `{sign, data}` with sign being either 1 or -1 and data an array of numbers between 0 (included) and 0xffffffff (included)
