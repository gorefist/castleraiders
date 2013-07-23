// [Sergio D. Jubera]
// Represents an abstract, general AI machine state. Every type of automaton or
// robot should implement its own subclass of this one, with its specific
// behaviour.

AiAutomatonClass = Class.extend({
    _entity: null, // pointer to entity, to gather and update position & velocity coordinates
    route: null, // route to follow in idle state, if any (e.g.: enemies walking around)
    _currentState: 'idle', // current state of the automaton
    init: function(ent) {
        this._entity = ent;
        this.route = new AiRouteClass();
    },
    update: function() {
        switch (this._currentState) {
            case 'idle':
                var destination = this.route.nextPoint();

                if (destination !== null) {
                    if (distance(this._entity.pos, destination) > 5) {
                        this.lookAt(destination);
                        this.moveTo(destination);
                    }
                    else
                        this.route.moveToNext();
                }
                else
                    this._currentState = 'stop';
                break;
            case 'stop':
            default:
                break;
        }
    },
    // Moves towards the specified point.
    moveTo: function(point) {
        var move_dir = new Vec2(point.x - this._entity.pos.x, point.y - this._entity.pos.y);
        this.move(move_dir);
    },
    // Move in specified direction.
    move: function(move_dir) {
        if (this._entity.inputInfo === null)
            this._entity.inputInfo = new InputInfoClass();
        var inputInfo = this._entity.inputInfo;
        if (move_dir.LengthSquared())
        {
            move_dir.Normalize();
            move_dir.Multiply(this._entity.speed);
            inputInfo.walking = true;
            inputInfo.move_dir = move_dir;
        }
        else
            inputInfo.walking = false;
    },
    // Look at specified point (quantized).
    lookAt: function(point) {
        var look_dir = new Vec2(point.x - this._entity.pos.x, point.y - this._entity.pos.y);
        if (this._entity.inputInfo === null)
            this._entity.inputInfo = new InputInfoClass();
        this._entity.inputInfo.faceAngle0to3 = quantizeAngle(look_dir, 4);
    },
    // Do attack.
    attack: function() {
        if (this._entity.inputInfo === null)
            this._entity.inputInfo = new InputInfoClass();
        this._entity.inputInfo.fire0 = true;
    },
    stop: function() {
        if (this._entity.inputInfo === null)
            this._entity.inputInfo = new InputInfoClass();
        var inputInfo = this._entity.inputInfo;
        inputInfo.move_dir = new Vec2(0, 0);
        inputInfo.walking = false;
        this._currentState = 'stop';
    }
});


