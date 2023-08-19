import test from 'ava'
import chalk from 'chalk'
import chromafi from '.'

// Encode: provides escaped ansi sequence strings
// that can be used as the expected result value
// eslint-disable-next-line no-unused-vars
const encode = result => {
	// eslint-disable-next-line no-console
	console.log(result)
	const json = JSON.stringify(result)
	const output = json.replace(/'/g, '\\\'')
	// eslint-disable-next-line no-console
	console.log(output)
}

test('JavaScript function', t => {
	function add (a, b) {
		return a + b
	}
	const result = chromafi(add)
	t.is(result, '\u001b[37m\u001b[90m1\u001b[37m \u001b[37m\u001b[31mfunction\u001b[37m \u001b[32madd\u001b[37m(\u001b[34ma, b\u001b[37m) \u001b[37m{ \u001b[39m\n\u001b[37m\u001b[90m2\u001b[37m     \u001b[31mreturn\u001b[37m a + b;    \u001b[39m\n\u001b[37m\u001b[90m3\u001b[37m }                    \u001b[39m\n\u001b[37m\u001b[39m')
})

test('JavaScript arrow function', t => {
	const add = (a, b) => {
		return a + b
	}
	const result = chromafi(add)
	t.is(result, '\u001b[37m\u001b[90m1\u001b[37m \u001b[31mconst\u001b[37m add = \u001b[37m(\u001b[34ma, b\u001b[37m) =>\u001b[37m { \u001b[39m\n\u001b[37m\u001b[90m2\u001b[37m     \u001b[31mreturn\u001b[37m a + b;       \u001b[39m\n\u001b[37m\u001b[90m3\u001b[37m }                       \u001b[39m\n\u001b[37m\u001b[39m')
})

test('JavaScript object, preserve tabs, w/o lineNumbers', t => {
	const obj = {
		foo: 'bar',
		baz: 1337,
		qux: true,
		zxc: null,
		// eslint-disable-next-line object-shorthand
		'foogle-bork': function (a, b) {
			return b - a
		}
	}
	const result = chromafi(obj, {
		tabsToSpaces: false,
		lineNumbers: false
	})
	t.is(result, '\u001b[37m{                                       \u001b[39m\n\u001b[37m\t\u001b[33mfoo:\u001b[37m \u001b[33m\'bar\'\u001b[37m,                     \u001b[39m\n\u001b[37m\t\u001b[33mbaz:\u001b[37m \u001b[32m1337\u001b[37m,                      \u001b[39m\n\u001b[37m\t\u001b[33mqux:\u001b[37m \u001b[35mtrue\u001b[37m,                      \u001b[39m\n\u001b[37m\t\u001b[33mzxc:\u001b[37m \u001b[35mnull\u001b[37m,                      \u001b[39m\n\u001b[37m\t\u001b[36m\'foogle-bork\':\u001b[37m \u001b[37m\u001b[37m\u001b[31mfunction\u001b[37m (\u001b[34ma, b\u001b[37m) \u001b[37m{\u001b[39m\n\u001b[37m\t\t\u001b[31mreturn\u001b[37m b - a;           \u001b[39m\n\u001b[37m\t}\u001b[37m                               \u001b[39m\n\u001b[37m}                                       \u001b[39m\n\u001b[37m\u001b[39m')
})

test('JavaScript object w/ deep functions', t => {
	const obj = {
		foo: {
			bar: {
				baz: {
					qux: {
						'z-x-c': (x, y) => {
							return y * x
						}
					}
				}
			}
		},
		// eslint-disable-next-line object-shorthand
		'foogle-bork': function (a, b) {
			return b - a
		}
	}
	const result = chromafi(obj, {
		tabsToSpaces: false,
		lineNumbers: false
	})
	t.is(result, '\u001b[37m{                                                            \u001b[39m\n\u001b[37m\t\u001b[33mfoo:\u001b[37m {                                               \u001b[39m\n\u001b[37m\t\t\u001b[33mbar:\u001b[37m {                                       \u001b[39m\n\u001b[37m\t\t\t\u001b[33mbaz:\u001b[37m {                               \u001b[39m\n\u001b[37m\t\t\t\t\u001b[33mqux:\u001b[37m {                       \u001b[39m\n\u001b[37m\t\t\t\t\t\u001b[36m\'z-x-c\':\u001b[37m \u001b[37m(x, y) => { \u001b[39m\n\u001b[37m\t\t\t\t\t\t\u001b[31mreturn\u001b[37m y * x;\u001b[39m\n\u001b[37m\t\t\t\t\t}\u001b[37m                    \u001b[39m\n\u001b[37m\t\t\t\t}                            \u001b[39m\n\u001b[37m\t\t\t}                                    \u001b[39m\n\u001b[37m\t\t}                                            \u001b[39m\n\u001b[37m\t},                                                   \u001b[39m\n\u001b[37m\t\u001b[36m\'foogle-bork\':\u001b[37m \u001b[37m\u001b[37m\u001b[31mfunction\u001b[37m (\u001b[34ma, b\u001b[37m) \u001b[37m{                     \u001b[39m\n\u001b[37m\t\t\u001b[31mreturn\u001b[37m b - a;                                \u001b[39m\n\u001b[37m\t}\u001b[37m                                                    \u001b[39m\n\u001b[37m}                                                            \u001b[39m\n\u001b[37m\u001b[39m')
})

