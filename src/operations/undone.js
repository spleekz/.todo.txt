import { getDoneSectionTitleLineIndex, getFirstActiveTaskLineIndex, getFirstEmptyLine, getTask } from '../parse/core.js'
import { activeTaskMarker } from '../parse/task.js'

export const markTaskUndone = ( text, targetLine ) => {

	const targetTask = getTask( 'done', text, targetLine )

	const doneSectionTitleLineIndex = getDoneSectionTitleLineIndex( text )

	var injectPlace = getFirstActiveTaskLineIndex( text )
	var isInjectInFirstEmptyLine = false

	if ( injectPlace === null ) {
		isInjectInFirstEmptyLine = true
		injectPlace = getFirstEmptyLine( text )
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


	const textLines = text.split( '\n' )

	const beforeInject = textLines.slice( 0, injectPlace ).join( '\n' )
	const afterInject = textLines.slice( injectPlace, doneSectionTitleLineIndex ).join( '\n' )

	const beforeTask = textLines.slice( doneSectionTitleLineIndex, targetTask.range[ 0 ] ).join( '\n' )
	const afterTask = textLines.slice( targetTask.range[ 1 ] + 1 ).join( '\n' )

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
