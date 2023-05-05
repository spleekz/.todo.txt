const fs = require( 'fs' )

const isBetween = ( target, a, b ) => {
	return target >= a && target <= b
}

const filePath = process.argv[ 2 ]
const targetLine = process.argv[ 3 ] - 1

fs.readFile( filePath, 'utf-8', ( err, data ) => {
	if ( err ) {
		console.log( err )
		return
	}

	const fileText = data

	const fileTextLines = fileText.split( '\n' )

	const doneStartLine = fileTextLines.reduce( ( acc, line, i ) => {
		if ( line.toLowerCase().includes( "* сделано *" ) ) {
			acc = i
		}
		return acc
	}, 0 )

	var isFind = false
	const inProgressStartLine = fileTextLines.reduce( ( acc, line, lineIndex ) => {
		if ( !isFind ) {
			const pos = line.indexOf( '—\t' )
			if ( pos === 0 ) {
				acc = lineIndex
				isFind = true
			}
		}
		return acc
	}, 0 )

	const inProgressEndLine = doneStartLine - 2

	const tasks = []

	var taskStartLine = inProgressStartLine
	var taskEndLine = inProgressEndLine
	for ( var i = inProgressStartLine; i <= inProgressEndLine; ++ i ) {
		if ( i <= inProgressEndLine - 1 ) {
			if ( fileTextLines[ i + 1 ].length === 0 ) {
				taskEndLine = i

				const taskTitle = fileTextLines.reduce( ( acc, line, index ) => {
					if ( index >= taskStartLine && index <= taskEndLine ) {
						acc += line
					}
					return acc
				}, '' )

				tasks.push( { title: taskTitle, range: [ taskStartLine, taskEndLine ] } )

				taskStartLine = taskEndLine + 2
			}
		}
	}

	const targetTask = tasks.reduce( ( acc, task ) => {
		if ( isBetween( targetLine, task.range[ 0 ], task.range[ 1 ] ) ) {
			acc = task
		}
		return acc
	}, null )

	if ( targetTask === null ) {
		return
	}

	targetTask.title = `#${ targetTask.title.slice( 1 ) }`

	targetTask.title = targetTask.title.split( '' ).map( ( s, i ) => {
		if ( i === 0 ) {
			return '\t' + s
		}
		if ( s === '\t' ) {
			if ( i !== 1 ) {
				var newS
				if ( i !== 0 && targetTask.title[ i - 1 ] !== '\t' ) {
					newS = '\n\t'
				}
				if ( i < targetTask.title.length - 1 && targetTask.title[ i + 1 ] !== '\t' ) {
					newS += '\t'
				}
				return newS
			}
		}
		return s
	} ).join( '' )

	const beforeTask = fileTextLines.slice( 0, targetTask.range[ 0 ] ).join( '\n' )
	const afterTask = fileTextLines.slice( targetTask.range[ 1 ] + 1, doneStartLine ).join( '\n' )

	const beforeInjectPlace = beforeTask + afterTask + '\n' + fileTextLines[ doneStartLine ]
	const afterInjectPlace = fileTextLines.splice( doneStartLine + 1 ).join( '\n' )

	const newContent = beforeInjectPlace + '\n\n' + targetTask.title + '\n' + afterInjectPlace

	fs.writeFile( filePath, newContent, ( err ) => {
		if ( err ) {
			console.log( err )
			return
		}
	} )

} )