test('JavaScript code string', t => {
	const code = `
	const a = 2
	function abc = (d, e, f) { return 'foo' }
	const b = 2
	const c = (a, b) => {
		return b - a
	}

	var str = "Hello, world!"

	console.log(true, null, new Date())

	const jsObj = {
		foo: 'bar',
		baz: 1337,
		qux: true,
		'test-thing': 'cool',
		zxc: null,
		spqr: function (a, b) {
			return b - a
		}
	}
	`
	const result = chromafi(code, {
		colors: {
			lineNumbers: chalk.bgBlue.white
		}
	})
	t.is(result, '\u001b[37m\u001b[44m\u001b[37m 1\u001b[37m\u001b[49m                                               \u001b[39m\n\u001b[37m\u001b[44m\u001b[37m 2\u001b[37m\u001b[49m     \u001b[31mconst\u001b[37m a = \u001b[32m2\u001b[37m                               \u001b[39m\n\u001b[37m\u001b[44m\u001b[37m 3\u001b[37m\u001b[49m     \u001b[37m\u001b[31mfunction\u001b[37m \u001b[32mabc\u001b[37m = (\u001b[34md, e, f\u001b[37m) \u001b[37m{ \u001b[31mreturn\u001b[37m \u001b[33m\'foo\'\u001b[37m } \u001b[39m\n\u001b[37m\u001b[44m\u001b[37m 4\u001b[37m\u001b[49m     \u001b[31mconst\u001b[37m b = \u001b[32m2\u001b[37m                               \u001b[39m\n\u001b[37m\u001b[44m\u001b[37m 5\u001b[37m\u001b[49m     \u001b[31mconst\u001b[37m c = \u001b[37m(\u001b[34ma, b\u001b[37m) =>\u001b[37m {                     \u001b[39m\n\u001b[37m\u001b[44m\u001b[37m 6\u001b[37m\u001b[49m         \u001b[31mreturn\u001b[37m b - a                          \u001b[39m\n\u001b[37m\u001b[44m\u001b[37m 7\u001b[37m\u001b[49m     }                                         \u001b[39m\n\u001b[37m\u001b[44m\u001b[37m 8\u001b[37m\u001b[49m                                               \u001b[39m\n\u001b[37m\u001b[44m\u001b[37m 9\u001b[37m\u001b[49m     \u001b[31mvar\u001b[37m str = \u001b[33m"Hello, world!"\u001b[37m                 \u001b[39m\n\u001b[37m\u001b[44m\u001b[37m10\u001b[37m\u001b[49m                                               \u001b[39m\n\u001b[37m\u001b[44m\u001b[37m11\u001b[37m\u001b[49m     \u001b[34mconsole\u001b[37m.log(\u001b[35mtrue\u001b[37m, \u001b[35mnull\u001b[37m, \u001b[31mnew\u001b[37m \u001b[34mDate\u001b[37m())       \u001b[39m\n\u001b[37m\u001b[44m\u001b[37m12\u001b[37m\u001b[49m                                               \u001b[39m\n\u001b[37m\u001b[44m\u001b[37m13\u001b[37m\u001b[49m     \u001b[31mconst\u001b[37m jsObj = {                           \u001b[39m\n\u001b[37m\u001b[44m\u001b[37m14\u001b[37m\u001b[49m         \u001b[33mfoo\u001b[37m: \u001b[33m\'bar\'\u001b[37m,                           \u001b[39m\n\u001b[37m\u001b[44m\u001b[37m15\u001b[37m\u001b[49m         \u001b[33mbaz\u001b[37m: \u001b[32m1337\u001b[37m,                            \u001b[39m\n\u001b[37m\u001b[44m\u001b[37m16\u001b[37m\u001b[49m         \u001b[33mqux\u001b[37m: \u001b[35mtrue\u001b[37m,                            \u001b[39m\n\u001b[37m\u001b[44m\u001b[37m17\u001b[37m\u001b[49m         \u001b[33m\'test-thing\'\u001b[37m: \u001b[33m\'cool\'\u001b[37m,                 \u001b[39m\n\u001b[37m\u001b[44m\u001b[37m18\u001b[37m\u001b[49m         \u001b[33mzxc\u001b[37m: \u001b[35mnull\u001b[37m,                            \u001b[39m\n\u001b[37m\u001b[44m\u001b[37m19\u001b[37m\u001b[49m         \u001b[33mspqr\u001b[37m: \u001b[37m\u001b[31mfunction\u001b[37m (\u001b[34ma, b\u001b[37m) \u001b[37m{               \u001b[39m\n\u001b[37m\u001b[44m\u001b[37m20\u001b[37m\u001b[49m             \u001b[31mreturn\u001b[37m b - a                      \u001b[39m\n\u001b[37m\u001b[44m\u001b[37m21\u001b[37m\u001b[49m         }                                     \u001b[39m\n\u001b[37m\u001b[44m\u001b[37m22\u001b[37m\u001b[49m     }                                         \u001b[39m\n\u001b[37m\u001b[44m\u001b[37m23\u001b[37m\u001b[49m                                               \u001b[39m\n\u001b[37m\u001b[39m')
})

