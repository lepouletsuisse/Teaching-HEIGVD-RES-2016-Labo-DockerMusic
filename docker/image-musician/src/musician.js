var protocol = require('./music-protocol');

/*
 * We use a standard Node.js module to work with UDP
 */
var dgram = require('dgram');

const instruments = {"piano": "ti-ta-ti", "trumpet": "pouet", "flute": "trulu", "violin": "gzi-gzi", "drum": "boum-boum"};


/*
 * Let's create a datagram socket. We will use it to send our UDP datagrams
 */
var s = dgram.createSocket('udp4');

function Musician(instrument) {

    this.instrument = instrument;

    Musician.prototype.update = function() {

        //Only send the sound, just like a real Musician!
        var sonEmis = {
            sound: instruments[instrument]
        };
        var payload = JSON.stringify(sonEmis);

        /*
         * Finally, let's encapsulate the payload in a UDP datagram, which we publish on
         * the multicast address. All subscribers to this address will receive the message.
         */
        var message = new Buffer(payload);
        s.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function(err, bytes) {
            console.log("Sending payload: " + payload + " via port " + s.address().port);
        });

    };

    /*
     * Let's do a sound each second
     */
    setInterval(this.update.bind(this), 1000);

}

// Get the argument from the command line
var instrument = process.argv[2];

//Check if the argument is correct
if(instrument == undefined){
    console.log("USE: docker run -i -t musician {instrument}");
    return;
}
if(instruments[instrument] == undefined){
    console.log("The specified instrument doesn't exist!")
    return;
}

console.log("Musician setted: " + instrument);

/*
 * This is a new auditor
 * */
var musician = new Musician(instrument);
