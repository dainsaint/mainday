var http = require("http");


function start( externalRequest )
{
    function onRequest( request, response )
    {
        console.log("request received");
        response.writeHead(200, {"Content-Type": "text/plain"});
        // response.write("Hello World");
        externalRequest( response );
        response.end();
    }

    http.createServer( onRequest ).listen(8888);
    console.log("server started");
}

exports.start = start;