test('Highlights ARM assembler syntax', t => {
	const asm = `
	.text

	.global connect
	connect:
		mov     r3, #2              ; s->sin_family = AF_INET
		strh    r3, [sp]
		ldr     r3, =server_port    ; s->sin_port = server_port
		ldr     r3, [r3]
		strh    r3, [sp, #2]
		ldr     r3, =server_addr    ; s->sin_addr = server_addr
		ldr     r3, [r3]
		str     r3, [sp, #4]
		mov     r3, #0              ; bzero(&s->sin_zero)
		str     r3, [sp, #8]
		str     r3, [sp, #12]
		mov     r1, sp      ; const struct sockaddr *addr = sp

		ldr     r7, =connect_call
		ldr     r7, [r7]
		swi     #0

		add     sp, sp, #16
		pop     {r0}        ; pop sockfd

		pop     {r7}
		pop     {fp, ip, lr}
		mov     sp, ip
		bx      lr

	.data
	socket_call:   .long 281
	connect_call:  .long 283

	/* all addresses are network byte-order (big-endian) */
	server_addr:            .long 0x0100007f ; localhost
	server_port:            .hword 0x0b1a
	`
	const lang = 'arm'
	const opts = {lang}
	const result = chromafi(asm, opts)
	t.is(result, '\u001b[37m\u001b[90m 1\u001b[37m                                                                 \u001b[39m\n\u001b[37m\u001b[90m 2\u001b[37m     \u001b[36m.text\u001b[37m                                                       \u001b[39m\n\u001b[37m\u001b[90m 3\u001b[37m                                                                 \u001b[39m\n\u001b[37m\u001b[90m 4\u001b[37m     \u001b[36m.global\u001b[37m connect                                             \u001b[39m\n\u001b[37m\u001b[90m 5\u001b[37m \u001b[36m    connect:\u001b[37m                                                    \u001b[39m\n\u001b[37m\u001b[90m 6\u001b[37m         \u001b[31mmov\u001b[37m     \u001b[34mr3\u001b[37m, \u001b[32m#2\u001b[37m              \u001b[37m\u001b[2m; s->sin_family = AF_INET\u001b[22m\u001b[37m   \u001b[39m\n\u001b[37m\u001b[90m 7\u001b[37m         \u001b[31mstrh\u001b[37m    \u001b[34mr3\u001b[37m, [\u001b[34msp\u001b[37m]                                        \u001b[39m\n\u001b[37m\u001b[90m 8\u001b[37m         \u001b[31mldr\u001b[37m     \u001b[34mr3\u001b[37m, \u001b[36m=server_port\u001b[37m    \u001b[37m\u001b[2m; s->sin_port = server_port\u001b[22m\u001b[37m \u001b[39m\n\u001b[37m\u001b[90m 9\u001b[37m         \u001b[31mldr\u001b[37m     \u001b[34mr3\u001b[37m, [\u001b[34mr3\u001b[37m]                                        \u001b[39m\n\u001b[37m\u001b[90m10\u001b[37m         \u001b[31mstrh\u001b[37m    \u001b[34mr3\u001b[37m, [\u001b[34msp\u001b[37m, \u001b[32m#2\u001b[37m]                                    \u001b[39m\n\u001b[37m\u001b[90m11\u001b[37m         \u001b[31mldr\u001b[37m     \u001b[34mr3\u001b[37m, \u001b[36m=server_addr\u001b[37m    \u001b[37m\u001b[2m; s->sin_addr = server_addr\u001b[22m\u001b[37m \u001b[39m\n\u001b[37m\u001b[90m12\u001b[37m         \u001b[31mldr\u001b[37m     \u001b[34mr3\u001b[37m, [\u001b[34mr3\u001b[37m]                                        \u001b[39m\n\u001b[37m\u001b[90m13\u001b[37m         \u001b[31mstr\u001b[37m     \u001b[34mr3\u001b[37m, [\u001b[34msp\u001b[37m, \u001b[32m#4\u001b[37m]                                    \u001b[39m\n\u001b[37m\u001b[90m14\u001b[37m         \u001b[31mmov\u001b[37m     \u001b[34mr3\u001b[37m, \u001b[32m#0\u001b[37m              \u001b[37m\u001b[2m; bzero(&s->sin_zero)\u001b[22m\u001b[37m       \u001b[39m\n\u001b[37m\u001b[90m15\u001b[37m         \u001b[31mstr\u001b[37m     \u001b[34mr3\u001b[37m, [\u001b[34msp\u001b[37m, \u001b[32m#8\u001b[37m]                                    \u001b[39m\n\u001b[37m\u001b[90m16\u001b[37m         \u001b[31mstr\u001b[37m     \u001b[34mr3\u001b[37m, [\u001b[34msp\u001b[37m, \u001b[32m#12\u001b[37m]                                   \u001b[39m\n\u001b[37m\u001b[90m17\u001b[37m         \u001b[31mmov\u001b[37m     \u001b[34mr1\u001b[37m, \u001b[34msp\u001b[37m      \u001b[37m\u001b[2m; const struct sockaddr *addr = sp\u001b[22m\u001b[37m  \u001b[39m\n\u001b[37m\u001b[90m18\u001b[37m                                                                 \u001b[39m\n\u001b[37m\u001b[90m19\u001b[37m         \u001b[31mldr\u001b[37m     \u001b[34mr7\u001b[37m, \u001b[36m=connect_call\u001b[37m                               \u001b[39m\n\u001b[37m\u001b[90m20\u001b[37m         \u001b[31mldr\u001b[37m     \u001b[34mr7\u001b[37m, [\u001b[34mr7\u001b[37m]                                        \u001b[39m\n\u001b[37m\u001b[90m21\u001b[37m         \u001b[31mswi\u001b[37m     \u001b[32m#0\u001b[37m                                              \u001b[39m\n\u001b[37m\u001b[90m22\u001b[37m                                                                 \u001b[39m\n\u001b[37m\u001b[90m23\u001b[37m         \u001b[31madd\u001b[37m     \u001b[34msp\u001b[37m, \u001b[34msp\u001b[37m, \u001b[32m#16\u001b[37m                                     \u001b[39m\n\u001b[37m\u001b[90m24\u001b[37m         \u001b[31mpop\u001b[37m     {\u001b[34mr0\u001b[37m}        \u001b[37m\u001b[2m; pop sockfd\u001b[22m\u001b[37m                        \u001b[39m\n\u001b[37m\u001b[90m25\u001b[37m                                                                 \u001b[39m\n\u001b[37m\u001b[90m26\u001b[37m         \u001b[31mpop\u001b[37m     {\u001b[34mr7\u001b[37m}                                            \u001b[39m\n\u001b[37m\u001b[90m27\u001b[37m         \u001b[31mpop\u001b[37m     {\u001b[34mfp\u001b[37m, \u001b[34mip\u001b[37m, \u001b[34mlr\u001b[37m}                                    \u001b[39m\n\u001b[37m\u001b[90m28\u001b[37m         \u001b[31mmov\u001b[37m     \u001b[34msp\u001b[37m, \u001b[34mip\u001b[37m                                          \u001b[39m\n\u001b[37m\u001b[90m29\u001b[37m         \u001b[31mbx\u001b[37m      \u001b[34mlr\u001b[37m                                              \u001b[39m\n\u001b[37m\u001b[90m30\u001b[37m                                                                 \u001b[39m\n\u001b[37m\u001b[90m31\u001b[37m     \u001b[36m.data\u001b[37m                                                       \u001b[39m\n\u001b[37m\u001b[90m32\u001b[37m \u001b[36m    socket_call:\u001b[37m   \u001b[36m.long\u001b[37m \u001b[32m281\u001b[37m                                    \u001b[39m\n\u001b[37m\u001b[90m33\u001b[37m \u001b[36m    connect_call:\u001b[37m  \u001b[36m.long\u001b[37m \u001b[32m283\u001b[37m                                    \u001b[39m\n\u001b[37m\u001b[90m34\u001b[37m                                                                 \u001b[39m\n\u001b[37m\u001b[90m35\u001b[37m     \u001b[37m\u001b[2m/* all addresses are network byte-order (big-endian) */\u001b[22m\u001b[37m     \u001b[39m\n\u001b[37m\u001b[90m36\u001b[37m \u001b[36m    server_addr:\u001b[37m            \u001b[36m.long\u001b[37m \u001b[32m0x0100007f\u001b[37m \u001b[37m\u001b[2m; localhost\u001b[22m\u001b[37m        \u001b[39m\n\u001b[37m\u001b[90m37\u001b[37m \u001b[36m    server_port:\u001b[37m            \u001b[36m.hword\u001b[37m \u001b[32m0x0b1a\u001b[37m                       \u001b[39m\n\u001b[37m\u001b[90m38\u001b[37m                                                                 \u001b[39m\n\u001b[37m\u001b[39m')
})

