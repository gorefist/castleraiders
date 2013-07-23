// [Sergio D. Jubera]
// Represents the AI machine state for all the 

AiAutomaton_SkeletonClass = AiAutomatonClass.extend({
    init: function(entity) {
        this.parent(entity);
    },
    update: function() {
        switch (this._currentState) {
            case 'attack':
                if (this._entity.enemiesInSightRange.length <= 0)
                    this._currentState = 'idle';
                else {
                    if (this._entity.entitiesInAttackRange.length > 0) {
                        //look at first enemy and attack
                        for (var i = 0; i < this._entity.entitiesInAttackRange.length; i++) {
                            if (this._entity.entitiesInAttackRange[i].soldierType === 'human') {
                                this.lookAt(this._entity.entitiesInAttackRange[i].pos);
                                this.attack();
                                break;
                            }
                        }   
                    }
                    else {
                        // There are enemies in sight but they're not inside
                        // attack range, get closer:
                        this.lookAt(this._entity.enemiesInSightRange[0].pos);
                        this.moveTo(this._entity.enemiesInSightRange[0].pos);
                    }
                }
            case 'blocked':
                // TO DO: unblock route (THIS WILL BE QUITE A CHALLENGE!!)
                break;
            case 'idle':
            case 'stop':
            default:
                if (this._entity.enemiesInSightRange.length > 0)
                    this._currentState = 'attack';
                this.parent();  // just idle state (walking around)
                break;
        }
    }

    /*        // Code for quick tests
     this.lookAt(gGameEngine.currentSoldier().pos); // look at current soldier
     
     if (distance(this._entity.pos, gGameEngine.currentSoldier().pos) > 100)
     this.moveTo(new Vec2(gGameEngine.currentSoldier().pos.x, gGameEngine.currentSoldier().pos.y));  // move close to current soldier
     else if (distance(this._entity.pos, gGameEngine.currentSoldier().pos) <= 100)
     this.attack();
     else
     this.stop();
     */
});

gAiEngine.factory['skeleton'] = AiAutomaton_SkeletonClass;