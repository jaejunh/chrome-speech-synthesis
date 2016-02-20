var supportMsg = document.getElementById('msg');
var reference = ' <strong>Note: Main code snippets came from <a href=http://blog.teamtreehouse.com/getting-started-speech-synthesis-api> here </a>!</strong>';  

if ('speechSynthesis' in window) {
    supportMsg.innerHTML = 'Your browser <b>supports</b> speech synthesis.' + reference;
    supportMsg.classList.add('reference');
} else {
    supportMsg.innerHTML = 'Sorry your browser <strong>does not support</strong> speech synthesis.<br>Try this in <a href="http://www.google.co.uk/intl/en/chrome/browser/canary.html">Chrome Canary</a>.';
    supportMsg.classList.add('not-supported');
}

var sound1 = new Audio("/resources/Positive.ogg"); sound1.currrentTime=0;
var sound2 = new Audio("/resources/Mallet.ogg"); sound2.currrentTime=0;

var button = document.getElementById('speak');
var speechMsgInput = document.getElementById('speech-msg');
var voiceSelect = document.getElementById('voice');
var volumeInput = document.getElementById('volume');
var rateInput = document.getElementById('rate');
var pitchInput = document.getElementById('pitch');
var speakerIDInput =document.getElementById('speakerID');
var remoteIDInput = document.getElementById('remoteID');

function loadVoices() {
    var voices = speechSynthesis.getVoices();
    while (voiceSelect.firstChild) {
        voiceSelect.removeChild(voiceSelect.firstChild);
    }
    voices.forEach(function (voice, i) {
        //if (!/google/i.test(voice.name)) { return true; };
        var option = document.createElement('option');
        option.value = voice.name;
//	option.text = voice.lang;
	option.label = voice.name + " (" + voice.lang + ")";
        option.innerHTML = voice.name;
        voiceSelect.appendChild(option);
	//console.log(voice);
    });
}
loadVoices();
window.speechSynthesis.onvoiceschanged = function (e) {
    loadVoices();
};

function speakLocally(text) {
    var msg = new SpeechSynthesisUtterance();
    msg.text = text;
    msg.volume = parseFloat(volumeInput.value);
    msg.rate = parseFloat(rateInput.value);
    msg.pitch = parseFloat(pitchInput.value);
    if (voiceSelect.value) {
        msg.voice = speechSynthesis.getVoices().filter(function (voice) {
            return voice.name == voiceSelect.value;
        })[0];
    }
    window.speechSynthesis.speak(msg);
}

function OpenInNewTab(url) {
  var win = window.open(url, '_blank');
  win.focus();
}

function buildMsg(msg,pitch,rate,volume,voice,to,from) {
   return { msg: msg, pitch: pitch, rate: rate, volume: volume, voice: voice, to: to, from: from };
}

function bound(v,min,max) {
   if (typeof v == 'undefined' || v == null)  return 1.0;
   if (v < min) return min;
   if (v > max) return max;
   return v;
}


function shipData() {
    var obj = buildMsg(speechMsgInput.value, pitchInput.value, rateInput.value, volumeInput.value, voiceSelect.value, remoteIDInput.value, speakerIDInput.value);
                                
    printMsg(obj);

    if (remoteIDInput == undefined || remoteIDInput.value == "") {
	// don't know where to send
	return;
    } 
    if (speechMsgInput == undefined || speechMsgInput.value == "") {
	// no message to send
	return;
    }   
    socket.emit('chat message', obj);
}