test('Light background, tabsToSpaces', t => {
	const obj = {
		foo: 'bar',
		baz: 1337,
		qux: true,
		zxc: null,
		// eslint-disable-next-line object-shorthand
		'foogle-bork': function (a, b) {
			return b - a
		}
	}
	const options = {
		lineNumberPad: 1,
		colors: {
			base: chalk.bgWhite.black.bold,
			keyword: chalk.red,
			number: chalk.blue.dim,
			function: chalk.black,
			title: chalk.blue,
			params: chalk.black,
			string: chalk.black,
			builtIn: chalk.blue,
			literal: chalk.blue,
			attr: chalk.black,
			trailingSpace: chalk,
			regexp: chalk.blue,
			lineNumbers: chalk.bgBlue.white
		}
	}
	const result = chromafi(obj, options)
	t.is(result, '\u001b[47m\u001b[30m\u001b[1m\u001b[44m\u001b[37m 1 \u001b[30m\u001b[47m {                                    \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\u001b[44m\u001b[37m 2 \u001b[30m\u001b[47m     \u001b[30mfoo:\u001b[30m \u001b[30m\'bar\'\u001b[30m,                      \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\u001b[44m\u001b[37m 3 \u001b[30m\u001b[47m     \u001b[30mbaz:\u001b[30m \u001b[34m\u001b[2m1337\u001b[1m\u001b[30m,                       \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\u001b[44m\u001b[37m 4 \u001b[30m\u001b[47m     \u001b[30mqux:\u001b[30m \u001b[34mtrue\u001b[30m,                       \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\u001b[44m\u001b[37m 5 \u001b[30m\u001b[47m     \u001b[30mzxc:\u001b[30m \u001b[34mnull\u001b[30m,                       \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\u001b[44m\u001b[37m 6 \u001b[30m\u001b[47m     \u001b[36m\'foogle-bork\':\u001b[30m \u001b[30m\u001b[30m\u001b[31mfunction\u001b[30m (\u001b[30ma, b\u001b[30m) \u001b[30m{ \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\u001b[44m\u001b[37m 7 \u001b[30m\u001b[47m         \u001b[31mreturn\u001b[30m b - a;                \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\u001b[44m\u001b[37m 8 \u001b[30m\u001b[47m     }\u001b[30m                                \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\u001b[44m\u001b[37m 9 \u001b[30m\u001b[47m }                                    \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\u001b[22m\u001b[39m\u001b[49m')
})

test('Preserve tabs with background colors and line numbers', t => {
	const obj = {
		foo: 'bar',
		baz: 1337,
		qux: true,
		zxc: null,
		// eslint-disable-next-line object-shorthand
		'foogle-bork': function (a, b) {
			return b - a
		}
	}
	const options = {
		lang: 'javascript',
		lineNumberStart: 1000000000000000,
		tabsToSpaces: false,
		colors: {
			base: chalk.bgWhite.black.bold,
			keyword: chalk.red,
			number: chalk.blue.dim,
			function: chalk.black,
			title: chalk.blue,
			params: chalk.black,
			string: chalk.black,
			builtIn: chalk.blue,
			literal: chalk.blue,
			attr: chalk.black,
			trailingSpace: chalk,
			regexp: chalk.blue,
			lineNumbers: chalk.bgBlue.white
		}
	}
	const result = chromafi(obj, options)
	t.is(result, '\u001b[47m\u001b[30m\u001b[1m\u001b[44m\u001b[37m1000000000000000\u001b[30m\u001b[47m{                                       \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\u001b[44m\u001b[37m1000000000000001\u001b[30m\u001b[47m\t\u001b[30mfoo:\u001b[30m \u001b[30m\'bar\'\u001b[30m,                     \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\u001b[44m\u001b[37m1000000000000002\u001b[30m\u001b[47m\t\u001b[30mbaz:\u001b[30m \u001b[34m\u001b[2m1337\u001b[1m\u001b[30m,                      \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\u001b[44m\u001b[37m1000000000000003\u001b[30m\u001b[47m\t\u001b[30mqux:\u001b[30m \u001b[34mtrue\u001b[30m,                      \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\u001b[44m\u001b[37m1000000000000004\u001b[30m\u001b[47m\t\u001b[30mzxc:\u001b[30m \u001b[34mnull\u001b[30m,                      \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\u001b[44m\u001b[37m1000000000000005\u001b[30m\u001b[47m\t\u001b[36m\'foogle-bork\':\u001b[30m \u001b[30m\u001b[30m\u001b[31mfunction\u001b[30m (\u001b[30ma, b\u001b[30m) \u001b[30m{\u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\u001b[44m\u001b[37m1000000000000006\u001b[30m\u001b[47m\t\t\u001b[31mreturn\u001b[30m b - a;           \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\u001b[44m\u001b[37m1000000000000007\u001b[30m\u001b[47m\t}\u001b[30m                               \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\u001b[44m\u001b[37m1000000000000008\u001b[30m\u001b[47m}                                       \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\u001b[22m\u001b[39m\u001b[49m')
})

