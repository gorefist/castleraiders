// [Sergio D. Jubera]
// Represents the AI machine state for all the 

AiAutomaton_SkeletonClass = AiAutomatonClass.extend({
    init: function(entity) {
        this.parent(entity);
    },
    update: function() {
        switch (this._currentState) {
            case 'attack':
            case 'blocked':
            case 'stop':
                break;
            default:
                this.parent();  // just idle state (walking around)
                break;
        }
    }

    /*        // Code for quick tests
     this.look(gGameEngine.currentSoldier().pos); // look at current soldier
     
     if (distance(this._entity.pos, gGameEngine.currentSoldier().pos) > 100)
     this.moveTo(new Vec2(gGameEngine.currentSoldier().pos.x, gGameEngine.currentSoldier().pos.y));  // move close to current soldier
     else if (distance(this._entity.pos, gGameEngine.currentSoldier().pos) <= 100)
     this.attack();
     else
     this.stop();
     */
});

gAiEngine.factory['skeleton'] = AiAutomaton_SkeletonClass;