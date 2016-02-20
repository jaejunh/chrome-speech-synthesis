## Version Information
V0.1.8:
	major bump up
	needed a process to keep the existing speakerID without using storage:
	 i.e)  smart mirror (the client fro CSSS) has to connect to known 
			and perpertually fixed speakerID.
		* thus CSSS of chrome side need to keep fixed speakerID
		   ==> logic changed so that once the speakerID is
			given, you cannot change it until node server is
			rebooted
		   ==> also, chrome can start the parameter such as
			google-chrome-stable 'http://localhost:3000/?id=fixmyid&proxyid=embian'
			where id is the speakerID you want to use and
			proxyid is the server's permission key for this
			action.  			
	
	
V0.1.7:
        added "to" and "broadcast" syntax and parameters.
		now you have to know "where" to send.
	clean up code and more documentation
	
v0.1.6:
        move index.html and rap.html to pubic/htmls
        todo:  need to figure out how to sync voice speech with sound.
                any idea?
v0.1.5:
        now rap.html:  sound[12] takes timewait parameter.
        thus, if you need to make the sound1 after 5 sec,
        sound1: 5000
        will do.

v0.1.4:
        added Speaking Test(aka machine rapper!) for Chrome Speech Synthesis Service
        added sound1, sound2 (as voice) from ubuntu sound  - thank you ubuntu!
        http://localhost:3000/rap

        Note
                hard part is synchronizing voices & sound  under ajax
                environment.  It turns out speech synthesis does really
                good enqueue.



V0.1.3:
        Cleanup code. split up css/js/html
        Put Language guess (yet it's not working very well, darn)
        Now http GET accept language code (en-US, ko-KR) as "voice"
                for better interaction between speech synthesis
                since voice's name is very dependent on voice
                providers.
        Add range slider's value display
        Add original reference of the code base


v0.1.2:  Major change from text msg to json msg for all controls.
        Also add defaultVoice at index.js when voice is not given to speak.

        ToDo 1:  Done
        ToDo 4:  Better Logging (color + json message)
        ToDo 6:  Fix javascript to drop Voices before loadVoice

V0.1.1:  add log to server
v0.1.0:  Initial Release


