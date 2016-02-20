// chrome-speech-synthesis
//      this is web application service written for node.js/express
//	which acts as gateway API server for google chrome
//  
//      http GET request from remote
//		-->  chrome-speech synthesis server
//			--> google chrome voice API (thru socket.io)
//  
// author: jaejunh @embian.com
// license: MIT 
// date:  2016.2.19
//
////////////////////////////////////////////////////////////////////////
// Configuration
////////////////////////////////////////////////////////////////////////
var servicePort = 3000;
var BROADCAST_KEY = "embian";
var defaultVoice = "ko-KR";
// you can change the keyLength to much bigger size if you want
var keyLength = 4;
// client can start the chrome command line with GET parameter
//  id=my_wishful_id_in_alphanumeric&proxyid=someid
// if that's the case, one also need to specify PROXYID 
// 
// so change PROXYID for yoursite for security 
var PROXYID = "embian";

////////////////////////////////////////////////////////////////////////
// NOTE: for multi user service, you need to make separate
// speaker ID registration process  where speaker ID is always
// assigned and bounded by user's preference.
// 
// In my case, it was over-kill to implement that because
// I will be just using one speaker ID to bridge on speaker.
// where I can get away with broadcast key.  
////////////////////////////////////////////////////////////////////////

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
//var LanguageDetect = require('languagedetect');
//var ld = new LanguageDetect();

// view engine setup
app.set('views', __dirname + '/views');
// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

var util = require('util');



////////////////////////////////////////////////////////////////////////
// Global Variable 
////////////////////////////////////////////////////////////////////////
var socket_ids = [];

var errCode = { 530: "General Error:",
		  531: "Unicast with No Specified:",
		  532: "Unicast with No Client under that name:",
		  533: "Unicast with No Message:",  
		  550: "Unknown Error:" };
			

////////////////////////////////////////////////////////////////////////
// Http Request Handlers 
////////////////////////////////////////////////////////////////////////
// main html file for google chrome service.  
app.get('/', function(req, res){
  var id=req.query.id;
  var proxyid=req.query.proxyid
  var speakerID = "";
  var speakerIDLabel = "..Generating ID...";

  if (id == undefined || id == "" || proxyid== undefined || proxyid == "") {
	// wrong syntax. nothing to set
  } else  if (proxyid  == PROXYID) { 
	// need to set variables
	// speakerID has to alphanumeric
	speakerID = id.replace(/([^a-zA-Z0-9])/,""); 
	speakerIDLabel = speakerID;
  } else {
	// wrong PROXYID
  }
  res.render(__dirname +'/views/index.ejs', {
	speakerID: speakerID,
	speakerIDLabel: speakerIDLabel
  });
});


// GET handler .  
app.get('/client', function(req,res) {

   // process parameters
   var debug=req.query.debug;
   var msg=req.query.msg;
   var voice=req.query.voice ? req.query.voice : defaultVoice;

   var pitch=parseFloat(req.query.pitch);
   var rate=parseFloat(req.query.rate);
   var volume=parseFloat(req.query.volume);
   var to=req.query.to;
   var from="web";

   // to must be there
   if (to == undefined || to === "") {
   	d = new Date();
   	return res.status(531).send(errCode[531]+po(req.query,false));
   }

   var msgObj = buildMsg(msg,pitch,rate,volume,voice,to,from);

   d = new Date();

   console.log('<==]message: ' + po(req.query,true));
   if (msg == "") {
	// do nothing
	console.error(errCode[533]);
	return res.status(533).send(errCode[533]+po(req.query,false));   
   } 
   // broadcast handler
   if (msgObj.to == BROADCAST_KEY) {
	console.log('==><== broadcast');
    	io.emit('chat message', msgObj);
   	return res.send(d.toString() + ':' + po(req.query,false));
   } 
   
   // unicast handler
   var r = unicastHandler(msgObj); 

   if (r > 500) {
   		res.status(r).send(errCode[r] +  po(req.query,false));
   } else {
   		res.send(d.toString() + ':' + po(req.query,false));
   }
});

