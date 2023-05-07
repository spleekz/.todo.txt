import { activeTaskMarker, doneTaskMarker } from './markers.js'

export const linesIncludes = ( lines, value ) => {
	return lines.some( ( line ) => {
		return line.includes( value )
	} )
}

// если таска - вернёт её title и range, иначе - false
export const getTask = ( type, textLines, index ) => {
	const marker = type === 'active' ? activeTaskMarker : doneTaskMarker
	const startMarkerIndex = type === 'active' ? 0 : 1

	const checkFromTaskBegining = ( beginLineIndex, sourceIndex ) => {
		var start
		var end

		const nextEmptyLineIndex = textLines.findIndex( ( line, i ) => {
			if ( i >= beginLineIndex ) {
				return !line.length
			}
			return false
		} )

		if ( sourceIndex !== undefined && sourceIndex >= nextEmptyLineIndex ) {
			return false
		}

		const linesBetweenTargetAndNextEmpty = textLines.slice( beginLineIndex + 1, nextEmptyLineIndex )

		if ( !linesIncludes( linesBetweenTargetAndNextEmpty, marker ) ) {
			if ( linesBetweenTargetAndNextEmpty.every( ( line ) => line[ startMarkerIndex ] === '\t' ) ) {
				start = beginLineIndex
				end = nextEmptyLineIndex - 1

				return [ start, end ]
			}
		}

		return false
	}

	var taskRange = false

	if ( textLines[ index ].indexOf( `${ marker }\t` ) === startMarkerIndex ) {
		taskRange = checkFromTaskBegining( index )
	} else {
		var closeMarkerLineIndex = textLines.slice().reverse().findIndex( ( line, i ) => {
			const nativeIndex = textLines.length - 1 - i
			if ( nativeIndex < index ) {
				if ( line.indexOf( `${ marker }\t` ) === startMarkerIndex ) {
					return true
				}
			}
		} )
		closeMarkerLineIndex = textLines.length - 1 - closeMarkerLineIndex
		taskRange = checkFromTaskBegining( closeMarkerLineIndex, index )
	}

	if ( taskRange ) {
		const title = textLines
		.slice( taskRange[ 0 ], taskRange[ 1 ] + 1 )
		.map( ( line, i ) => {
			if ( i === 0 ) {
				return line.split( '' ).filter( s => s !== marker && s !== '\t' ).join( '' )
			}
			return line
		} )
		.join( '\n' )

		return { title, range: taskRange }
	}

	return false

}

export const getFirstActiveTaskLineIndex = ( textLines ) => {
	return textLines.findIndex( ( _, i ) => {
		return getTask( 'active', textLines, i )
	} )
}

export const getDoneSectionTitleLineIndex = ( textLines ) => {
	return textLines.findIndex( ( line ) => {
		return ( line.includes( '- * ' ) && line.includes( ' * -' ) )
	} )
}

export const getFirstFullDoneTaskLineIndex = ( textLines, doneSectionTitleLineIndex ) => {
	return textLines.findIndex( ( _, i ) => {
		if ( i > doneSectionTitleLineIndex ) {
			return getTask( 'done', textLines, i ) !== false
		}
		return false
	} )
}

export const getFirstEmptyLineInFile = ( textLines ) => {
	return textLines.findIndex( ( line ) => !line )
}