function suggest(m,v) {
	var voices = speechSynthesis.getVoices();
	var i=0;
	var g="";
	var n=0;
	var res=v.split("~");
	if (res.length > 0) {
		console.log("### multi voice search request: "+v);
		v=res[0];
		n=res[1] ? res[1] : 0;
		console.log("### multi voice search request: v is now: "+v);
	};
	var pattern = new RegExp(v);

	console.log("Enter... " + m);

	// guess language from message m 

	guessLanguage.detect(m,function(language) { 
		if (language !== "unknown") {
			g=language;
		} 
		console.log("text guessed lang:( "+language+"," + g + ")");
	});
	
	// find exact match
	for (i=0; v && i < voices.length; i++) { 
		if (pattern.test(voices[i].name)) {
			console.log("voice loop: (" + v + ")" + voices[i].name);
			return voices[i].name;
		};
	}
	// find language match 
	var candidate = [];
	for (i=0; v && i < voices.length; i++) {
		if (pattern.test(voices[i].lang)) {
			console.log("lang loop: (" + v + ")" + voices[i].name);
			candidate[candidate.length] = voices[i].name;
		};
	}

	console.log("### candidate.length:n=" + candidate.length + ":" + n);

	if (candidate.length > 0) {
		 return candidate.length > n && n >= 0 ? candidate[n] :candidate[0];
	}
	
	if (!g) {
		return voice[0].name;
	}


	// ok guessed lang voice hopely exsits?
	pattern = new RegExp(g);
	for (i=0; i < voices.length; i++) {
		if (pattern.test(voices[i].lang)) {
			console.log("found matching guessed voice: " + voices[i].name);
			return voices[i].name;
		};
	}
	// too bad, just return default
	console.log("bad luck! guessed voice: is first one. " + v);
	return voices[0].name;
}

function isFilled(v) { return (v == "") ? false : true; }; 

function setData(obj) {
    if (typeof obj == 'undefined' || obj == null) {
	// do nothing?
    } else if (obj.voice == "sound1") {
	// do nothing.  sound play
	printMsg(obj);
    }else {
    	printMsg(obj);

    	$('#speech-msg').val(obj.msg);
	var v=suggest(obj.msg,obj.voice);
	console.log("suggest voice: " + v);
    	$('#voice').val(v); 
    	if (isFilled(obj.rate))  { 
		var v=bound(obj.rate,0.3,1.8);
		$('#rate').val(v); $('#rateOutput').val(v*1.0); 
	};
    	if (isFilled(obj.pitch)) { 
		var v=bound(obj.pitch,0.3,1.8); 
		$('#pitch').val(v); $('#pitchOutput').val(v*1.0); 
	};
    	if (isFilled(obj.volume)){ 
		var v=bound(obj.volume,0,1.0); 
		$('#volume').val(v); $('#volumeOutput').val(v*1.0); 
	};
	if (obj.voice == "silence") {
		$('#volume').val(0); $('#volumeOutput').val(0); 
	}
    	if (isFilled(obj.debug)) { /* let's work on later  */ }; 
    }; 
}


function speakIfAny() {
    if (speechMsgInput.value.length > 0) {
        speakLocally(speechMsgInput.value);
    }
}


function printMsg(obj) {
    if ($('#messages li').size() >= 7) {
        $('#messages li:last-child').remove();
    };
    $('#messages').prepend($('<li>').text("["+ obj.voice 
	//				+ "|r:" + obj.rate 
	//				+ "|p:" + obj.pitch 
	//				+ "|v:" + obj.volume 
					+ "] " + obj.msg));
} 

button.addEventListener('click', function (e) {
    speakIfAny();
    shipData();
});

var socket = io();


socket.on('greetings', function(obj) {
	// if I didn't start with id, then accept it
	if (speakerIDInput.value == undefined || speakerIDInput.value == "") {
		$('#speakerID').val(obj.id);
		document.getElementById('mySpeakerID').innerHTML=obj.id;
		console.log("resetting my speakerID: " + speakerIDInput.value);
	} else {
		// i already have id. I don't want to change it. Tell server
		socket.emit('set id', { localid: speakerIDInput.value, serverid: obj.id }); 	
	}
});

socket.on('chat message', function(obj){
    setData(obj);
    if (obj.voice == "sound1") {
	window.setTimeout(function () { 
		sound1.play(); sound1.currentTime=0; }, parseInt(obj.msg)||0);
    } else if (obj.voice == "sound2") { 
	window.setTimeout(function () { 
		sound2.play(); sound2.currentTimeout=0; }, parseInt(obj.msg)||0);
    } else {
	speakIfAny();
    }
});



