// [Sergio D. Jubera]
// Represents an animated character, either skeleton or human (the only
// differences by now are that skeletons will always be controlled by CPU
// (while humans may be controlled by user) and the sprites used, obviously.

var SOLDIER_NAME_OFFSET = 40; // y-offset to draw the name of the soldier
var LIFE_BAR_OFFSET = -25; // y-offset to draw the life bar
var LIFE_BAR_LENGTH = 50; // total length of the life bar
var LIFE_BAR_WIDTH = 5; // with of the life bar
var LIFE_BAR_CAP = "round"; // style of life bar ends
var LOW_HP = 0.2; // percentage of HP considered low
var MED_HP = 0.6; // percentage of HP considered medium
var SOLDIER_ANIM_OFFSET = {x: 0, y: -16}; // Needed for the pseudo-3D effect
var SOLDIER_SIZE = {w: 26, h: 30};
SoldierClass = EntityClass.extend({
    actions: ['stop', 'walk', 'attack'],
    directions: ['up', 'down', 'left', 'right'],
    maxHitPoints: 100.0, // could be differrent if we have diff. types of humans
    // and/or enemies
    hitPoints: 100.0, // when 0, it's dead
    damagePoints: 15, // damage the soldier does when attacking sb
    name: '', // it could be customized and displayed so that you can
    // have your custom army, and for skeletons it may be used for bosses, etc.
    drawName: true,
    speed: DEFAULT_WALKING_VELOCITY,
    inputInfo: null, //contains last input from keyboard and/or mouse
    // Here I'd add other features like shield, power attack, etc.

    soldierType: "skeleton",
    // The following attributes are used for animations
    currentState: {
        action: "stop",
        dir: "down"
    },
    animations: {}, // dictionary for all animations, "currentState" will be
    // used as key
    ai: null, // automaton controlling character's AI
    init: function(pos, size, soldierType, name, maxHitPoints, damage, faceAngle, speed) {
        this.parent(pos, size);
        this.soldierType = soldierType;
        if (name)
            this.name = name;
        if (maxHitPoints)
            this.maxHitPoints = maxHitPoints;
        this.hitPoints = this.maxHitPoints;
        if (damage)
            this.damagePoints = damage;
        if (faceAngle)
            this.currentState.dir = isNaN(faceAngle) ? faceAngle : faceAngleToString(faceAngle);
        if (speed)
            this.speed = speed;
        this.setUpPhysics('dynamic');
        this._setupAnimations();
        this._setupAI()
    },
    animate: function() {
        var currentFrame = this._currentAnim().currentFrame;
        this._currentAnim().animate();
        var nextFrame = this._currentAnim().currentFrame;
        // If it's attacking and the animation is over, return to still state
        if (this.currentState.action === 'attack' && nextFrame < currentFrame)
        {
            this._currentAnim().reset();
            this.currentState.action = 'stop';
        }
    },
    update: function() {
        if (this.health <= 0)
        {
            // this.isDead = true;
            this.physBody.SetActive(false);
        }
        this.animate();
    },
    applyInputs: function() {
        if (this.inputInfo)
        {
            // movement
            if (this.inputInfo.walking)
                this._move(this.inputInfo.move_dir);
            else
                this.stop();
            // look (quantized) at mouse
            if (this.currentState.action !== 'attack')  // Don't interrupt attack
                this.currentState.dir = faceAngleToString(this.inputInfo.faceAngle0to3);

            if (this.inputInfo.fire0)
                this._attack();

            //DO NOT FORGET to clear inputInfo!!!
            this.inputInfo = null;
        }
    },
    draw: function() {
        this.animations[this.currentState.action + "_" + this.currentState.dir].draw(this.pos.x, this.pos.y);
    },
    drawGui: function() {
        // 1. Life bar:
        // Draw full black line from right to left (100% HP), and then
        // draw color line from left to right (current %HP)
        if ((this.soldierType === 'human' && SHOW_LIFE_BAR_HUMANS) ||
                (this.soldierType === 'skeleton' && SHOW_LIFE_BAR_SKELETONS))
        {
            var minX = this.pos.x - (LIFE_BAR_LENGTH / 2);
            var maxX = this.pos.x + (LIFE_BAR_LENGTH / 2);
            var percentHP = Math.max(this.hitPoints, 0) / this.maxHitPoints;
            var Y = this.pos.y + LIFE_BAR_OFFSET + SOLDIER_ANIM_OFFSET.y;

            ctx.beginPath();
            ctx.moveTo(minX, Y);
            ctx.lineTo(maxX, Y);
            ctx.lineWidth = LIFE_BAR_WIDTH;
            ctx.lineCap = LIFE_BAR_CAP;
            ctx.strokeStyle = "#000000";
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(minX, Y);
            ctx.lineTo(minX + (maxX - minX) * percentHP, Y);
            ctx.strokeStyle = percentHP < LOW_HP ? "#ff0000" : percentHP < MED_HP ? "#FFA54F" : "#00ff00"; // the default
            ctx.stroke();
        }

        // 2. Soldier's name
        if (this.drawName && (
                (this.soldierType === 'human' && SHOW_NAME_HUMANS) ||
                (this.soldierType === 'skeleton' && SHOW_NAME_SKELETONS)))
        {
            ctx.font = "bold 10px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "center";
            ctx.fillStyle = "#000000";
            ctx.fillText(this.name, this.pos.x, this.pos.y + SOLDIER_NAME_OFFSET + SOLDIER_ANIM_OFFSET.y);
        }

        // 3. Debug info
        this.drawEntityId(this.soldierType);
    },
    // The following methods modify soldier state for animation purposes
    stop: function() {
        if (this.currentState.action !== 'attack')  // Don't interrupt attack
        {    // animation
            this.currentState.action = 'stop';
            this._resetAnimation();
        }
    },
    _move: function(move_dir) {
        if (this.currentState.action !== 'attack')  // Don't interrupt attack
        {   // animation
            this.currentState.action = 'walk';
            this.physBody.SetLinearVelocity(move_dir);
        }
    },
    _attack: function() {
        this.currentState.action = 'attack';
    },
    _resetAnimation: function() {
        this.animations[this.currentState.action + "_" + this.currentState.dir].reset();
    },
    _currentAnim: function() {
        return this.animations[this.currentState.action + "_" + this.currentState.dir];
    },
    _setupAnimations: function() {
        try
        {
            for (var a = 0; a < this.actions.length; a++)
            {
                for (var d = 0; d < this.directions.length; d++)
                {
                    var anim_name = this.actions[a] + "_" + this.directions[d];
                    var anim_obj = new AnimationClass(SOLDIER_ANIM_OFFSET);
                    //console.log("Loading animations for " + this.soldierType + "_" + anim_name);

                    var tens = 0;
                    var units = 0;
                    var frame = 0;
                    while (frame !== null)
                    {
                        frame = gSpriteSheets['animation'].getStats(this.soldierType + "_" + anim_name + tens + units + ".png");
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
                    this.animations[anim_name] = anim_obj;
                    //console.log("total frames: " + anim_obj.frames.length);
                }
            }
        }
        catch (e)
        {
            console.log(e.stack);
        }
    },
    // Function callback for collisions. For this game, point and impulse are
    // not necessary.
    onTouch: function(otherBody, point, impulse) {


        var otherEnt = otherBody.GetDefinition().userData.ent;
        if (!this._killed && !otherEnt._killed)
        {
            if (otherEnt instanceof SoldierClass)
            {
                // TO DO: add a physic body with .isSensor = true to the soldiers,
                // bigger than the physic body itself, to allow attacking enemies
                // without needing to touch them.

                // Check if it's an attack
                if (this.currentState.action === 'attack' &&
                        (OPTIONS_FRIENDLY_FIRE || otherEnt.soldierType != this.soldierType) &&
                        Math.ceil(this._currentAnim().currentFrame) === 0) // check it's the very beginning of the attack, so that damage is triggered just once
                {
                    // check if the attacker is facing the target, using the
                    // quantized angle technique again
                    var otherDir = new Vec2(otherEnt.pos.x - this.pos.x, otherEnt.pos.y - this.pos.y);
                    var otherAngle0to3 = quantizeAngle(otherDir, 4);
                    if (this.currentState.dir === faceAngleToString(otherAngle0to3))
                    {
                        console.log(this.physBody.GetDefinition().userData.id + " does " + this.damagePoints + " damage points to " + otherEnt.physBody.GetDefinition().userData.id);
                        if (otherEnt.receiveDamage)
                            otherEnt.receiveDamage(this.damagePoints);
                    }
                }
            }
            else if (this.soldierType === 'human' &&
                    (otherEnt instanceof HeartItemClass || otherEnt instanceof ChestItemClass))
            {
                console.log(this.physBody.GetDefinition().userData.id + " grabs item " + otherBody.GetDefinition().userData.id + ".");
                otherEnt.itemEffects(this);
            }
        }

        return true;
    },
    receiveDamage: function(dmgPoints) {
        this.hitPoints -= dmgPoints;
        if (this.hitPoints <= 0)
        {
            //gPhysicsEngine.removeBody(this.physBody); // moved it to gGameEngine.update(), when all killed entities are effectively destroyed (step 2)
            this._killed = true;
            var effectName = this.soldierType + '_die';
            gGameEngine.spawnEffect('instancedEffect', this.pos, effectName, false);
        }
        // else
        // TO DO: add a visual for damage effect
    },
    _setupAI: function() {
        this.ai = new (gAiEngine.factory[this.soldierType])(this);
        gAiEngine.registerRobot(this.ai);
    }
});

gGameEngine.factory['soldier'] = SoldierClass;