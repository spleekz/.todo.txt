import { doneTaskMarker } from '../markers.js'
import { getFirstFullDoneTaskLineIndex, getTask } from '../parse-core.js'

export const markTaskDone = ( fileTextLines, targetLine, doneSectionTitleLineIndex ) => {

	const targetTask = getTask( 'active', fileTextLines, targetLine )

	if ( !targetTask ) {
		return
	}

	var injectPlace = getFirstFullDoneTaskLineIndex( fileTextLines, doneSectionTitleLineIndex )

	if ( injectPlace === -1 ) {
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

	return newFileText
}
