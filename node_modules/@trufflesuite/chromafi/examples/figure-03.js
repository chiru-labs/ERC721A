const chromafi = require('.')

const codeString = `
// Creates a Class based on Type
const create = (kind, parent) => {
	// Create the Class based on the Type's
	// Constructor or use an Anon. Func
	const protoclass = kind.ctor || function () {}

	// Inherit from a parent object
	if (parent) {
		protoclass.prototype = new Parent()
	}

	// Merge prototype from Class's Type
	if (kind.proto) {
		merge.call(protoclass.prototype, kind.proto)
	}

	return protoclass
}
`

const cchromadactic = chromafi(codeString)

console.log(chromadactic)
