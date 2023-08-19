{
  "variables": {
    "arch": "<!(node -p 'process.arch')",
  },
  "targets": [{
    "target_name": "keccak",
    "sources": [
      "./src/addon.cc",
    ],
    "conditions": [
      ["arch in ('arm64','ppc64','x64')",
        # For known 64-bit architectures, use the implementation optimized for 64-bit CPUs.
        {
          "sources": [
            "./src/libkeccak-64/KeccakSpongeWidth1600.c",
            "./src/libkeccak-64/KeccakP-1600-opt64.c",
          ],
          "defines": [
            "LIBKECCAK=64",
          ],
        },
        # Otherwise, use the implementation optimized for 32-bit CPUs.
        {
          "sources": [
            "./src/libkeccak-32/KeccakSpongeWidth1600.c",
            "./src/libkeccak-32/KeccakP-1600-inplace32BI.c",
          ],
          "defines": [
            "LIBKECCAK=32",
          ],
        },
      ],
    ],
    "include_dirs": [
      "<!(node -e \"require('nan')\")"
    ],
    "cflags": [
      "-Wall",
      "-Wno-maybe-uninitialized",
      "-Wno-uninitialized",
      "-Wno-unused-function",
      "-Wextra"
    ]
  }]
}
