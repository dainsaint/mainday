var http = require("http");
var parser = require("./parser");

function start()
{
    function onRequest( request, response )
    {
        console.log("request received");
        new Promise( parser.getCalendar )
            .then( writeResponse.partial(response) );
    }

    function writeResponse( response, content )
    {
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write( content )
        response.end();
    }

    http.createServer( onRequest ).listen(80);
    console.log("server started");
}

start();

// exports.start = start;
