// [Sergio D. Jubera]
// Represents a subset of sprites from a sprite sheet, representing a full
// animation (e.g.: walking_up).

// I needed to add the optional 'offset' param, since the sprites and map
// elements are displayed not 100% horizontally (angry birds style) nor 100%
// vertically (GRITS style) but in between. This will also allow overlapping of
// entities and will make it necessary to draw them from the top to the bottom.

AnimationClass = Class.extend({
    frames: [], // list of ordered sprites that compound the animation
    currentFrame: 0.0,
    loop: true,
    speed: DEFAULT_ANIM_SPEED, //allows different animations to flow at different pace
    offset: { x: 0, y: 0 },
    init: function(animOffset)
    {
        if (animOffset)
            this.offset = animOffset;
    },
    addFrame: function(frame) {
        this.frames.push(frame);
    },
    draw: function(x, y)
    {
        var frame = this.frames[Math.floor(this.currentFrame)];

        drawSprite(frame.id, x + this.offset.x, y + this.offset.y);
    },
    animate: function()
    {
        if (this.frames.length > 1)
        {
            if (this.loop)
                this.currentFrame = (this.currentFrame + this.speed) % this.frames.length;

            else
                this.currentFrame = Math.min(this.currentFrame + this.speed, this.frames.length - 1);
        }
    },
    reset: function()
    {
        currentFrame: 0.0;
    }
});