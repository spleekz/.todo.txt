import { isBetween } from '../lib/numbers.js'
import { doneSectionTitleRegex } from './sections.js'
import { activeTaskRegex, doneTaskRegex } from './task.js'

const getLineIndexBySymbolIndex = ( text, symbIndex ) => {

	var lineIndex

	var currentLineIndex = 0
	text.split( '' ).forEach( ( s, i ) => {
		if ( s === '\n' ) {
			currentLineIndex ++
		}

		if ( i === symbIndex ) {
			lineIndex = currentLineIndex
			return
		}
	} )

	return lineIndex

}

export const getLineRangeBySymbolRange = ( text, symbStart, symbEnd ) => {

	var lineStart = getLineIndexBySymbolIndex( text, symbStart )
	var lineEnd = getLineIndexBySymbolIndex( text, symbEnd )

	return [ lineStart, lineEnd ]

}

const getFirstRegexMatchLineIndex = ( text, regex ) => {
	const firstMatch = regex.exec( text )

	if ( !firstMatch ) {
		return null
	}

	return getLineIndexBySymbolIndex( text, firstMatch.index )
}

export const getTask = ( type, text, line ) => {
	const regexActive = activeTaskRegex
	const regexDone = doneTaskRegex

	const actualRegex = type === 'active' ? regexActive : regexDone

	var task

	const matches = text.matchAll( actualRegex )

	for (const match of matches) {
		const startIndex = match.index
		const endIndex = startIndex + match[ 0 ].length - 3

		const taskRange = getLineRangeBySymbolRange( text, startIndex, endIndex )

		const isTargetLineInTask = isBetween( line, taskRange[ 0 ], taskRange[ 1 ] )

		if ( isTargetLineInTask ) {
			const sliceSymbolCount = type === 'active' ? 2 : 3
			const taskTitle = match[ 0 ].slice( sliceSymbolCount, -1 )

			task = { title: taskTitle, range: taskRange }

			break
		}
	}

	return task ?? false
}

export const getFirstActiveTaskLineIndex = ( text ) => {
	const regex = activeTaskRegex
	return getFirstRegexMatchLineIndex( text, regex )
}

export const getDoneSectionTitleLineIndex = ( text ) => {
	const regex = doneSectionTitleRegex
	return getFirstRegexMatchLineIndex( text, regex )
}

export const getFirstFullDoneTaskLineIndex = ( text ) => {
	const regex = doneTaskRegex
	return getFirstRegexMatchLineIndex( text, regex )
}

export const getFirstEmptyLine = ( text ) => {
	const regex = new RegExp( '^\n', 'm' )
	return getFirstRegexMatchLineIndex( text, regex ) - 1
}
