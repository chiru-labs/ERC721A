const chromafi = require('.')

const obj = {foobar: 1337}

const options = {
	lineNumberPad: 0,
	codePad: 0,
	indent: 2,
	lineNumbers: true,
	colors: {
		BASE: ['bgBlack', 'white', 'bold'],
		LINE_NUMBERS: ['bgCyan', 'black']
	}
}

const chromafanatic = chromafi(obj, options)

console.log(chromafanatic)