// Example (demo) client, sending multiple lines of speech to CSSS   
app.get('/rap', function(req,res) {
  res.sendFile(__dirname + '/public/htmls/rap.html');
});

	
// client can send http://localhost:3000/client?msg=안녕하세요 
//  from any http client, and it will send that msg to
//  google chrome via socket.io

////////////////////////////////////////////////////////////////////////
// Helper Functions 
////////////////////////////////////////////////////////////////////////
// print json to string to be printed 
function po(obj,color) { return util.inspect(obj, { colors: color, depth: 2 } ); };

// msg obj builder 
function buildMsg(msg,pitch,rate,volume,voice,to,from) {
  return { msg: msg, pitch: pitch, rate: rate, volume: volume, voice: voice, to: to, from: from };
}

// generate random string with give length 
function randomString(length) {
    var result = '';
    //var chars = '0123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
    var chars = '0123456789thankyouverymuch';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

////////////////////////////////////////////////////////////////////////
// Socket unicast handler 
////////////////////////////////////////////////////////////////////////
function unicastHandler (msgObj) {
    msgObj.to=msgObj.to.trim();
    if (msgObj.to == undefined || msgObj.to == "") {
	console.error(errCode[531]);
	return 531;
    } 
    if (socket_ids[msgObj.to] == undefined || socket_ids[msgObj.to] == "") { 
	console.error(errCode[532]);
	return 532;
    } 

   io.to(socket_ids[msgObj.to]).emit('chat message', msgObj);
    
   return 200;
}


////////////////////////////////////////////////////////////////////////
// Socket.io Websocket Handler 
//
// Note:  Just for me to remember
// receive: *.on
// send: *.emit
//  assume:  A: sender, B: someone 
//	    ~A: everyone except sender A
//	    ~B: everyone except B
// 	    ALL:  everyone including sender
// 
// (associate with sender)
// 1. send(A):		socket.emit();
// 2. send(~A): 	socket.broadcast.emit(); <--- I don't like this notation  
//				<-- io.NOT(A).emit.  should be better  notation
// (since following doesn't associate with sender)
// 3. send(B):  	io.to("B's socket.id").emit();
// 4. send(ALL): 	io.emit('msg type', msgObj);  
//
// http://www.html5gamedevs.com/topic/9816-sending-a-specific-socketid-data-with-nodejssocketio/
////////////////////////////////////////////////////////////////////////
// standard socket.io chat messaging

io.on('connection', function(socket){
  // when connect reqeust sent, 
  // first create humanly readable userid at server side first
  var from = randomString(keyLength);
  console.log('User '+socket.id+' connected, ' + from);
  socket.emit('greetings',{id: from });

  // bookkeeping socket.id with from
  // to be used later at "send to anybody, B"
  socket_ids[from] = socket.id;


  socket.on('set id', function(msgObj) {
	// ok. my client send request to keep the id,
	// then, i need to bookkeep that
	console.log("==>|set id to " + msgObj.localid 
				+ " from " + msgObj.serverid);
	socket_ids[msgObj.localid]=socket.id
	if (socket_ids[msgObj.serverid] == undefined) {
		//nothing to delete
	} else {
		// delete my index
		delete socket_ids[msgObj.serverid];
	}
  }); 
  // main message handling  
  socket.on('chat message', function(msgObj){
    	console.log('==>]message: ' + po(msgObj));
	// if requesting broadcast, make sure he knows secret key
   	if (msgObj.to == BROADCAST_KEY) {
		console.log('==><== broadcast');
    		socket.broadcast.emit('chat message', msgObj);
	} else {
		// it's not broadcast. then better be unicast
		unicastHandler(msgObj);
	}
  });
  // disconnect
  socket.on('disconnect', function() {
    console.log("disconnect request!");
    // delete entry at from my book
    delete socket_ids[from];
  });
});

////////////////////////////////////////////////////////////////////////
// web server main loop
////////////////////////////////////////////////////////////////////////

// Socket.io Websocket Handler 
// listen to serverPort 
// or if you want to use only locally by yourself,
// use following line instead,
// http.listen(3000, 'localhost', function(){
http.listen(servicePort, function(){
  console.log('listening on *:' + servicePort);
});

