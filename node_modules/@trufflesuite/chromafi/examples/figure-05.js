const chromafi = require('.')
const chalk = require('chalk')

const obj = {
	foo: 'bar',
	baz: 1337,
	qux: true,
	zxc: null,
	'foogle-bork': function (a, b) {
		return b - a
	}
}

const chromafantastic = chromafi(obj, {
	colors: {
		base: chalk.bgWhite.black.bold,
		keyword: chalk.red,
		number: chalk.blue.dim,
		function: chalk.black,
		title: chalk.blue,
		params: chalk.black,
		string: chalk.black,
		built_in: chalk.blue,
		literal: chalk.blue,
		attr: chalk.black,
		trailing_space: chalk,
		regexp: chalk.blue,
		line_numbers: chalk.bgBlue.white
	}
})

console.log(chromafantastic)
