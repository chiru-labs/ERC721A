const chromafi = require('../.')

const lvl0 = opts => {
const obj = {
	foobar: 1337,
	'baz-qux': function (a, b) {
		return 'Wombat!'
	}
}
return(chromafi(obj, opts))
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

console.log(spacesOutput)
console.log(tabsOutput)

