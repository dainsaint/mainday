var icalToolkit = require('ical-toolkit');
var request = require('request');
var sugar = require('sugar');
// var Rx = require('rxjs');
// var http = require('http');

var builder = icalToolkit.createIcsFileBuilder();
var url = "https://dl.dropbox.com/s/edw53lkvjoawmtj/This%20Week.md?dl=1";


sugar.extend();


builder.calname = "This Week";
builder.timezone = "america/new_york";
builder.tzide = "america/new_york";
builder.method = 'REQUEST';

function getCalendar( resolve, reject )
{

    function handleRequest( error, response, body )
    {
        if( !error && response.statusCode == 200 )
            resolve( parseIntoIcal(body) );
        else
            reject();
    }


    function parseIntoIcal( text )
    {

        let names = ['this Monday', 'this Tuesday', 'this Wednesday', 'this Thursday', 'this Friday', 'this Saturday', 'next Sunday'];
        var days = text.match(/#[^#]*/gs)
            .map( day => day.split('\n')
            .filter( line => line.match(/^[0-9]*[a|p]m/)) )
            .map( day => day.map( parseEvent ) )
            .map( (day, i) => day.map( event => ({
                start: Date.create( names[i] + ' ' + event.time ),
                end: Date.create( names[i] + ' ' + event.time ).addHours(1),
                transp: 'OPAQUE',
                summary: event.label,
                alarms: event.reminder ? [60,30,10] : [],
                location: event.location
            }) ))
            .flatten();

        // console.log( days );
        builder.events = days;

        return builder.toString();
    }

    function parseEvent( string )
    {
        var parse = /(^[0-9]*[a|p]m)(!)?\s?([^@]*)(?:\s?@\s?([^!]*)?)?/;
        var array = string.match( parse );//.map( ([match, time, label, location, reminder]) => time );
        var event = {};
        [, event.time, event.reminder, event.label, event.location] = array;

        return event;
    }

    request.get( url, handleRequest );

}

exports.getCalendar = getCalendar;


// console.log( icsFileContent );
