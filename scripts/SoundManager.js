// [Sergio D. Jubera]
// This is based on the same file from Udacity course, 
// with some modifications which are commented properly, if any.

// How to play sounds:
//var snd = new Sound("audio/TaDa.mp3");
//snd.play(false);
// OR
// playSoundInstance("audio/TaDa.mp3");

SoundManager = Class.extend({
    clips: {},
    enabled: true,
    _context: null,
    _mainNode: null,
    //----------------------------
    init: function() {
        try {
            this._context = new webkitAudioContext();
            this._mainNode = this._context. //createGainNode(0);
                                           createGain(0);
            this._mainNode.connect(this._context.destination);
        } catch (e) {
            //alert('Web Audio API is not supported in this browser');
            alert(e.message);
            this.enabled = false;
        }
    },
    //----------------------------
    // Parameters:
    //	1) path: a string representing the path to the sound
    //           file.
    //  2) callbackFcn: a function to call once loading the sound file
    //                  at 'path' is complete. This should take a Sound
    //                  object as a parameter.
    //----------------------------
    loadAsync: function(path, callbackFcn) {
        if (this.enabled) {
            if (this.clips[path]) {
                callbackFcn(this.clips[path].s);
                return this.clips[path].s;
            }

            var clip = {
                s: new Sound(),
                b: null,
                l: false
            };
            this.clips[path] = clip;
            clip.s.path = path;

            var request = new XMLHttpRequest();
            request.open('GET', path, true);
            request.responseType = 'arraybuffer';
            request.onload = function() {
                gSM._context.decodeAudioData(request.response,
                        function(buffer) {
                            gSM.clips[path].b = buffer;
                            gSM.clips[path].l = true;
                            callbackFcn(gSM.clips[path].s);
                        },
                        function(data) {
                        });

            };
            request.send();


            return clip.s;
        }
    },
    //----------------------------
    togglemute: function() {
        // Check if the gain value of the main node is 
        // 0. If so, set it to 1. Otherwise, set it to 0.
        if (this._mainNode.gain.value > 0) {
            this._mainNode.gain.value = 0;
        }
        else {
            this._mainNode.gain.value = 1;
        }
    },
    //----------------------------
    stopAll: function()
    {
        if (this.enabled) {
            // Disconnect the main node, then create a new 
            // Gain Node, attach it to the main node, and 
            // connect it to the audio context's destination. 
            this._mainNode.disconnect();
            this._mainNode = this._context.createGainNode(0);
            this._mainNode.connect(this._context.destination);
        }
    },
    //----------------------------
    // Parameters:
    //	1) path: a string representing the path to the sound
    //           file.
    //  2) settings: a dictionary representing any game-specific
    //               settings we might have for playing this
    //               sound. In our case the only ones we'll be
    //               concerned with are:
    //               {
    //                   looping: a boolean indicating whether to
    //                            loop.
    //                   volume: a number between 0 and 1.
    //               }
    //----------------------------
    playSound: function(path, settings) {
        // Check if the Sound Manager has been enabled,
        // return false if not.
        if (!this.enabled)
            return false;

        // Set default values for looping and volume.
        var looping = false;
        var volume = 0.2;

        // Check if the given settings specify the volume
        // and looping, and update those appropriately.
        if (settings) {
            if (settings.looping)
                looping = settings.looping;
            if (settings.volume)
                volume = settings.volume;
        }

        // Check if the path has an associated sound clip,
        // and whether the sound has been loaded yet.
        // Return false if either of these sanity checks
        // fail.
        var sd = this.clips[path];
        if (sd === null)
            return false;
        if (sd.l === false)
            return false;

        var currentClip = null;

        // create a new buffer source for the sound we want
        // to play. We can do this by calling the 'createBufferSource'
        // method of this._context.
        currentClip = this._context.createBufferSource();

        // Set the properties of currentClip appropriately in order to
        // play the sound.
        currentClip.buffer = sd.b; // tell the source which sound to play
        var gain = this._context.createGain();
        currentClip.connect(gain);
        gain.gain.value = volume;
        currentClip.loop = looping;

        // Connect currentClip to the main node, then play it. We can do
        // this using the 'connect' and 'noteOn' methods of currentClip.
        currentClip.connect(this._mainNode);
        currentClip.start(0);

        return true;
    }
});

//----------------------------
Sound = Class.extend({
    path: "",
    init: function(path) {
        if (path)
            this.path = path;
    },
    play: function(loop, vol) {
        // Call the playSound function with the appropriate path and settings.
        gSM.playSound(this.path, {looping: loop, volume: vol});
    }
});

//----------------------------
function playSoundInstance(soundpath) {
    // Load a new Sound object, then call its play method.
    this.loadAsync(soundpath, function(sObj) {
        sObj.play(false);
    });
}

var gSM = new SoundManager();