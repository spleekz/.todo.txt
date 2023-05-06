const fs = require( 'fs' )

const activeTaskSymbol = '—'
const doneTaskSymbol = '#'

// fns

const linesIncludes = ( lines, value ) => {
	return lines.some( ( line ) => {
		return line.includes( value )
	} )
}

const getTask = ( type, textLines, index ) => {
	const idSymbol = type === 'active' ? activeTaskSymbol : doneTaskSymbol
	const startIdSymbolIndex = type === 'active' ? 0 : 1

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

		if ( !linesIncludes( linesBetweenTargetAndNextEmpty, idSymbol ) ) {
			if ( linesBetweenTargetAndNextEmpty.every( ( line ) => line[ startIdSymbolIndex ] === '\t' ) ) {
				start = beginLineIndex
				end = nextEmptyLineIndex - 1

				return [ start, end ]
			}
		}

		return false
	}

	var taskRange = false

	if ( textLines[ index ].indexOf( `${ idSymbol }\t` ) === startIdSymbolIndex ) {
		taskRange = checkFromTaskBegining( index )
	} else {
		var closeIdSymbolLineIndex = textLines.slice().reverse().findIndex( ( line, i ) => {
			const nativeIndex = textLines.length - 1 - i
			if ( nativeIndex < index ) {
				if ( line.indexOf( `${ idSymbol }\t` ) === startIdSymbolIndex ) {
					return true
				}
			}
		} )
		closeIdSymbolLineIndex = textLines.length - 1 - closeIdSymbolLineIndex
		taskRange = checkFromTaskBegining( closeIdSymbolLineIndex, index )
	}

	if ( taskRange ) {
		const title = textLines
		.slice( taskRange[ 0 ], taskRange[ 1 ] + 1 )
		.join( '\n' )
		.slice( 2 )

		return { title, range: taskRange }
	}

	return false

}

const getDoneSectionTitleLineIndex = ( textLines ) => {
	return textLines.findIndex( ( line ) => {
		return ( line.includes( '- * ' ) && line.includes( ' * -' ) )
	} )
}

const getFirstFullDoneTaskIndex = ( textLines ) => {
	const doneSectionTitleLineIndex = getDoneSectionTitleLineIndex( textLines )

	return textLines.findIndex( ( _, i ) => {
		if ( i > doneSectionTitleLineIndex ) {
			return getTask( 'done', textLines, i ) !== false
		}
		return false
	} )
}

// run
const filePath = process.argv[ 2 ]
const targetLine = process.argv[ 3 ] - 1
const operationType = process.argv[ 4 ]

fs.readFile( filePath, 'utf-8', ( err, data ) => {

	if ( err ) {
		console.log( err )
		return
	}

	const fileText = data

	const fileTextLines = fileText.split( '\n' )

	if ( operationType === 'done' ) {

		const targetTask = getTask( 'active', fileTextLines, targetLine )

		if ( !targetTask ) {
			return
		}

		const doneSectionTitleLineIndex = getDoneSectionTitleLineIndex( fileTextLines )

		var injectPlace = getFirstFullDoneTaskIndex( fileTextLines )

		if ( injectPlace === -1 ) {
			injectPlace = doneSectionTitleLineIndex + 1
		} else {
			injectPlace = injectPlace - 1
		}

		const targetTaskDoneTitle = `${ doneTaskSymbol }${ targetTask.title }`
			.split( '\n' )
			.map( ( line ) => {
				return line
					.split( '' )
					.map( ( s, i ) => {
						if ( i === 0 ) {
							return '\t' + s
						}
						if ( i === 1 && line[ i - 1 ] === doneTaskSymbol ) {
							return '\t' + s
						}
						return s
					} )
					.join( '' )
			} )
			.join( '\n' )

		const beforeTask = fileTextLines.slice( 0, targetTask.range[ 0 ] ).join( '\n' )
		const afterTask = fileTextLines.slice( targetTask.range[ 1 ] + 1, doneSectionTitleLineIndex ).join( '\n' )

		const beforeInject = fileTextLines.slice( doneSectionTitleLineIndex, injectPlace ).join( '\n' )
		const afterInject = fileTextLines.slice( injectPlace ).join( '\n' )

		const newFileText =
			beforeTask
			+ afterTask

			+ '\n'
			+ beforeInject
			+ '\n'

			+ '\n'
			+ targetTaskDoneTitle
			+ '\n'

			+ afterInject

		fs.writeFile( filePath, newFileText, ( err ) => {
			if ( err ) {
				console.log( err )
				return
			}
		} )

	}

} )

