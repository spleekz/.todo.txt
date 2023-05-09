import fs from 'fs'
import { markTaskDone } from './operations/done.js'
import { markTaskUndone } from './operations/undone.js'

const filePath = process.argv[ 2 ]
const targetLine = process.argv[ 3 ] - 1
const operationType = process.argv[ 4 ]

fs.readFile( filePath, 'utf-8', ( err, data ) => {

	if ( err ) {
		console.log( err )
		return
	}

	const fileText = data

	var newFileText

	// done
	if ( operationType === 'done' ) {

		newFileText = markTaskDone( fileText, targetLine )

	}

	// undone
	if ( operationType === 'undone' ) {

		newFileText = markTaskUndone( fileText, targetLine )

	}

	if ( newFileText ) {

		fs.writeFile( filePath, newFileText, ( err ) => {
			if ( err ) {
				console.log( err )
				return
			}
		} )

	}

} )

