// [Sergio D. Jubera]
// As suggested in the Udacity course, represents an animated effect (just
// visuals, no physics needed). E.g.: grab a heart, soldier dying, etc.
// Once animation finishes it may be removed from game (item) or not (dead
// soldier).

InstancedEffectClass = EntityClass.extend({
    _animation: null,
    _removeWhenFinished: true,
    _finished: false,
    init: function(pos, effectName, remove)
    {
        this.parent(pos);
        if (remove)
            this.removeWhenFinished = remove;

        // Set up animation frames
        try
        {
            var anim_obj = new AnimationClass();

            var tens = 0;
            var units = 0;
            var frame = 0;

            while (frame !== null)
            {
                frame = gSpriteSheets['animation'].getStats(effectName + tens + units + ".png");
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

            anim_obj.speed = DEATH_ANIM_SPEED;
            anim_obj.loop = false;
            this.animation = anim_obj;
        }
        catch (e)
        {
            console.log(e.stack);
        }
    },
    draw: function()
    {
        this.animation.draw(this.pos.x, this.pos.y);

        // Animate if it hasn't finished yet
        if (!this._finished)
        {
            var currentFrame = this.animation.currentFrame;
            this.animation.animate();

            var nextFrame = this.animation.currentFrame;

            if (nextFrame < currentFrame)
                _finished = true;
        }
        else if (this.removeWhenFinished)
        {
            // TO DO: Remove from gGameEngine.entities
        }

    },
});

gGameEngine.factory['instancedEffect'] = InstancedEffectClass;
