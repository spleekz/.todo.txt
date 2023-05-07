import { activeTaskMarker } from '../markers.js'
import { getFirstActiveTaskLineIndex, getFirstEmptyLineInFile, getTask } from '../parse-core.js'

export const markTaskUndone = ( fileTextLines, targetLine, doneSectionTitleLineIndex ) => {

	const targetTask = getTask( 'done', fileTextLines, targetLine )

	var injectPlace = getFirstActiveTaskLineIndex( fileTextLines )
	var isInjectInFirstEmptyLine = false

	if ( injectPlace === -1 ) {
		isInjectInFirstEmptyLine = true
		injectPlace = getFirstEmptyLineInFile( fileTextLines )
	}

	const targetTaskActiveTitle = `${ activeTaskMarker }${ targetTask.title }`
		.split( '\n' )
		.map( ( line, lineIndex ) => {
			return line
				.split( '' )
				.map( ( s, i ) => {
					if ( i === 0 ) {
						if ( lineIndex !== 0 ) {
							// убираем по одному табу во всех не первых строках
							return ''
						}
					}

					if ( i !== 0 ) {
						if ( line[ i - 1 ] === activeTaskMarker ) {
							return '\t' + s
						}
					}

					return s
				} )
				.join( '' )
		} )
		.join( '\n' )


	const beforeInject = fileTextLines.slice( 0, injectPlace ).join( '\n' )
	const afterInject = fileTextLines.slice( injectPlace, doneSectionTitleLineIndex ).join( '\n' )

	const beforeTask = fileTextLines.slice( doneSectionTitleLineIndex, targetTask.range[ 0 ] ).join( '\n' )
	const afterTask = fileTextLines.slice( targetTask.range[ 1 ] + 1 ).join( '\n' )

	const newFileText =
		beforeInject
		+ ( isInjectInFirstEmptyLine ? '\n' : '' )

		+ '\n'
		+ targetTaskActiveTitle
		+ '\n'
		+ ( !isInjectInFirstEmptyLine ? '\n' : '' )

		+ afterInject
		+ '\n'

		+ beforeTask
		+ afterTask

	return newFileText

}
