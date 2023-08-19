const splitString = (str, delimiter) => {
	const result = []

	str.split(delimiter).forEach(str => {
		result.push(str)
		result.push(delimiter)
	})

	result.pop()

	return result
}

const splitArray = (ary, delimiter) => {
	let result = []

	ary.forEach(part => {
		let subRes = []

		part.split(delimiter).forEach(str => {
			subRes.push(str)
			subRes.push(delimiter)
		})

		subRes.pop()
		subRes = subRes.filter(str => {
			if (str) {
				return str
			}
			return undefined
		})

		result = result.concat(subRes)
	})

	return result
}

const superSplit = (splittable, delimiters) => {
	if (delimiters.length === 0) {
		return splittable
	}

	if (typeof splittable === 'string') {
		const delimiter = delimiters[delimiters.length - 1]
		const split = splitString(splittable, delimiter)
		return superSplit(split, delimiters.slice(0, -1))
	}

	if (Array.isArray(splittable)) {
		const delimiter = delimiters[delimiters.length - 1]
		const split = splitArray(splittable, delimiter)
		return superSplit(split, delimiters.slice(0, -1))
	}

	return false
}

module.exports = superSplit
