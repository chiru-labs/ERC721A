declare const _default: {
  encode(view: Uint8Array): string
  decode(input: string): Uint8Array
}

declare module 'nano-base32' {
  export default _default
}
