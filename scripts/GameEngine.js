// [Sergio D. Jubera]
// This is based on the same file from Udacity course, 
// with some modifications which are commented properly, if any.

// TO DO: read debug settings from file/game options rather than hardcoding them
// Constants for debug
var DEBUG_SHOW_FPS = true;
var DEBUG_SHOW_PHYSIC_BODIES = true;
var DEBUG_SHOW_ENTITIES = true; // draws entity array and their ids
var DEBUG_SHOW_MAP_BOUNDS = true;

// Constants for physics
var PHYSICS_LOOP_HZ = 1.0 / 60.0;     // 60 Hz = 60 updates per second
var PHYSICS_VELOCITY_ITERATIONS = 10; // # of iterations for velocity adjustment
var PHYSICS_POSITION_ITERATIONS = 10; // # of iterations for overlap resolution

// NOTE: the term 'velocity' is used in box2d and throughout the current project
// when referring to physic velocity or speed (in m/s). Besides, the term
// 'speed' is used when referring to game/phycics/current-sprite update
// frequency.

// Constants for animations: they express how quickly the current frame/sprite
// is updated. More specifically, # of sprites advanced every game update.
var DEFAULT_ANIM_SPEED = 0.5;   // for humans & skeletons walking & attacking
var DEATH_ANIM_SPEED = 0.25;    // for humans & skeletons dying
var CHEST_ANIM_SPEED = 0.25;    // for treasure chest items
var HEART_ANIM_SPEED = 0.3;     // for heart items

// Constants for current soldier cursor

var CURSOR_ALPHA = 0.75; // opacity of the cursor
var CURSOR_RADIUS = 15; // horizontal radius of the elipse
var CURSOR_OFFSET = 27.5; // y-offset of the cursor

// Constants for soldiers drawing

var SHOW_NAME_HUMANS = true;
var SHOW_NAME_SKELETONS = true;
var SHOW_LIFE_BAR_HUMANS = true;
var SHOW_LIFE_BAR_SKELETONS = true;
var SHOW_VALUE_ITEMS = true;

// Other constants for game entities
var DEFAULT_WALKING_VELOCITY = 100; // in m/s

// Constants for map data loading
var MAP_ASSETS_SUBFOLDER = 'graphics';  // Subfolder from root (folder with index.html)
// where the map image files are located

// Game options
var OPTIONS_FRIENDLY_FIRE = false;

