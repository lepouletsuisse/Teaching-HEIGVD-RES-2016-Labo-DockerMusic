function Musician(instr, date, addr, p, actSince) {
    this.instrument = instr;
    this.uuid = guid();
    this.lastUpdated = date;
    this.activeSince = actSince;
    this.address = addr;
    this.port = p;
}

var activeMusician = {};

var protocol = require('./music-protocol');
var net = require('net');

const instruments = {"ti-ta-ti": "piano", "pouet": "trumpet", "trulu": "flute", "gzi-gzi": "violin", "boum-boum": "drum"};

/*
 * We use a standard Node.js module to work with UDP
 */
var dgram = require('dgram');

/* 
 * Let's create a datagram socket. We will use it to listen for datagrams published in the
 * multicast group by musicians and containing the instrument
 */
var s = dgram.createSocket('udp4');
s.bind(protocol.PROTOCOL_PORT, function () {
    console.log("I'm listening, let's rock baby!!!");
    s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

/*
 * Start a TCP server
 * */
net.createServer(function (socket) {

    /*
    * Create a structure that allow the good parsing of the class to send to the TCP socket
    * */
    deamonCheckDate();
    var musicianToSend = [];
    Object.keys(activeMusician).forEach(function(key, index){
        var musicianTmp = {};
        musicianTmp["uuid"] = this[key].uuid;
        musicianTmp["instrument"] = this[key].instrument;
        musicianTmp["activeSince"] = this[key].activeSince;
        musicianToSend.push(musicianTmp);
    }, activeMusician);

    // Send the informations to the client
    socket.write(JSON.stringify(musicianToSend));
    socket.end();
}).listen(2205);

/* 
 * This call back is invoked when a new datagram has arrived.
 */
var blacklist = [];
s.on('message', function (msg, source) {
    // Use a blacklist in case of a bad sound
    if (blacklist.indexOf(source.address) == -1) {
        var message = JSON.parse(msg);
        var sound = message["sound"];
        if (sound == undefined) {
            blacklist.push(source.address);
            console.log("Bad sound ( " + sound + "), that sound ugly!! Ignoring source " + source.address);
        }
        var instrumentName = instruments[sound];
        console.log("Received!! " + instrumentName + ": " + sound + " from address " + source.address);
        if (activeMusician[source.address]) {
            activeMusician[source.address].lastUpdated = Date.now();
        }
        else {
            activeMusician[source.address] = new Musician(instrumentName, Date.now(), source.address, source.port, new Date());
            console.log("New musician! " + instrumentName + " from " + source.address);
        }
    }
});

//Launch a Deamon for checking the age of musician each second
setInterval(deamonCheckDate, 1000);

function deamonCheckDate(){
    Object.keys(activeMusician).forEach(function(key, index){
        if(Date.now() - this[key].lastUpdated > 5000){
            console.log("Looks like musician " + key + " with instrument " + this[key].instrument + " is not playing anymore :(");
            delete this[key];
        }
    }, activeMusician);
}

/*
 * Create the UUID in a random way with a random generator
 * Found on internet (Thank you stackoverflow!!)
 * http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 * */
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}
