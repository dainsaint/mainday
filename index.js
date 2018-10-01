console.log("sssup");
var server = require("./server");
var parser = require("./parser");



function serveCalendar( icsContent )
{
    server.start( response => response.write(icsContent) );
}


new Promise( parser.getCalendar )
    .then( serveCalendar );





// server.start( doParsing );
