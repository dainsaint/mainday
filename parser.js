var icalToolkit = require('ical-toolkit');
var request = require('request-promise-native');
var sugar = require('sugar');
var moment = require('moment-timezone');
var Observable = require('rxjs');

var builder = icalToolkit.createIcsFileBuilder();
var thisWeekUrl = "https://dl.dropbox.com/s/edw53lkvjoawmtj/This%20Week.md?dl=1";

var calendarUrl = "https://www.dropbox.com/s/t98ndsld86h9g6a/Calendar.md?dl=1"

var calendars = [
    "https://www.dropbox.com/s/t98ndsld86h9g6a/Calendar.txt?dl=1",
    "https://www.dropbox.com/s/95v2t4r956jf90c/Past%20Calendar.txt?dl=1"
]


sugar.extend();


let timezone = 'america/new_york';

builder.calname = "This Week";
builder.timezone = timezone;
builder.tzid = timezone;
builder.method = 'REQUEST';

function getCalendar( resolve, reject )
{

    function handleRequest( error, response, body )
    {
        if( !error && response.statusCode == 200 )
            resolve( parseIntoIcalYear(body) );
        else
            reject();
    }


    function parseIntoIcal( text )
    {
        let names = ['this Monday', 'this Tuesday', 'this Wednesday', 'this Thursday', 'this Friday', 'this Saturday', 'next Sunday'];
        let formatDate = date => new Date( moment.tz( date.format("%Y-%m-%d %H:%M"), timezone ) );

        var days = text.match(/^#[^#]*/gs)
            .map( day => day.split('\n')
              .filter( line => line.match(/^[0-9]*:?[0-9]*[a|p]m/)) )
            .map( day => day.map( parseEvent ) )
            .map( (day, i) => day.map( event => ({
                start: formatDate( Date.create(names[i] + ' ' + event.time ) ),
                end: formatDate( Date.create(names[i] + ' ' + event.time ).addHours(1) ),
                transp: 'OPAQUE',
                summary: event.label,
                alarms: event.reminder ? [60,30,10] : [],
                location: event.location
            }) ))
            .flatten();

        console.log( days );
        builder.events = days;

        return builder.toString();
    }


    function parseIntoIcalYear( text )
    {
        let formatDate = date => new Date( moment.tz( date.format("%Y-%m-%d %H:%M"), timezone ) );
        let isValidEvent = line => line.match(/^[0-9]*:?[0-9]*[a|p]m/) || line.match(/^\*/);

        var days = text.match(/#[^#]*/gs)
            .map( day => day.split('\n') )
            .map( ([date, ...events]) => ({date: date.match(/^#\s*(.*)/)[1], events: events.filter( isValidEvent ).map( parseEvent ) }) )
            .map( convertDay )
            .flatten();

        // console.log( days );
        // return days;
        // builder.events = days;
        // return builder.toString();

        return days;
    }

    function parseEvent( string )
    {
        var parse = /^(\*)?([0-9]*:?[0-9]*[a|p]m)?-?([0-9]*:?[0-9]*[a|p]m)?(!)?\s?([^@]*)(?:\s?@\s?([^!]*)?)?/;
        var array = string.match( parse );//.map( ([match, time, label, location, reminder]) => time );
        var event = {};
        [, event.allDay, event.start, event.end, event.reminder, event.label, event.location] = array;

        return event;
    }

    function convertDay( day )
    {

      let formatDate = date => new Date( moment.tz( date.format("%Y-%m-%d %H:%M"), timezone ) );

      let date = Date.create( day.date );
      let startDate = event => event.start ? date.get( event.start ) : date;
      let endDate = event => event.end ? date.get( event.end ) : event.start ? date.get( event.start ).addHours(1) : date;


      return day.events.map( event => ({
          start: formatDate( startDate(event) ),
          end: formatDate( endDate(event) ),
          transp: 'OPAQUE',
          summary: event.label,
          allDay: event.allDay,
          alarms: event.reminder ? [60,30,10] : [],
          location: event.location
      }) );
    }


    Observable.forkJoin(
        calendars
          .map( cal => Observable.from( request.get( cal ) ) )
      )
      .subscribe( data => {
        let days = data.map( parseIntoIcalYear ).flatten()
        builder.events = days;
        resolve( builder.toString() )
      } )

    // request.get( calendarUrl, handleRequest );

}

exports.getCalendar = getCalendar;


// console.log( icsFileContent );
