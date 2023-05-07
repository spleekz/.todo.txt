import fs from 'fs'
import { markTaskDone } from './operations/done.js'
import { markTaskUndone } from './operations/undone.js'
import { getDoneSectionTitleLineIndex } from './parse-core.js'

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

	const doneSectionTitleLineIndex = getDoneSectionTitleLineIndex( fileTextLines )

	var newFileText

	// done
	if ( operationType === 'done' ) {

		newFileText = markTaskDone( fileTextLines, targetLine, doneSectionTitleLineIndex )

	}

	// undone
	if ( operationType === 'undone' ) {

		newFileText = markTaskUndone( fileTextLines, targetLine, doneSectionTitleLineIndex )

	}

	fs.writeFile( filePath, newFileText, ( err ) => {
		if ( err ) {
			console.log( err )
			return
		}
	} )

} )

