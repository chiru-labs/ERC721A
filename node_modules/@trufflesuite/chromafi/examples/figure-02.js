const chromafi = require('../.')

function add (a, b) {
	return a + b
}
const chromantic = chromafi(add)

console.log(chromantic)
