import { getDoneSectionTitleLineIndex, getFirstFullDoneTaskLineIndex, getTask } from '../parse/core.js'
import { doneTaskMarker } from '../parse/task.js'

export const markTaskDone = ( text, targetLine ) => {

	const targetTask = getTask( 'active', text, targetLine )

	if ( !targetTask ) {
		return
	}

	const doneSectionTitleLineIndex = getDoneSectionTitleLineIndex( text )

	var injectPlace = getFirstFullDoneTaskLineIndex( text )

	if ( injectPlace === null ) {
		injectPlace = doneSectionTitleLineIndex + 1
	} else {
		injectPlace = injectPlace - 1
	}

	const targetTaskDoneTitle = `${ doneTaskMarker }${ targetTask.title }`
		.split( '\n' )
		.map( ( line ) => {
			return line
				.split( '' )
				.map( ( s, i ) => {
					if ( i === 0 ) {
						return '\t' + s
					}
					if ( i === 1 && line[ i - 1 ] === doneTaskMarker ) {
						return '\t' + s
					}
					return s
				} )
				.join( '' )
		} )
		.join( '\n' )

	const textLines = text.split( '\n' )

	const beforeTask = textLines.slice( 0, targetTask.range[ 0 ] ).join( '\n' )
	const afterTask = textLines.slice( targetTask.range[ 1 ] + 1, doneSectionTitleLineIndex ).join( '\n' )

	const beforeInject = textLines.slice( doneSectionTitleLineIndex, injectPlace ).join( '\n' )
	const afterInject = textLines.slice( injectPlace ).join( '\n' )

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

	return newFileText

}