test('Preserve tabs with background colors w/o line numbers', t => {
	const obj = {
		foo: 'bar',
		baz: 1337,
		qux: true,
		zxc: null,
		// eslint-disable-next-line object-shorthand
		'foogle-bork': function (a, b) {
			return b - a
		}
	}
	const options = {
		lineNumbers: false,
		tabsToSpaces: false,
		colors: {
			base: chalk.bgWhite.black.bold,
			keyword: chalk.red,
			number: chalk.blue.dim,
			function: chalk.black,
			title: chalk.blue,
			params: chalk.black,
			string: chalk.black,
			builtIn: chalk.blue,
			literal: chalk.blue,
			attr: chalk.black,
			trailingSpace: chalk,
			regexp: chalk.blue,
			lineNumbers: chalk.bgBlue.white
		}
	}
	const result = chromafi(obj, options)
	t.is(result, '\u001b[47m\u001b[30m\u001b[1m{                                       \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\t\u001b[30mfoo:\u001b[30m \u001b[30m\'bar\'\u001b[30m,                     \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\t\u001b[30mbaz:\u001b[30m \u001b[34m\u001b[2m1337\u001b[1m\u001b[30m,                      \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\t\u001b[30mqux:\u001b[30m \u001b[34mtrue\u001b[30m,                      \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\t\u001b[30mzxc:\u001b[30m \u001b[34mnull\u001b[30m,                      \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\t\u001b[36m\'foogle-bork\':\u001b[30m \u001b[30m\u001b[30m\u001b[31mfunction\u001b[30m (\u001b[30ma, b\u001b[30m) \u001b[30m{\u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\t\t\u001b[31mreturn\u001b[30m b - a;           \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\t}\u001b[30m                               \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m}                                       \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\u001b[22m\u001b[39m\u001b[49m')
})

test('TabsToSpaces=2, w/ bgColor', t => {
	const obj = {
		foo: 'bar',
		baz: 1337,
		qux: true,
		zxc: null,
		// eslint-disable-next-line object-shorthand
		'foogle-bork': function (a, b) {
			return b - a
		}
	}
	const options = {
		lineNumbers: true,
		tabsToSpaces: 2,
		lineNumberPad: 1,
		colors: {
			base: chalk.bgWhite.black.bold,
			keyword: chalk.red,
			number: chalk.blue.dim,
			function: chalk.black,
			title: chalk.blue,
			params: chalk.black,
			string: chalk.black,
			builtIn: chalk.blue,
			literal: chalk.blue,
			attr: chalk.black,
			trailingSpace: chalk,
			regexp: chalk.blue,
			lineNumbers: chalk.bgBlue.white
		}
	}
	const result = chromafi(obj, options)
	t.is(result, '\u001b[47m\u001b[30m\u001b[1m\u001b[44m\u001b[37m 1 \u001b[30m\u001b[47m {                                  \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\u001b[44m\u001b[37m 2 \u001b[30m\u001b[47m   \u001b[30mfoo:\u001b[30m \u001b[30m\'bar\'\u001b[30m,                      \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\u001b[44m\u001b[37m 3 \u001b[30m\u001b[47m   \u001b[30mbaz:\u001b[30m \u001b[34m\u001b[2m1337\u001b[1m\u001b[30m,                       \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\u001b[44m\u001b[37m 4 \u001b[30m\u001b[47m   \u001b[30mqux:\u001b[30m \u001b[34mtrue\u001b[30m,                       \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\u001b[44m\u001b[37m 5 \u001b[30m\u001b[47m   \u001b[30mzxc:\u001b[30m \u001b[34mnull\u001b[30m,                       \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\u001b[44m\u001b[37m 6 \u001b[30m\u001b[47m   \u001b[36m\'foogle-bork\':\u001b[30m \u001b[30m\u001b[30m\u001b[31mfunction\u001b[30m (\u001b[30ma, b\u001b[30m) \u001b[30m{ \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\u001b[44m\u001b[37m 7 \u001b[30m\u001b[47m     \u001b[31mreturn\u001b[30m b - a;                  \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\u001b[44m\u001b[37m 8 \u001b[30m\u001b[47m   }\u001b[30m                                \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\u001b[44m\u001b[37m 9 \u001b[30m\u001b[47m }                                  \u001b[22m\u001b[39m\u001b[49m\n\u001b[47m\u001b[30m\u001b[1m\u001b[22m\u001b[39m\u001b[49m')
})

test('No padding (line or number), tabsToSpaces=2', t => {
	const obj = {foobar: 1337}
	const options = {
		lineNumberPad: 0,
		codePad: 0,
		tabsToSpaces: 2,
		lineNumbers: true,
		colors: {
			base: chalk.bgBlack.white.bold,
			lineNumbers: chalk.bgCyan.black
		}
	}
	const result = chromafi(obj, options)
	t.is(result, '\u001b[40m\u001b[37m\u001b[1m\u001b[46m\u001b[30m1\u001b[37m\u001b[40m{             \u001b[22m\u001b[39m\u001b[49m\n\u001b[40m\u001b[37m\u001b[1m\u001b[46m\u001b[30m2\u001b[37m\u001b[40m  \u001b[33mfoobar:\u001b[37m \u001b[32m1337\u001b[37m\u001b[22m\u001b[39m\u001b[49m\n\u001b[40m\u001b[37m\u001b[1m\u001b[46m\u001b[30m3\u001b[37m\u001b[40m}             \u001b[22m\u001b[39m\u001b[49m\n\u001b[40m\u001b[37m\u001b[1m\u001b[22m\u001b[39m\u001b[49m')
})

