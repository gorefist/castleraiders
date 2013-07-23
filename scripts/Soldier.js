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
var SOLDIER_SIZE = {w: 26, h: 26};  // size of the physic body

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
    entitiesInAttackRange: [], // if this ent attacks, will potentially inflict
    // damage to the entities in this array.
    enemiesInSightRange: [], // enemies detected visually, this will be used by
    // the AI engine.
    // The following attributes are used for animations
    currentState: {
        action: "stop",
        dir: "down"
    },
    animations: {}, // dictionary for all animations, "currentState" will be
    // used as key
    ai: null, // automaton controlling character's AI
    init: function(pos, size, soldierType, name, maxHitPoints, damage, faceAngle, speed, attackRange, sightRange) {
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

        this.setUpPhysics('dynamic', attackRange, sightRange);
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
            var minX = this.pos.x - (LIFE_BAR_LENGTH * 0.5);
            var maxX = this.pos.x + (LIFE_BAR_LENGTH * 0.5);
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

        // Check it's the very beginning of the attack, so that damage is
        // triggered just once. If that's the case, inflict damage to all
        // entities in attack range and face angle:
        if (Math.ceil(this._currentAnim().currentFrame) === 0) {
            //console.log(this.physBody.GetUserData().id + " attacks.");

            for (var i = 0; i < this.entitiesInAttackRange.length; i++) {
                var ent = this.entitiesInAttackRange[i];
                // check if the attacker is facing the target, using the
                // quantized angle technique again
                var entDir = new Vec2(ent.pos.x - this.pos.x, ent.pos.y - this.pos.y);
                var angle0to3 = quantizeAngle(entDir, 4);
                if (this.currentState.dir === faceAngleToString(angle0to3))
                {
                    if (ent.receiveDamage) {
                        ent.receiveDamage(this.damagePoints);
                        console.log(this.physBody.GetUserData().id + " does " + this.damagePoints + " damage points to " + ent.physBody.GetUserData().id);
                    }
                }
            }
        }
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
    // Function callback for contacts/collisions.
    onTouch: function(thisFixture, otherFixture) {
        var otherEnt = otherFixture.GetBody().GetUserData().ent;
        if (otherEnt && !this._killed && !otherEnt._killed)
        {
            // CASE 1: human (body) grabs item (sensor)
            if (this.soldierType === 'human' &&
                    thisFixture.GetUserData().name === 'physBody' &&
                    (otherEnt instanceof HeartItemClass || otherEnt instanceof ChestItemClass))
            {
                //console.log(this.physBody.GetDefinition().userData.id + " grabs item " + otherFixture.GetBody().GetUserData().id + ".");
                if (otherEnt.itemEffects)
                    otherEnt.itemEffects(this);
            }

            // CASE 2: soldier (sensor) detects another soldier (body) in attack or sight range
            else if (otherEnt instanceof SoldierClass && otherFixture.GetUserData().name === 'physBody') {

                // CASE 2.1: soldier entered attack area
                if (thisFixture.GetUserData().name === 'attackSensor' &&
                        (OPTIONS_FRIENDLY_FIRE || otherEnt.soldierType !== this.soldierType))
                {
                    //console.log(this.physBody.GetUserData().id + " gets " + otherEnt.physBody.GetUserData().id + " in attack range.");
                    this.entitiesInAttackRange.push(otherEnt);
                }

                // CASE 2.2: enemy entered sight area
                else if (thisFixture.GetUserData().name === 'sightSensor' &&
                        otherEnt.soldierType !== this.soldierType) {
                    //console.log(this.physBody.GetUserData().id + " gets " + otherEnt.physBody.GetUserData().id + " in sight range.");
                    this.enemiesInSightRange.push(otherEnt);
                }
            }
        }

        return true;
    },
    onFinishTouch: function(thisFixture, otherFixture) {
        var otherEnt = otherFixture.GetBody().GetUserData().ent;
        
        if (otherEnt instanceof SoldierClass && otherFixture.GetUserData().name === 'physBody') {
            if (thisFixture.GetUserData().name === 'attackSensor' &&
                    (OPTIONS_FRIENDLY_FIRE || otherEnt.soldierType !== this.soldierType)) {
                //console.log(this.physBody.GetUserData().id + " no longer has " + otherEnt.physBody.GetUserData().id + " in attack range.");
                this.entitiesInAttackRange.erase(otherEnt);
            }
            else if (thisFixture.GetUserData().name === 'sightSensor' &&
                    otherEnt.soldierType !== this.soldierType) {
                //console.log(this.physBody.GetUserData().id + " no longer has " + otherEnt.physBody.GetUserData().id + " in sight range.");
                this.enemiesInSightRange.erase(otherEnt);
            }
        }
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
    // In addition to the physic body for collisions, here I'll add some sensors
    // which will come in handy for sight and attack range handling.
    setUpPhysics: function(bodyType, attackRange, sightRange) {
        this.parent(bodyType);

        var attackSensor = new FixtureDef();
        attackSensor.isSensor = true;
        attackSensor.shape = new PolygonShape();
        attackSensor.shape.SetAsBox(toMeters(attackRange), toMeters(attackRange));
        attackSensor.userData = {name: 'attackSensor'};
        this.physBody.CreateFixture(attackSensor);

        var sightSensor = new FixtureDef();
        sightSensor.isSensor = true;
        sightSensor.shape = new PolygonShape();
        sightSensor.shape.SetAsBox(toMeters(sightRange), toMeters(sightRange));
        sightSensor.userData = {name: 'sightSensor'};
        this.physBody.CreateFixture(sightSensor);
    },
    _setupAI: function() {
        this.ai = new (gAiEngine.factory[this.soldierType])(this);
        gAiEngine.registerRobot(this.ai);
    }
});

gGameEngine.factory['soldier'] = SoldierClass;