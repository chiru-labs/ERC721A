const chromafi = require('.')

const obj = {
	foo: 'bar',
	baz: 1337,
	qux: true,
	zxc: null,
	'foogle-bork': function (a, b) {
		return b - a
	}
}

const chromatastic = chromafi(obj)

console.log(chromatastic)
