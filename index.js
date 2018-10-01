console.log("sssup");
var server = require("./server");
var parser = require("./parser");


function doServe( response )
{
    new Promise( parser.getCalendar )
        .then( icsContent => {
            response.write( icsContent )
            response.end();
        } );
}



server.start( doServe );



// server.start( doParsing );
