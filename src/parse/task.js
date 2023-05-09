export const activeTaskMarker = '—'
export const doneTaskMarker = '#'

export const activeTaskRegex = new RegExp( `^\\${ activeTaskMarker }\t.*\n(((\t.*\n){1,})|)$`, 'gm' )
export const doneTaskRegex = new RegExp( `^\t\\${ doneTaskMarker }\t.*\n(((\t{1,}.*\n){1,})|)$`, 'gm' )