test('TabsToSpaces=0 (Zero-width indent) \\u0000', t => {
	// eslint-disable-next-line quotes
	const obj = {foobar: 1337, bax: {qux: {wombat: "BOO!"}}}

	const options = {
		lineNumberPad: 0,
		codePad: 0,
		tabsToSpaces: 0,
		lineNumbers: true,
		colors: {
			base: chalk.bgBlack.white.bold,
			lineNumbers: chalk.bgCyan.black
		}
	}
	const result = chromafi(obj, options)
	t.is(result, '\u001b[40m\u001b[37m\u001b[1m\u001b[46m\u001b[30m1\u001b[37m\u001b[40m{             \u001b[22m\u001b[39m\u001b[49m\n\u001b[40m\u001b[37m\u001b[1m\u001b[46m\u001b[30m2\u001b[37m\u001b[40m\u001b[33mfoobar:\u001b[37m \u001b[32m1337\u001b[37m, \u001b[22m\u001b[39m\u001b[49m\n\u001b[40m\u001b[37m\u001b[1m\u001b[46m\u001b[30m3\u001b[37m\u001b[40m\u001b[33mbax:\u001b[37m {        \u001b[22m\u001b[39m\u001b[49m\n\u001b[40m\u001b[37m\u001b[1m\u001b[46m\u001b[30m4\u001b[37m\u001b[40m\u001b[33mqux:\u001b[37m {        \u001b[22m\u001b[39m\u001b[49m\n\u001b[40m\u001b[37m\u001b[1m\u001b[46m\u001b[30m5\u001b[37m\u001b[40m\u001b[33mwombat:\u001b[37m \u001b[33m\'BOO!\'\u001b[37m\u001b[22m\u001b[39m\u001b[49m\n\u001b[40m\u001b[37m\u001b[1m\u001b[46m\u001b[30m6\u001b[37m\u001b[40m}             \u001b[22m\u001b[39m\u001b[49m\n\u001b[40m\u001b[37m\u001b[1m\u001b[46m\u001b[30m7\u001b[37m\u001b[40m}             \u001b[22m\u001b[39m\u001b[49m\n\u001b[40m\u001b[37m\u001b[1m\u001b[46m\u001b[30m8\u001b[37m\u001b[40m}             \u001b[22m\u001b[39m\u001b[49m\n\u001b[40m\u001b[37m\u001b[1m\u001b[22m\u001b[39m\u001b[49m')
})

test('Highlights HTML string', t => {
	const html = '<body>\n\t<div>\n\t\t<span>Good</span>\n\t\t<span>Bad</span>\n\t</div>\n<body>'
	const result = chromafi(html, {
		lang: 'html'
	})
	t.is(result, '\u001b[37m\u001b[90m1\u001b[37m \u001b[34m<\u001b[36mbody\u001b[34m>\u001b[37m                    \u001b[39m\n\u001b[37m\u001b[90m2\u001b[37m     \u001b[34m<\u001b[36mdiv\u001b[34m>\u001b[37m                 \u001b[39m\n\u001b[37m\u001b[90m3\u001b[37m         \u001b[34m<\u001b[36mspan\u001b[34m>\u001b[37mGood\u001b[34m</\u001b[36mspan\u001b[34m>\u001b[37m \u001b[39m\n\u001b[37m\u001b[90m4\u001b[37m         \u001b[34m<\u001b[36mspan\u001b[34m>\u001b[37mBad\u001b[34m</\u001b[36mspan\u001b[34m>\u001b[37m  \u001b[39m\n\u001b[37m\u001b[90m5\u001b[37m     \u001b[34m</\u001b[36mdiv\u001b[34m>\u001b[37m                \u001b[39m\n\u001b[37m\u001b[90m6\u001b[37m \u001b[34m<\u001b[36mbody\u001b[34m>\u001b[37m                    \u001b[39m\n\u001b[37m\u001b[39m')
})

test('Line number offset/start', t => {
	const html = '<body>\n\t<div>\n\t\t<span>Good</span>\n\t\t<span>Bad</span>\n\t</div>\n<body>'
	const result = chromafi(html, {
		lang: 'html',
		lineNumberStart: 123
	})
	t.is(result, '\u001b[37m\u001b[90m123\u001b[37m \u001b[34m<\u001b[36mbody\u001b[34m>\u001b[37m                    \u001b[39m\n\u001b[37m\u001b[90m124\u001b[37m     \u001b[34m<\u001b[36mdiv\u001b[34m>\u001b[37m                 \u001b[39m\n\u001b[37m\u001b[90m125\u001b[37m         \u001b[34m<\u001b[36mspan\u001b[34m>\u001b[37mGood\u001b[34m</\u001b[36mspan\u001b[34m>\u001b[37m \u001b[39m\n\u001b[37m\u001b[90m126\u001b[37m         \u001b[34m<\u001b[36mspan\u001b[34m>\u001b[37mBad\u001b[34m</\u001b[36mspan\u001b[34m>\u001b[37m  \u001b[39m\n\u001b[37m\u001b[90m127\u001b[37m     \u001b[34m</\u001b[36mdiv\u001b[34m>\u001b[37m                \u001b[39m\n\u001b[37m\u001b[90m128\u001b[37m \u001b[34m<\u001b[36mbody\u001b[34m>\u001b[37m                    \u001b[39m\n\u001b[37m\u001b[39m')
})

test('Multiline highlight, replacing color', t => {
	const html = '<body>\n\t<div>\n\t\t<span>Good</span>\n\t\t<span>Bad<span>\n\t<div>\n</body>'

	const result = chromafi(html, {
		lang: 'html',
		lineNumbers: false,
		codePad: 0,
		highlight: {
			start: {line: 4, column: 18},
			end: {line: 5, column: 9},
			color: chalk.bgRed.white.bold,
			resetColor: true
		},
		colors: {
			tag: chalk.yellow
		}
	})
	t.is(result, '\u001b[37m\u001b[33m<\u001b[36mbody\u001b[33m>\u001b[37m                   \u001b[39m\n\u001b[37m    \u001b[33m<\u001b[36mdiv\u001b[33m>\u001b[37m                \u001b[39m\n\u001b[37m        \u001b[33m<\u001b[36mspan\u001b[33m>\u001b[37mGood\u001b[33m</\u001b[36mspan\u001b[33m>\u001b[37m\u001b[39m\n\u001b[37m        \u001b[33m<\u001b[36mspan\u001b[33m>\u001b[37mBad\u001b[33m\u001b[41m\u001b[37m\u001b[1m<span>\u001b[22m\u001b[37m\u001b[49m  \u001b[39m\n\u001b[37m\u001b[41m\u001b[37m\u001b[1m    <div>\u001b[22m\u001b[37m\u001b[49m\u001b[37m                \u001b[39m\n\u001b[37m\u001b[33m</\u001b[36mbody\u001b[33m>\u001b[37m                  \u001b[39m\n\u001b[37m\u001b[39m')
})

