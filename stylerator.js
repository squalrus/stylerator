var fs = require('fs');

// Create input stream from file
var istream         = fs.createReadStream('_typography.less', { encoding: 'utf-8' });

// The file buffer
var buffer          = '';
var inBlockComment  = false;
var currentNode     = '';


var defaults = {
    css: 'stylerator.css'
};


// Markup arrays
var markupHeader    = '<!DOCTYPE html><html><head><title></title><link rel="stylesheet" href="stylerator.css" /></head><body><div id="details">';
var markupInfo      = [];
var markupBetween   = '</div><div id="examples"><h1>Examples</h1>';
var markupExample   = [];
var markupFooter    = '</div></body></html>';
var markupFull      = '';


// Load the file data
istream.on('data', function( data ) {

    buffer = data.toString();
    lineByLine( buffer );

});

// Add trim functionality to String
String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/, '');
};

// Add comment trim functionality to String
String.prototype.trimComment = function() {
    return this.replace(/^\s\*\s+|\s+$/, '');
};

/**
 * Parse the .less file line by line
 */
function lineByLine( buffer ) {
    var position;

    while(( position = buffer.indexOf('\n' )) >= 0 ) {
        parseLine( buffer.slice( 0, position ) );
        buffer = buffer.slice( position + 1 );
    }

    // Write the HTML file
    console.log( 'Writing to file...' );

    markupFull = markupHeader + markupInfo.join('') + markupBetween + markupExample.join('') + markupFooter;

    fs.writeFile( 'typography.html', markupFull, function(){
        console.log( '...complete!' );

        // Launch the browser
        var spawn = require('child_process').spawn;
        spawn( 'explorer.exe', ['typography.html']);

    });
}

function parseLine( lineBuffer ) {
    var  commentBlockStart  = /^\/\*/
        ,commentBlockEnd    = /\*\//
        ,commentLine        = /^\/\//
        ,nodeAttribute      = /@([a-zA-Z]*):/
        ,lineContent        = ''
        ;

    // Found a line comment
    if( lineBuffer.match( commentLine !== null )) {
        console.log( 'comment: line' );
    }

    // Found block comment start
    if( lineBuffer.match( commentBlockStart ) !== null ) {
        console.log( 'comment: block start' );
        inBlockComment = true;
    }

    // Found block comment end
    if( lineBuffer.match( commentBlockEnd ) !== null ) {
        console.log( 'comment: block end' );
        inBlockComment = false;

        currentNode = '';
    }

    // Print the line if in a block comment
    if( inBlockComment ) {

        // Find node if line has one
        var n = lineBuffer.match( nodeAttribute );
        lineContent = lineBuffer;

        if( n !== null ) {
            currentNode = n[1];
            lineContent = lineContent.replace( n[0], '' )
        }

        // Clean up the current line
        lineContent = lineContent.trimComment();
        console.log( 'current line: ' + lineContent );

        // Do something with the line
        if( lineContent !== '' && currentNode !== '' ) {
            switch( currentNode ) {
                case 'name':
                    console.log( 'on: @name' );

                    markupInfo.push( '<h1>' + lineContent + '</h1>\n' );

                    currentNode = 'name';
                    break;
                case 'description':
                    console.log( 'on: @description' );

                    markupInfo.push( lineContent + '\n' );

                    currentNode = 'description';
                    break;
                case 'note':
                    console.log( 'on: @note' );

                    currentNode = 'note';
                    break;
                case 'example':
                    console.log( 'on: @example' );

                    markupExample.push( lineContent + '\n' );

                    currentNode = 'example';
                    break;
                default:
                    console.log( 'broke: ' + currentNode );

            }
        }

    }

}
