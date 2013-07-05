// [Sergio D. Jubera]
// Represents a heart collectible item, for health recovery (just humans).

var HEART_SIZE = {w: 8, h: 8};  // Make it slightly smaller to allow a more
// natural effect when grabbing it
var HEART_ANIM_OFFSET = {x: 0, y: 0};   // Needed for the pseudo-3D effect

HeartItemClass = EntityClass.extend({
    animation: null,
    recoveryPoints: 20,
    init: function(pos, value)
    {
        this.parent(pos, HEART_SIZE);
        this.setUpPhysics('static');
        this.recoveryPoints = value;

        // Set up animations
        try
        {
            var anim_obj = new AnimationClass();

            var tens = 0;
            var units = 0;
            var frame = 0;

            while (frame !== null)
            {
                frame = gSpriteSheets['animation'].getStats("heart" + tens + units + ".png");
                if (frame)
                {
                    anim_obj.addFrame(frame);
                    units++;
                    if (units > 9)
                    {
                        units = 0;
                        tens++;
                    }
                }
            }
            anim_obj.speed = HEART_ANIM_SPEED;
            this.animation = anim_obj;
        }
        catch (e)
        {
            console.log(e.stack);
        }
    },
    draw: function()
    {
        // Draw item value
        if (SHOW_VALUE_ITEMS)
        {
            ctx.font = "bold 10px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "base";
            ctx.fillStyle = "#000000";
            ctx.fillText("+" + this.recoveryPoints + " HP", this.pos.x, this.pos.y + this.size.h * 2);
        }

        this.animation.draw(this.pos.x, this.pos.y + HEART_ANIM_OFFSET.y);
        
        this.animation.animate();
        this.drawEntityId('heart'); // for debug
    },
    itemEffects: function(targetEnt)
    {
        targetEnt.hitPoints = Math.min(targetEnt.hitPoints + this.recoveryPoints, targetEnt.maxHitPoints);
        //gPhysicsEngine.removeBody(this.physBody); // this fails here for static objects, I moved it to gGameEngine.update(), when all killed entities are effectively destroyed (step 2)
        this._killed = true;

        // TO DO: add a visual for damage effect
    }
});

gGameEngine.factory['heart'] = HeartItemClass;