test('Single line highlight, replacing color', t => {
	const html = `<div>Highlight me!</div>`

	const result = chromafi(html, {
		codePad: 0,
		lang: 'html',
		lineNumbers: false,
		lineNumberStart: 1,
		highlight: {
			start: 6,
			end: 18,
			color: chalk.bgRed.white.bold,
			resetColor: true
		},
		colors: {
			tag: chalk.yellow
		}
	})
	t.is(result, '\u001b[37m\u001b[33m<\u001b[36mdiv\u001b[33m>\u001b[37m\u001b[41m\u001b[37m\u001b[1mHighlight me!\u001b[22m\u001b[37m\u001b[49m\u001b[33m</\u001b[36mdiv\u001b[33m>\u001b[37m\u001b[39m\n\u001b[37m\u001b[39m')
})

test('Circular JSON throws', t => {
	const a = {}
	const b = {}
	a.foo = b
	b.foo = a

	const error = t.throws(() => {
		chromafi(a)
	})

	t.is(error.message, 'TypeError: 🦅  Chromafi: Converting circular structure to JSON')
})

test('Render a sub-portion of the lines', t => {
	const html = '<body>\n\t<div>\n\t\t<span>Good</span>\n\t\t<span>Bad</span>\n\t</div>\n<body>'
	const result = chromafi(html, {
		lang: 'html',
		firstLine: 3,
		lastLine: 4
	})
	t.is(result, '\u001b[37m\u001b[90m3\u001b[37m         \u001b[34m<\u001b[36mspan\u001b[34m>\u001b[37mGood\u001b[34m</\u001b[36mspan\u001b[34m>\u001b[37m \u001b[39m\n\u001b[37m\u001b[90m4\u001b[37m         \u001b[34m<\u001b[36mspan\u001b[34m>\u001b[37mBad\u001b[34m</\u001b[36mspan\u001b[34m>\u001b[37m  \u001b[39m\n\u001b[37m\u001b[39m')
})

test('Should throw if type !<fn|string|obj>', t => {
	const iBool = false

	const error = t.throws(() => {
		chromafi(iBool)
	})

	t.is(error.message, '🦅  Chromafi: You must pass a function, string or object.')
})

/* eslint-disable indent, no-unused-vars, object-shorthand */
test('Should re-align indentation at multiple levels', t => {
const lvl0 = opts => {
const obj = {
	foobar: 1337,
	'baz-qux': function (a, b) {
		return 'Wombat!'
	}
}
return chromafi(obj, opts)
}

	const lvl1 = opts => {
	const obj = {
		foobar: 1337,
		'baz-qux': function (a, b) {
			return 'Wombat!'
		}
	}
	return chromafi(obj, opts)
	}

	const lvl2 = opts => {
		return (() => {
			const obj = {
				foobar: 1337,
				'baz-qux': function (a, b) {
					return 'Wombat!'
				}
			}
			return chromafi(obj, opts)
		})()
	}

	const opts = {
		lineNumberPad: 0,
		lineNumbers: 0,
		codePad: 0
	}

	const spaces = Object.assign({}, opts, {tabsToSpaces: 4})
	const tabs = Object.assign({}, opts, {tabsToSpaces: false})

	const spacesOutput = [
		lvl0(spaces),
		lvl1(spaces),
		lvl2(spaces)
	].join('\n')

	const tabsOutput = [
		lvl0(tabs),
		lvl1(tabs),
		lvl2(tabs)
	].join('\n')

	t.is(spacesOutput, '\u001b[37m{                               \u001b[39m\n\u001b[37m    \u001b[33mfoobar:\u001b[37m \u001b[32m1337\u001b[37m,               \u001b[39m\n\u001b[37m    \u001b[36m\'baz-qux\':\u001b[37m \u001b[37m\u001b[37m\u001b[31mfunction\u001b[37m (\u001b[34ma, b\u001b[37m) \u001b[37m{\u001b[39m\n\u001b[37m        \u001b[31mreturn\u001b[37m \u001b[33m\'Wombat!\'\u001b[37m;       \u001b[39m\n\u001b[37m    }\u001b[37m                           \u001b[39m\n\u001b[37m}                               \u001b[39m\n\u001b[37m\u001b[39m\n\u001b[37m{                               \u001b[39m\n\u001b[37m    \u001b[33mfoobar:\u001b[37m \u001b[32m1337\u001b[37m,               \u001b[39m\n\u001b[37m    \u001b[36m\'baz-qux\':\u001b[37m \u001b[37m\u001b[37m\u001b[31mfunction\u001b[37m (\u001b[34ma, b\u001b[37m) \u001b[37m{\u001b[39m\n\u001b[37m        \u001b[31mreturn\u001b[37m \u001b[33m\'Wombat!\'\u001b[37m;       \u001b[39m\n\u001b[37m    }\u001b[37m                           \u001b[39m\n\u001b[37m}                               \u001b[39m\n\u001b[37m\u001b[39m\n\u001b[37m{                               \u001b[39m\n\u001b[37m    \u001b[33mfoobar:\u001b[37m \u001b[32m1337\u001b[37m,               \u001b[39m\n\u001b[37m    \u001b[36m\'baz-qux\':\u001b[37m \u001b[37m\u001b[37m\u001b[31mfunction\u001b[37m (\u001b[34ma, b\u001b[37m) \u001b[37m{\u001b[39m\n\u001b[37m        \u001b[31mreturn\u001b[37m \u001b[33m\'Wombat!\'\u001b[37m;       \u001b[39m\n\u001b[37m    }\u001b[37m                           \u001b[39m\n\u001b[37m}                               \u001b[39m\n\u001b[37m\u001b[39m')
	t.is(tabsOutput, '\u001b[37m{                                   \u001b[39m\n\u001b[37m\t\u001b[33mfoobar:\u001b[37m \u001b[32m1337\u001b[37m,               \u001b[39m\n\u001b[37m\t\u001b[36m\'baz-qux\':\u001b[37m \u001b[37m\u001b[37m\u001b[31mfunction\u001b[37m (\u001b[34ma, b\u001b[37m) \u001b[37m{\u001b[39m\n\u001b[37m\t\t\u001b[31mreturn\u001b[37m \u001b[33m\'Wombat!\'\u001b[37m;   \u001b[39m\n\u001b[37m\t}\u001b[37m                           \u001b[39m\n\u001b[37m}                                   \u001b[39m\n\u001b[37m\u001b[39m\n\u001b[37m{                                   \u001b[39m\n\u001b[37m\t\u001b[33mfoobar:\u001b[37m \u001b[32m1337\u001b[37m,               \u001b[39m\n\u001b[37m\t\u001b[36m\'baz-qux\':\u001b[37m \u001b[37m\u001b[37m\u001b[31mfunction\u001b[37m (\u001b[34ma, b\u001b[37m) \u001b[37m{\u001b[39m\n\u001b[37m\t\t\u001b[31mreturn\u001b[37m \u001b[33m\'Wombat!\'\u001b[37m;   \u001b[39m\n\u001b[37m\t}\u001b[37m                           \u001b[39m\n\u001b[37m}                                   \u001b[39m\n\u001b[37m\u001b[39m\n\u001b[37m{                                   \u001b[39m\n\u001b[37m\t\u001b[33mfoobar:\u001b[37m \u001b[32m1337\u001b[37m,               \u001b[39m\n\u001b[37m\t\u001b[36m\'baz-qux\':\u001b[37m \u001b[37m\u001b[37m\u001b[31mfunction\u001b[37m (\u001b[34ma, b\u001b[37m) \u001b[37m{\u001b[39m\n\u001b[37m\t\t\u001b[31mreturn\u001b[37m \u001b[33m\'Wombat!\'\u001b[37m;   \u001b[39m\n\u001b[37m\t}\u001b[37m                           \u001b[39m\n\u001b[37m}                                   \u001b[39m\n\u001b[37m\u001b[39m')
})
/* eslint-enable */

