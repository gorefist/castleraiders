// [Sergio D. Jubera]
// Represents a chest collectible item, which gives coins (points) to the user.

var CHEST_SIZE = {w: 16, h: 16};
var CHEST_SIZE_SMALL = {w: 8, h: 8};
var CHEST_ANIM_OFFSET = {x: 0, y: -8};   // Needed for the pseudo-3D effect

ChestItemClass = EntityClass.extend({
    animation: null,
    coins: 100,
    init: function(pos, value)
    {
        this.parent(pos, value > 500 ? CHEST_SIZE : CHEST_SIZE_SMALL);
        this.setUpPhysics('static');
        this.coins = value;

        // Set up animations
        try
        {
            var anim_obj = new AnimationClass();

            var animName = value > 500 ? 'chest' : 'small_chest';
            var tens = 0;
            var units = 0;
            var frame = 0;

            while (frame !== null)
            {
                frame = gSpriteSheets['animation'].getStats(animName + tens + units + ".png");
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
            anim_obj.speed = CHEST_ANIM_SPEED;
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
            ctx.fillText("+" + this.coins + " coins", this.pos.x, this.pos.y + this.size.h * 1.5);
        }

        this.animation.draw(this.pos.x, this.pos.y + CHEST_ANIM_OFFSET.y);
        
        this.animation.animate();
        this.drawEntityId('chest'); // for debug
    },      
    itemEffects: function(targetEnt)
    {
        // targetEnt not used here
        gGameEngine.userCoins += this.coins;
        //gPhysicsEngine.removeBody(this.physBody); // this fails here for static objects, I moved it to gGameEngine.update(), when all killed entities are effectively destroyed (step 2)
        this._killed = true;

        // TO DO: add a visual for damage effect
    }
});

gGameEngine.factory['chest'] = ChestItemClass;