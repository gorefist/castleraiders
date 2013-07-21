// [Sergio D. Jubera]
// This is based on the same file from Udacity course, 
// with some modifications which are commented properly, if any.

InputEngineClass = Class.extend({
    // A dictionary mapping ASCII key codes to string values
    // describing the action we want to take when that key is
    // pressed.
    bindings: {},
    // A dictionary mapping actions that might be taken in our
    // game to a boolean value indicating whether that action
    // is currently being performed.
    actions: {},
    mouse: {
        x: 0,
        y: 0
    },
    //-----------------------------
    setup: function() {
        // Example usage of bind, where we're setting up
        // the W, A, S, and D keys in that order.
        gInputEngine.bind(0, 'attack'); //Left click
        //gInputEngine.bind(2, 'cast'); //Right click //Not used yet
        
        gInputEngine.bind(87, 'walk_up'); //W
        gInputEngine.bind(65, 'walk_left'); //A
        gInputEngine.bind(83, 'walk_down'); //S
        gInputEngine.bind(68, 'walk_right'); //D
        gInputEngine.bind(32, 'next_soldier'); //space bar

        // Adding the event listeners for the appropriate DOM events.

        document.addEventListener('keydown', gInputEngine.onKeyDown);
        document.addEventListener('keyup', gInputEngine.onKeyUp);
        // [Sergio D. Jubera]
        // This is not working, so I just changed it to be the whole page to be
        // the listener, instead of the canvas.

//        document.getElementById('game_canvas').addEventListener('keydown', gInputEngine.onKeyDown);
//        document.getElementById('game_canvas').addEventListener('keyup', gInputEngine.onKeyUp);
//        
//      [Sergio D. Jubera]
//      I also changed this so that it doesn't stop tracing the mouse when it's
//      outside the canvas (it can be confusing for the player...)
//      
        //document.getElementById('game_canvas').addEventListener('mousemove', gInputEngine.onMouseMove);
        document.addEventListener('mousemove', gInputEngine.onMouseMove);
        document.addEventListener('mousedown', gInputEngine.onMouseDown);
    },
    //-----------------------------
    onMouseMove: function(event) {
        gInputEngine.mouse.x = event.clientX;
        gInputEngine.mouse.y = event.clientY;
    },
    //-----------------------------
    onKeyDown: function(event) {
        // Grab the keyID property of the event object parameter,
        // then set the equivalent element in the 'actions' object
        // to true.
        // 
        // You'll need to use the bindings object you set in 'bind'
        // in order to do this.
        var action = gInputEngine.bindings[event.keyCode];
        if (action) {
            gInputEngine.actions[action] = true;
        }

    },
    //-----------------------------
    onKeyUp: function(event) {
        // Grab the keyID property of the event object parameter,
        // then set the equivalent element in the 'actions' object
        // to false.
        // 
        // You'll need to use the bindings object you set in 'bind'
        // in order to do this.
        var action = gInputEngine.bindings[event.keyCode];
        if (action) {
            gInputEngine.actions[action] = false;
        }
    },
    onMouseDown: function(event)
    {
        var action = gInputEngine.bindings[event.button];
        if (action) {
            gInputEngine.actions[action] = true;
        }
    },
    // The bind function takes an ASCII keycode
    // and a string representing the action to
    // take when that key is pressed.
    // 
    // Fill in the bind function so that it
    // sets the element at the 'key'th value
    // of the 'bindings' object to be the
    // provided 'action'.
    bind: function(key, action) {
        gInputEngine.bindings[key] = action;
    }

});
var gInputEngine = new InputEngineClass();