test('Diff', t => {
// Credit: https://www.git-tower.com/learn/git/ebook/en/command-line/advanced-topics/diffs
// eslint-disable-next-line indent
const diff = `diff --git a/about.html b/about.html
index d09ab79..0c20c33 100644
--- a/about.html
+++ b/about.html
@@ -19,7 +19,7 @@
   </div>

   <div id="headerContainer">
-    <h1>About&lt/h1>
+    <h1>About This Project&lt/h1>
   </div>

   <div id="contentContainer">
diff --git a/imprint.html b/imprint.html
index 1932d95..d34d56a 100644
--- a/imprint.html
+++ b/imprint.html
@@ -19,7 +19,7 @@
   </div>

   <div id="headerContainer">
-    <h1>Imprint&lt/h1>
+    <h1>Imprint / Disclaimer&lt/h1>
   </div>

   <div id="contentContainer">`

	const result = chromafi(diff, {lang: 'diff'})
	t.is(result, '\u001b[37m\u001b[90m 1\u001b[37m \u001b[37m\u001b[2mdiff --git a/about.html b/about.html\u001b[22m\u001b[37m     \u001b[39m\n\u001b[37m\u001b[90m 2\u001b[37m \u001b[37m\u001b[2mindex d09ab79..0c20c33 100644\u001b[22m\u001b[37m            \u001b[39m\n\u001b[37m\u001b[90m 3\u001b[37m \u001b[37m\u001b[2m--- a/about.html\u001b[22m\u001b[37m                         \u001b[39m\n\u001b[37m\u001b[90m 4\u001b[37m \u001b[37m\u001b[2m+++ b/about.html\u001b[22m\u001b[37m                         \u001b[39m\n\u001b[37m\u001b[90m 5\u001b[37m \u001b[36m@@ -19,7 +19,7 @@\u001b[37m                        \u001b[39m\n\u001b[37m\u001b[90m 6\u001b[37m    </div>                                \u001b[39m\n\u001b[37m\u001b[90m 7\u001b[37m                                          \u001b[39m\n\u001b[37m\u001b[90m 8\u001b[37m    <div id="headerContainer">            \u001b[39m\n\u001b[37m\u001b[90m 9\u001b[37m \u001b[31m-    <h1>About&lt/h1>\u001b[37m                    \u001b[39m\n\u001b[37m\u001b[90m10\u001b[37m \u001b[32m+    <h1>About This Project&lt/h1>\u001b[37m       \u001b[39m\n\u001b[37m\u001b[90m11\u001b[37m    </div>                                \u001b[39m\n\u001b[37m\u001b[90m12\u001b[37m                                          \u001b[39m\n\u001b[37m\u001b[90m13\u001b[37m    <div id="contentContainer">           \u001b[39m\n\u001b[37m\u001b[90m14\u001b[37m \u001b[37m\u001b[2mdiff --git a/imprint.html b/imprint.html\u001b[22m\u001b[37m \u001b[39m\n\u001b[37m\u001b[90m15\u001b[37m \u001b[37m\u001b[2mindex 1932d95..d34d56a 100644\u001b[22m\u001b[37m            \u001b[39m\n\u001b[37m\u001b[90m16\u001b[37m \u001b[37m\u001b[2m--- a/imprint.html\u001b[22m\u001b[37m                       \u001b[39m\n\u001b[37m\u001b[90m17\u001b[37m \u001b[37m\u001b[2m+++ b/imprint.html\u001b[22m\u001b[37m                       \u001b[39m\n\u001b[37m\u001b[90m18\u001b[37m \u001b[36m@@ -19,7 +19,7 @@\u001b[37m                        \u001b[39m\n\u001b[37m\u001b[90m19\u001b[37m    </div>                                \u001b[39m\n\u001b[37m\u001b[90m20\u001b[37m                                          \u001b[39m\n\u001b[37m\u001b[90m21\u001b[37m    <div id="headerContainer">            \u001b[39m\n\u001b[37m\u001b[90m22\u001b[37m \u001b[31m-    <h1>Imprint&lt/h1>\u001b[37m                  \u001b[39m\n\u001b[37m\u001b[90m23\u001b[37m \u001b[32m+    <h1>Imprint / Disclaimer&lt/h1>\u001b[37m     \u001b[39m\n\u001b[37m\u001b[90m24\u001b[37m    </div>                                \u001b[39m\n\u001b[37m\u001b[90m25\u001b[37m                                          \u001b[39m\n\u001b[37m\u001b[90m26\u001b[37m    <div id="contentContainer">           \u001b[39m\n\u001b[37m\u001b[39m')
})

