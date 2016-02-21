# chrome-speech-synthesis

## What is chrome-speech-synthesis?

chrome-speech-synthesis is a simple web app using your chrome as a human voice 
synthesiser (or try to think of online remote speaker device) throught simple
socket.io+express+node.js server.  

Only chrome (and sadly not chromium) has many synthesis voices of incredable quality,
and I need to overcome the shortcoming of linux based electron node.js's dumbness.  This
poverty of Shortcoming drove me to devise quick-and-dirty alternative to "barrow" 
google chrome's native speech synthesis service "legally" just by mashuping up 
via socket.io bridge externally from chrome. 

That's why I develop chrome-speech-synthesis which works as a remote bridge and control 
to chrome synthesiser's API.

![alt tag](https://github.com/jaejunh/chrome-speech-synthesis/blob/master/doc/brainstroming.jpg)

	
## Should I use this?
	
Well, yes and no.  It really depends on your project.  
	
	In our case, we need our garage project, smart mirror based on RPi 
	with electron.js (branch of chromium!!) need to speak some words. Yet 
	chromium, the open source brother of google chrome, has API but no voice
	due to license issue.
	
	That forced us to use "Mac" or "Windows", the OS of luxury voices, and 
	as you know that's hardly an option.   Instead, we need a better 
	cheap alternative, so we ended up separating out voice call service 
	to an independent HTTP web service.  By doing so, we still can 
	use RPi to speak (although via another PC), or at least we can change RPi 
	to a little more expensive alternative,  Intel Stick PC.
	
	If you are looking for solution to send "synthesized voice", this may be good
	start.  It's Free! (and my source code is MIT license if you need to 
	modify it to suite your project)
	
![alt tag](https://github.com/jaejunh/chrome-speech-synthesis/blob/master/doc/usage.jpg)

## Install:

	1. Install google-chrome (https://www.google.com/chrome/browser/desktop/index.html) 
		and node.js (https://github.com/nodesource/distributions)

	2. tar xzvfp chrome-speech-synthesis.0.x.x.tgz
		or better 
	   git clone https://github.com/jaejunh/chrome-speech-synthesis.git

	3. npm install 

	4. Configure server.  Edit index.js to suite your site.  
	   Please make sure to change BROADCAST_KEY and PROXYID to something else 
	   (so that you can only broadcast and pre register speakerID)

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

	   
	
	That's it! (for linux, Mac, and windows?)

## Run:
	1. Run chrome-speech-synthesis by:
		cd chrome-speech-synthesis
		node index.js
	
	2. See if your google-chrome browser can handle speech synthesis
	   Open up your google-chrome browser 
	   http://localhost:3000

	   At text input field, enter "hi" and see if you can hear it.

	   Note:  Optionally, you can send your text to another PC
	   if you know your friend's speakerID and enter
	   at "Remote Speaker ID".  Also, if you know your server's 
	   *BROADCAST_KEY*, you can put that in for every speaker
	   connected to the server.


	3. Now everything is ready.  Let's test using http GET url.

	   Open any browser (IE, Firefox, Chrome, Chromium, Safari, etc)
	   and enter URL:
	
	   http://localhost:3000/client?to=someID&msg=hello

	   If you hear any sound, everything works.  

	   [MORE ON URL examples:]
	   
	   * http://localhost:3000/client?to=someID&msg=Please Speak to me&voice=en-US&rate=0.5&pitch=1.2&volume=1.0
	   
	   that will make chrome voice synthesis service to speak/sound.
	   to: <auto generated 8 alphanumberic character ID on http://localhost:3000/ >
	   voice: en-US  (or try even "Google US female".  If you want.)
	   rate: 0.5  (slow down rate to half of normal speaking)
	   pitch: 1.2  (slightly high pitch)
	   volume: 1.0 (normal volume of client setting)
	   
	   * http://localhost:3000/client?to=someIDmsg=Please Speak to me&voice=en-GB~1     
	   	(second voice listed under en-GB, voice[1], happens to be male Englishman)
	   		
	   * http://localhost:3000/client?to=sumeID&voice=sound1
		(well, no voice, but notification of .ogg, thank you ubuntu!)
						
	   similarly, if voice=ko-KR or voice=ko, i.e.  
	   http://localhost:3000/client?msg=Please Speak to me&voice=ko-KR&rate=0.5&pitch=1.2&volume=1.0
	
	   you will get to here "konglish" (korean female trying to speak english, but quite didn't get it. laugh!)
	 
	 

	4. Now the fun parts! (since v0.1.5)
	   To maximize the experience of voice synthesis, I created sample "voice dialog" page, "rap".
	   Try:
	
	   http://localhost:3000/rap
	   Usage is similar, but don't forget to enter Speaker ID!

	   You will see what I mean by "drop the line", or "Yo Rap!"
	   

![alt tag](https://github.com/jaejunh/chrome-speech-synthesis/blob/master/doc/rap.png)


## Advanced Usage:  I understand basic.  How Can I Run Chrome Speech Synthesis Service(CSSS) as a Server?
	
	In order for CSSS to run as server, you need two services have to stay up, 
	namely, 1) CSSS node service (node index.js), 2) your google chrome
	
	1) is easy part (as you know from previous section), and for 2)
	you need to start the chrome with two parameters from command line,

	google-chrome-stable 'http://localhost:3000/?id=yourwishfulid&proxyid=PROXYID'

	By doing so,  you can start the CSSS with your fixed speakerID of your choice
	and never get changed.

	Remember I created this just for my purpose, so it's not best way or
	secure way, but it just works for me.


## Note:
	* Your chrome is acting as master voice synthesiser.
	  If you close it, no more voice! :)

	* If chrome browser is getting in your way, minimalize it to tray.

	* No security is handled at all.  It can accept any
	  http request from any host withtout any authentication.
	  So feel free to modify  the code. :)

## References:  
	Standard for Web Speech Synthesis (HTML5): 
	* https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html#examples-synthesis
	
	Standard for SSML
	* http://stackoverflow.com/questions/21952736/the-right-way-to-use-ssml-with-web-speech-api
	* https://www.w3.org/TR/speech-synthesis11/#edef_emphasis

	Main Code of Speech Synthesis API Example
	* http://blog.teamtreehouse.com/getting-started-speech-synthesis-api