GameEngineClass = Class.extend({
    _currentSoldierIdx: null, // [Sergio D. Jubera] This will point at the 
    // character currently controlled by the user.
    entities: [],
    factory: {},
    _deferredKill: [],
    lastUpdate: null,
    gLastEntityGuid: 0,
    userCoins: 0,
    //-----------------------------
    init: function() {
        this.lastUpdate = new Date();
    },
    loadAssets: function() {
        xhrGet("./graphics/animation_sprites.json",
                function(data) {
                    var sheet = new SpriteSheetClass();
                    gSpriteSheets['animation'] = sheet;
                    sheet.load("graphics/animation_sprites.png");
                    sheet.parseAtlasDefinition(data.response);
                    gAnimationsLoaded = true;
                }, null);

        // TO DO: unhardcode this so that level map depends on game progress or
        // settings file or game options
        var sheet = new SpriteSheetClass();
        gSpriteSheets['map'] = sheet;
        sheet.load("graphics/level1.png");
        gMap.load("graphics/level1.json");
    },
    //-----------------------------
    setup: function() {

// Create physics engine
        gPhysicsEngine.create();
        // Set up entities collision response structure
        gPhysicsEngine.addContactListener({
            PostSolve: function(bodyA, bodyB, impulse) {
                var uA = bodyA ? bodyA.GetUserData() : null;
                var uB = bodyB ? bodyB.GetUserData() : null;
                if (uA !== null) {
                    if (uA.ent !== null && uA.ent.onTouch)
                        uA.ent.onTouch(bodyB, null, impulse);
                }

                if (uB !== null) {
                    if (uB.ent !== null && uB.ent.onTouch)
                        uB.ent.onTouch(bodyA, null, impulse);
                }
            }
        });
        // TO DO: read map settings file (.json) to know what objects to create,
        // rather than hardcoding it:

        // Enemies (skeletons)
        gGameEngine.spawnSoldier('soldier', {x: 100, y: 100}, {w: 26, h: 30}, 'skeleton', 'Skeleton A');
        gGameEngine.spawnSoldier('soldier', {x: 500, y: 500}, {w: 26, h: 30}, 'skeleton', 'Skeleton B');

        // User's army (humans)
        gGameEngine.spawnSoldier('soldier', {x: 600, y: 400}, {w: 26, h: 30}, 'human', 'Sergio');
        gGameEngine.spawnSoldier('soldier', {x: 100, y: 500}, {w: 26, h: 30}, 'skeleton', 'Skeleton C');
        gGameEngine.spawnSoldier('soldier', {x: 500, y: 100}, {w: 26, h: 30}, 'human', 'John Doe');

        // Collectibles (hearts & chests)
        gGameEngine.spawnItem('heart', {x: 200, y: 200}, 30);
        gGameEngine.spawnItem('chest', {x: 300, y: 300}, 230);
        gGameEngine.spawnItem('chest', {x: 400, y: 400}, 600);
        // Set user control to first human
        gGameEngine._currentSoldierIdx = 0;
        gGameEngine.nextSoldier();
    },
    // [Sergio D. Jubera]
    // I needed different params for soldiers (skeletons/humans) than for items
    // (hearts/chests) so I splitted 'spawnEntity' into the followings:
    spawnSoldier: function(typename, pos, size, soldierType, name, maxHitPoints) {
        var ent = new (gGameEngine.factory[typename])(pos, size, soldierType, name, maxHitPoints);
        gGameEngine.entities.push(ent);
        return ent;
    },
    spawnItem: function(typename, pos, value) {
        var ent = new (gGameEngine.factory[typename])(pos, value);
        gGameEngine.entities.push(ent);
        return ent;
    },
    spawnEffect: function(typename, pos, effectName, remove) {
        var ent = new (gGameEngine.factory[typename])(pos, effectName, remove);
        gGameEngine.entities.push(ent);
        return ent;
    },
    run: function() {
        gGameEngine.update(); //[Sergio D. Jubera] Update game
        gGameEngine.updatePhysics(); // [Sergio D. Jubera] Update physics
        gGameEngine.draw(); // [Sergio D. Jubera] Draw the scene

        gGameEngine.lastUpdate = (new Date());
    },
    update: function() {
        // 1. Update living entities 

        // Loop through the entities and call that entity's
        // 'update' method, but only do it if that entity's
        // '_killed' flag is set to true.
        //
        // Otherwise, push that entity onto the '_deferredKill'
        // list defined above.

        for (var i = 0; i < gGameEngine.entities.length; i++) {
            var ent = gGameEngine.entities[i];
            if (!ent._killed)
                ent.update();
            else {
                gGameEngine._deferredKill.push(ent);
                if (i <= gGameEngine._currentSoldierIdx)
                    // The index of the currentSoldier is gonna decrease,
                    // I need to update it.
                    gGameEngine._currentSoldierIdx = gGameEngine._currentSoldierIdx - 1 < 0 ? gGameEngine.entities.length - 1 : gGameEngine._currentSoldierIdx - 1;
            }
        }

        // 2. Update killed entities 

        // Loop through the '_deferredKill' list and remove each
        // entity in it from the 'entities' list.
        //
        // Once you're done looping through '_deferredKill', set
        // it back to the empty array, indicating all entities
        // in it have been removed from the 'entities' list.
        for (var j = 0; j < gGameEngine._deferredKill.length; j++) {
            gGameEngine.entities.erase(gGameEngine._deferredKill[j]);
            gPhysicsEngine.removeBody(gGameEngine._deferredKill[j].physBody);
        }

        gGameEngine._deferredKill = [];
        // [Sergio D. Jubera]
        // The following is based on the GRITS code

        // 3. Apply Inputs
        // TO DO: move this to update any soldier

        for (var i = 0; i < gGameEngine.entities.length; i++) {
            var ent = gGameEngine.entities[i];
            if (ent instanceof SoldierClass)
                ent.applyInputs();
        }

        // 4. Read inputs:
        // - for user they'll come from gInputEngine
        // - for the rest of the soldiers (humans & skeletons) will come from AI
        // This has to be after apply inputs, so that we can update the physics
        // engine between them (different calls)

        // Change focus to next soldier
        if (gInputEngine.actions['next_soldier'])
        {
            gGameEngine.nextSoldier();
            gInputEngine.actions['next_soldier'] = false; //to avoid passing
            // too fast if user doesn't release the key or does it too late
        }

        var inputInfo = {
            move_dir: new Vec2(0, 0),
            faceAngle0to3: 0, // Limited to 4 directions
            walking: false,
            fire0: false,
            //fire1: false,
            //fire2: false
        };
        // Movement (keyboard)
        var move_dir = new Vec2(0, 0);
        if (gInputEngine.actions['walk_up'])
            move_dir.y -= 1;
        if (gInputEngine.actions['walk_down'])
            move_dir.y += 1;
        if (gInputEngine.actions['walk_left'])
            move_dir.x -= 1;
        if (gInputEngine.actions['walk_right'])
            move_dir.x += 1;
        if (move_dir.LengthSquared())
        {
            move_dir.Normalize();
            move_dir.Multiply(gGameEngine.currentSoldier().speed);
            
            inputInfo.walking = true;
            inputInfo.move_dir = move_dir;
        }
//        else  // not really needed, it's the default
//            inputInfo.walking = false;

        // Looking direction (based on mouse position):
        // this is based on lesson "Input", chapter "Quantize" of the Udacity
        // course, but I'm using just 4 directions: up, down, left & right
        // (the graphics I'm using include those 4 variations for the
        // characters, only.
        var look_dir = new Vec2(gInputEngine.mouse.x - gGameEngine.currentSoldier().pos.x, gInputEngine.mouse.y - gGameEngine.currentSoldier().pos.y);
        inputInfo.faceAngle0to3 = quantizeAngle(look_dir, 4);
        // Attack
        if (gInputEngine.actions['attack'])
        {
            inputInfo.fire0 = true;
            gInputEngine.actions['attack'] = false;
        }

        if (gGameEngine.currentSoldier())
            gGameEngine.currentSoldier().inputInfo = inputInfo;
    },
    updatePhysics: function() {
        // [Sergio D. Jubera]
        // 1. Update physics engine
        gPhysicsEngine.update();
        // 2. Check it and update back all game entities, accordingly
        // foreach (e in gGameEngine.entities)
        // { e.pos.x = e.PhysBody.pos.x; e.pos.y = e.PhysBody.pos.y; }
        for (var i = 0; i < gGameEngine.entities.length; i++) {
            var ent = gGameEngine.entities[i];
            if (ent.physBody)
            {
                var newPos = ent.physBody.GetPosition();
                //console.log(ent.name + " (" + (ent.pos.x - newPos.x) + "," + (ent.pos.y - newPos.y) + ")");

                ent.pos.x = newPos.x;
                ent.pos.y = newPos.y;

                ent.physBody.SetLinearVelocity(new Vec2(0, 0));
            }
        }
    },
    // [Sergio D. Jubera]
    // Draws the entire scene
    draw: function()
    {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = window.innerWidth - 20;
        canvas.height = window.innerHeight - 20;
        ctx.save();
        //Translate coord. systems, based on current view position
        var trV = gGameEngine.calculateViewPointTranslation();
        ctx.translate(trV.x, trV.y);
        
        // Draw the map
        gMap.draw(ctx);
        gGameEngine._drawWorldBounds(); // for debug

        // Draw cursor for current soldier
        gGameEngine._drawPointer();
        // Draw entities ordered by pos.y, to make the pseudo-3D effect
        var orderedEntities = gGameEngine.entities.slice(); //shallow copy
        orderedEntities.sort(compareVerticalPosition);
        for (var i = 0; i < orderedEntities.length; i++)
            orderedEntities[i].draw();
        ctx.restore();
        gGameEngine._drawDebugInfo();
    },
    // [Sergio D. Jubera]
    // Used to change user's control to next soldier
    nextSoldier: function()
    {
        var newIdx = -1;
        var i = (gGameEngine._currentSoldierIdx + 1) % gGameEngine.entities.length;
        while (newIdx < 0)
        {
            //TO DO: change to: soldierType === "human"
            if (gGameEngine.entities[i].soldierType && (gGameEngine.entities[i].soldierType === "human"))
                //|| gGameEngine.entities[i].soldierType === "skeleton"))
                newIdx = i;
            else
                i = (i + 1) % gGameEngine.entities.length;
        }
        gGameEngine._currentSoldierIdx = newIdx;
        //console.log("Next soldier!");
    },
    // [Sergio D. Jubera]
    // Returns the soldier currently under control of the user
    currentSoldier: function()
    {
        return gGameEngine.entities[gGameEngine._currentSoldierIdx];
    },
    // [Sergio D. Jubera]
    // Calculates the translation vector (from currentSoldier to default view 
    // point) and applies it to canvas context to center the view/scene in
    // current soldier (under user's control).
    calculateViewPointTranslation: function()
    {
        var translation = new Vec2(
                canvas.width / 2 - gGameEngine.currentSoldier().pos.x,
                canvas.height / 2 - gGameEngine.currentSoldier().pos.y);
        //Make sure it doesn't go beyond map bounds
        if (gGameEngine.currentSoldier().pos.x < (canvas.width / 2))
            translation.x = 0;
        else if (gGameEngine.currentSoldier().pos.x > (gMap.width() - canvas.width / 2))
            translation.x = canvas.width / 2 - (gMap.width() - canvas.width / 2);
        if (gGameEngine.currentSoldier().pos.y < (canvas.height / 2))
            translation.y = 0;
        else if (gGameEngine.currentSoldier().pos.y > (gMap.height() - canvas.height / 2))
            translation.y = canvas.height / 2 - (gMap.height() - canvas.height / 2);
        return translation;
    },
    _drawPointer: function()
    {
        ctx.save();
        ctx.globalAlpha = CURSOR_ALPHA;
        drawOval(ctx, gGameEngine.currentSoldier().pos.x, gGameEngine.currentSoldier().pos.y + CURSOR_OFFSET + SOLDIER_ANIM_OFFSET.y, 2, 1, CURSOR_RADIUS);
        ctx.restore();
    },
    // Debug functions

    _drawDebugInfo: function()
    {
        if (DEBUG_SHOW_FPS)
        {
            // Show FPS (FPS = 1 / timeElapsed(s))
            var timeElapsed = ((new Date()).getTime() - gGameEngine.lastUpdate.getTime()) / 1000;
            ctx.font = "15px sans-serif";
            ctx.textAlign = "right";
            ctx.textBaseline = "top";
            ctx.fillStyle = "#00ff00";
            ctx.fillText(Math.round(1 / timeElapsed) + " FPS", canvas.width, 0);
        }

        if (DEBUG_SHOW_ENTITIES)
        {
            var text2disp = "";
            for (var i = 0; i < gGameEngine.entities.length; i++)
            {
                var ent = gGameEngine.entities[i];
                if (ent && ent !== null) {
                    if (ent instanceof SoldierClass)
                        text2disp += ent.physBody.GetDefinition().userData.id + "_" + ent.soldierType + ", ";
                    else if (ent instanceof HeartItemClass)
                        text2disp += ent.physBody.GetDefinition().userData.id + "_heart, ";
                    else if (ent instanceof ChestItemClass)
                        text2disp += ent.physBody.GetDefinition().userData.id + "_chest, ";
                }
            }

            text2disp = text2disp.length > 1 ? text2disp.substring(0, text2disp.length - 2) : "";
            ctx.font = "bold 10px sans-serif";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillStyle = "white";
            ctx.fillText("Entities: [" + text2disp + "]", 0, 0);
        }
//ctx.fillText("bodyCount: " + gPhysicsEngine.world.GetBodyCount(), 10, 10);

//    ctx.fillText("Mouse: (" + gInputEngine.mouse.x + "," + gInputEngine.mouse.y + ")", 10, 10);
//    ctx.fillText("Player: (" + gGameEngine.currentSoldier().pos.x + "," + gGameEngine.currentSoldier().pos.y + ")", 10, 20);
//    ctx.fillText("Transl: (" + gGameEngine.translateViewPoint().x + "," + gGameEngine.translateViewPoint().y + ")", 10, 30);
//    ctx.fillText("Map bounds: (" + gMap.width() + "," + gMap.height() + ")", 10, 40);
//    ctx.fillText("Canvas bounds: (" + canvas.width + "," + canvas.height + ")", 10, 50);
    },
    _drawWorldBounds: function()
    {
        if (DEBUG_SHOW_MAP_BOUNDS)
        {
            ctx.beginPath();
            ctx.lineWidth = 10;
            ctx.strokeStyle = 'lime';
            ctx.rect(0, 0, gMap.width(), gMap.height());
            ctx.stroke();
        }
    }
});

var gGameEngine = new GameEngineClass();