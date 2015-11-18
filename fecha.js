var util = require('util');
var events = require('events');
var request = require('request');
var sfx = require("sfx");

var url_turnos = 'http://www.buenosaires.gob.ar/solicitar-turno-registro-civil';
var url_comunas = "https://sigeci.buenosaires.gob.ar/gestorcitas/app/rest/frontservices/fechasdisp?fromDate=2015-08-30&servicioId=1029&toDate=2015-11-30";


function check_availablity() {
    var eventEmitter = new events.EventEmitter();
    request(url_comunas, function(error, response, body) {
        if(!!error) {
            eventEmitter.emit('error', error);
            return;
        }

        var comunas = JSON.parse(body);
        var date_available = false;
        var comuna;
        for(var i = 0; i < comunas.length; i++) {
            comuna = comunas[i];
            date_available  = comuna.fechas.filter(function(x) { return x === '2015-10-09'; }).length > 0;
            if(date_available) {
                break;
            }
        }
 
        eventEmitter.emit('end', date_available);
    });

    return eventEmitter;
}

var minute = 60000;
var time_timeout = minute * 5;

var check = function() {
    util.log("checking");
    check_availablity()
        .on('error', function(error) {
            util.log(error);
            setTimeout(check, time_timeout);
        })
        .on('end', function(date_available) {
            if(date_available) {
                util.log("DATE AVAILABLE!!");
                setInterval(sfx.ping, 1000);
            } else {
                util.log("date not available");
                setTimeout(check, time_timeout);
            }
        });
};

check();


