// [Sergio D. Jubera]
// This class has access to any automaton/robot of the game, so it can update
// all of them. It could be extended to collect statistics or implement complex
// strategies for groups of automatons/robots. Currently it just update every
// entity's robot state based on its own individual situation.

AiEngineClass = Class.extend({
    factory: {},
    _robots: [],
    init: function() {

    },
    registerRobot: function(automaton) {
        this._robots.push(automaton);
    },
    unregisterRobot: function(automaton) {
        this._robots.erase(automaton);
    },
    update: function() {
        for (var i = 0; i < this._robots.length; i++) {
            this._robots[i].update();
        }
    },
});

var gAiEngine = new AiEngineClass();