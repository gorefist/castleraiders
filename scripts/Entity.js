// [Sergio D. Jubera]
// This is based on the same file from Udacity course, 
// with some modifications which are commented properly, if any.

EntityClass = Class.extend({
    // can all be referenced by child classes
    pos: {x: 0, y: 0},
    size: {w: 0, h: 0},
    _killed: false, // marked for the GameEngine to destroy it
    physBody: null,
    init: function(pos, size) {
        if (pos)
            this.pos = pos;
        if (size)
            this.size = size;
    },
    // can be overloaded by child classes
    update: function() {
    },
    // [Sergio D. Jubera]
    // I brought this here since all entities may have a physic body. In case an
    // entity doesn't need one, it will just stay null.
    setUpPhysics: function(bodyType)
    {
        var entityDef = {
            x: this.pos.x,
            y: this.pos.y,
            halfHeight: this.size.h * 0.5,
            halfWidth: this.size.w * 0.5,
            bodyType: bodyType ? bodyType : 'static',
            userData: {
                id: ++gGameEngine.gLastEntityGuid, // for debug and attack handling
                ent: this   // for collision handling
            },
            damping: 0
        };

        // Call our physics engine's addBody method
        // with the constructed entityDef.
        this.physBody = gPhysicsEngine.addBody(entityDef);
    },
    drawPhysicBody: function()
    {
        if (DEBUG_SHOW_PHYSIC_BODIES)
        {
            // Draw physic body (for debug)
            ctx.beginPath();
            ctx.rect(
                    this.physBody.GetPosition().x - (this.size.w * 0.5),
                    this.physBody.GetPosition().y - (this.size.h * 0.5),
                    this.size.w,
                    this.size.h);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'red';
            ctx.stroke();

            // Draw physic body type (for debug)
            var textToDisplay = "type=" + (this.physBody.GetType() === Body.b2_staticBody ? 'static' : this.physBody.GetType() === Body.b2_dynamicBody ? 'dynamic' : 'unknown body type');
            //textToDisplay += ", linear damping=" + this.physBody.GetDefinition().linearDamping;
            var fixture = this.physBody.GetFixtureList();
            //textToDisplay += ",density=" + fixture.GetDensity() + ",friction=" + fixture.GetFriction() + ",restitution=" + fixture.GetRestitution() + ",mass=" + fixture.GetMassData().mass;
            textToDisplay += ",allowSleep=" + this.physBody.GetDefinition().allowSleep;
            font = " bold 10px sans-serif";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#ff0000";
            ctx.fillText(
                    textToDisplay,
                    this.physBody.GetPosition().x + (this.size.w * 0.5),
                    this.physBody.GetPosition().y + (this.size.h * 0.5));
        }
    },
    drawEntityId: function(entityType)
    {
        if (DEBUG_SHOW_ENTITIES)
        {
            font = " bold 10px sans-serif";
            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "white";
            ctx.fillText(
                    this.physBody.GetDefinition().userData.id + "_" + entityType,
                    this.physBody.GetPosition().x - (this.size.w * 0.5),
                    this.physBody.GetPosition().y + (this.size.h * 0.5));
        }
    }
});

