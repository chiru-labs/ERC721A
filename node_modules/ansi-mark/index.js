const ansiRegex = require('ansi-regex')
const superSplit = require('super-split')
const arrayUniq = require('array-uniq')
const stripAnsi = require('strip-ansi')

const realignOutOfBoundsCoords = (text, opts) => {
	const plain = stripAnsi(text)
	const lines = plain.split('\n')
	const totalLines = lines.length

	// 'End.line marker out of bounds (max).'
	if (opts.end.line > totalLines) {
		opts.end.line = totalLines
	}

	// 'Start.line marker out of bounds (min).'
	if (opts.start.line < 1) {
		opts.start.line = 1
	}

	// 'Start.column marker out of bounds (min).'
	if (opts.start.column < 1) {
		opts.start.column = 1
	}

	// 'End.column marker out of bounds (max).'
	if (opts.end.column > lines[opts.end.line - 1].length) {
		opts.end.column = lines[opts.end.line - 1].length
	}

	if (opts.start.line > opts.end.line) {
		throw new Error('Your start line is after your end line.')
	}

	if (opts.start.line === opts.end.line &&
		opts.end.column < opts.start.column) {
		throw new Error('Your end column is after your start column.')
	}

	return false
}

// Returns arys:
// 1 - ANSI Escape sequences from section
// 2 - Glyphs in section (ansi escape seq - or - ascii character)
const atomize = section => {
	const ansies = arrayUniq(section.match(ansiRegex()))
	const words = superSplit(section, ansies)

	let glyphs = []
	words.forEach(word => {
		if (ansies.includes(word) === false) {
			glyphs = glyphs.concat(word.split(''))
			return
		}
		glyphs.push(word)
	})

	return {ansies, glyphs}
}

const markSection = (section, opts, linear) => {
	const {ansies, glyphs} = atomize(section)

	let x = 0
	let y = 0
	let inPoint
	let outPoint
	let output = ''
	const height = opts.end.line - opts.start.line

	const markNotBegun = () => {
		return typeof inPoint !== 'number' &&
			typeof outPoint !== 'number'
	}

	const markHasEnded = () => {
		return typeof inPoint === 'number' &&
			typeof outPoint === 'number'
	}

	const outsideOfMark = () => {
		return markNotBegun() || markHasEnded()
	}

	glyphs.forEach(glyph => {
		if (ansies.includes(glyph) === false) {
			if (glyph === '\n' && !linear) {
				y += 1
				x = -1
			}

			x += 1

			if (x === opts.start.column && y === 0) {
				inPoint = output.length
			}

			output += glyph

			if (x === opts.end.column && y === height) {
				outPoint = output.length
			}

			return
		}

		if (outsideOfMark()) {
			output += glyph
		} else if (!outsideOfMark() && !opts.resetColor) {
			output += glyph
		}
	})

	const pre = output.substr(0, inPoint)
	const mark = opts.color(output.substr(inPoint, outPoint - inPoint))
	const post = output.substr(outPoint)
	const sectionMarked = pre + mark + post

	return sectionMarked
}

const mark2d = (text, opts) => {
	realignOutOfBoundsCoords(text, opts)

	const lines = text.split('\n')

	// Minus 1: because line and column numbers start at 1
	const startLine = opts.start.line - 1
	const endLine = opts.end.line - 1

	// Plus 1: because slice does not include the end indice
	const unmarkedSection = lines.slice(startLine, endLine + 1).join('\n')

	const preSection = lines.slice(0, startLine)
	const markedSection = markSection(unmarkedSection, opts)
	const postSection = lines.slice(endLine + 1)

	const result = preSection.concat([markedSection]).concat(postSection).join('\n')
	return result
}

const mark1d = (text, opts, linear) => {
	const markedSection = markSection(text, opts, linear)
	return markedSection
}

const mark = (text, opts, linear) => {
	return linear ? mark1d(text, opts, linear) : mark2d(text, opts)
}

const validMarkersNumbers = opts => {
	return typeof opts.start === 'number' &&
		typeof opts.end === 'number'
}

const validMarkersObject = opts => {
	return typeof opts.start === 'object' &&
		typeof opts.end === 'object' &&
		typeof opts.start.line === 'number' &&
		typeof opts.start.column === 'number' &&
		typeof opts.end.line === 'number' &&
		typeof opts.end.column === 'number'
}

const ansiMark = (text, opts) => {
	if (validMarkersObject(opts)) {
		return mark(text, opts)
	}

	if (validMarkersNumbers(opts)) {
		opts.start = {line: 1, column: opts.start}
		opts.end = {line: 1, column: opts.end}
		const linear = true
		return mark(text, opts, linear)
	}

	throw new Error('Invalid marker definition.')
}

module.exports = ansiMark
