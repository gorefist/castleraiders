// [Sergio D. Jubera]
// This is based on the same file from Udacity course, 
// with some modifications which are commented properly, if any.
// NOTE: all measures in Box2D are expressed in MKS (Meters, Kilos, Seconds)
// so any coordinate and measure must be converted when communicating with the
// physics engine. Check out auxFunction.js file for aux conversion functions.

// These are global shorthands we declare for Box2D primitives
// we'll be using very frequently.
Vec2 = Box2D.Common.Math.b2Vec2;
BodyDef = Box2D.Dynamics.b2BodyDef;
Body = Box2D.Dynamics.b2Body;
FixtureDef = Box2D.Dynamics.b2FixtureDef;
Fixture = Box2D.Dynamics.b2Fixture;
World = Box2D.Dynamics.b2World;
MassData = Box2D.Collision.Shapes.b2MassData;
PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
CircleShape = Box2D.Collision.Shapes.b2CircleShape;
DebugDraw = Box2D.Dynamics.b2DebugDraw;
RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;
PhysicsEngineClass = Class.extend({
    world: null,
    //-----------------------------------------
    create: function() {
        gPhysicsEngine.world = new World(
                new Vec2(0, 0), // Gravity vector
                false           // Don't allow sleep
                );
    },
    //-----------------------------------------
    update: function() {
        var start = Date.now();
        gPhysicsEngine.world.Step(
                GAME_LOOP_HZ, //frame-rate
                PHYSICS_VELOCITY_ITERATIONS, //velocity iterations
                PHYSICS_POSITION_ITERATIONS  //position iterations
                );
        gPhysicsEngine.world.ClearForces();
        return(Date.now() - start);
    },
    //-----------------------------------------
    addContactListener: function(callbacks) {
        var listener = new Box2D.Dynamics.b2ContactListener();

        // [Sergio D. Jubera]
        // As every body can have more than 1 fixture (attack sensor, vision
        // sensor, physic body, etc.) I'll pass the contact fixtures rather
        // than the owner body, as I need to know exactly which fixtures
        // are in contact.
        if (callbacks.BeginContact)
            listener.BeginContact = function(contact) {
                callbacks.BeginContact(contact.GetFixtureA(), contact.GetFixtureB());
            }
        if (callbacks.EndContact)
            listener.EndContact = function(contact) {
                callbacks.EndContact(contact.GetFixtureA(), contact.GetFixtureB());
            }
        if (callbacks.PostSolve)
            listener.PostSolve = function(contact, impulse) {
                callbacks.PostSolve(contact.GetFixtureA(), contact.GetFixtureB(), impulse.normalImpulses[0]);
            };

        gPhysicsEngine.world.SetContactListener(listener);
    },
    //-----------------------------------------
    addBody: function(entityDef) {
        var bodyDef = new BodyDef();
        bodyDef.userData = entityDef.userData; // application specific body
        // data, here it's used to store the id (for debug and attack handling)
        // and the entity object which owns this specific body (for collision
        // handling)
        bodyDef.type = entityDef.bodyType === 'dynamic' ? Body.b2_dynamicBody : entityDef.bodyType === 'kinematic' ? Body.b2_kinematicBody : Body.b2_staticBody;
        bodyDef.position.x = toMeters(entityDef.x);
        bodyDef.position.y = toMeters(entityDef.y);
        //bodyDef.allowSleep = false;
        if (entityDef.damping)
            bodyDef.linearDamping = entityDef.damping;
        var body = gPhysicsEngine._registerBody(bodyDef);
        var fixtureDefinition = new FixtureDef();
        // [Sergio D. Jubera] Use the defaults.        
//      fixtureDefinition.density = 0.0;
//      fixtureDefinition.friction = 0.2;
//      fixtureDefinition.restitution = 0.0;
//        if (entityDef.useBouncyFixture) {
//            fixtureDefinition.density = 1.0;
//            fixtureDefinition.friction = 0;
//            fixtureDefinition.restitution = 1.0;
//        }

        // Now we define the shape of this object as a box
        fixtureDefinition.shape = new PolygonShape();
        fixtureDefinition.shape.SetAsBox(toMeters(entityDef.halfWidth), toMeters(entityDef.halfHeight));
        fixtureDefinition.userData = {name: 'physBody'};
        body.CreateFixture(fixtureDefinition);
        return body;
    },
    //-----------------------------------------
    removeBody: function(obj) {
        gPhysicsEngine.world.DestroyBody(obj);
        //console.log("body destroyed");
    },
    drawBodies: function() {
        if (DEBUG_SHOW_PHYSIC_BODIES)
        {
            ctx.save();

            var physBody = this.world.GetBodyList();
            while (physBody != null) {
                var fixture = physBody.GetFixtureList();

                while (fixture !== null) {

                    var physBounds = {
                        lowerBound: fixture.GetAABB().lowerBound,
                        upperBound: fixture.GetAABB().upperBound
                    };

                    // Draw physic body (for debug)
                    ctx.beginPath();
                    ctx.rect(
                            toPixels(physBounds.lowerBound.x),
                            toPixels(physBounds.lowerBound.y),
                            toPixels(physBounds.upperBound.x - physBounds.lowerBound.x),
                            toPixels(physBounds.upperBound.y - physBounds.lowerBound.y)
                            );
                    ctx.lineWidth = 2;
                    ctx.globalAlpha = 0.35;
                    if (fixture.IsSensor()) {
                        switch (fixture.GetUserData().name) {
                            case 'attackSensor':
                                ctx.fillStyle = 'purple';
                                ctx.strokeStyle = 'purple';
                                break;
                            case 'sightSensor':
                                ctx.fillStyle = 'blue';
                                ctx.strokeStyle = 'blue';
                                break;
                            default:
                                ctx.fillStyle = 'yellow';
                                ctx.strokeStyle = 'yellow';
                                break;
                        }
                    }
                    else {
                        ctx.fillStyle = 'red';
                        ctx.strokeStyle = 'red';
                    }
                    ctx.fill();
                    ctx.globalAlpha = 1;
                    ctx.stroke();
//                    // Draw physic body type (for debug)
//                    var textToDisplay = "type=" + (physBody.GetType() === Body.b2_staticBody ? 'static' : physBody.GetType() === Body.b2_dynamicBody ? 'dynamic' : 'unknown body type');
//                    //textToDisplay += ", linear damping=" + physBody.GetDefinition().linearDamping;
//
//                    //textToDisplay += ",density=" + fixture.GetDensity() + ",friction=" + fixture.GetFriction() + ",restitution=" + fixture.GetRestitution() + ",mass=" + fixture.GetMassData().mass;
//                    textToDisplay += ",allowSleep=" + physBody.GetDefinition().allowSleep;
//                    font = " bold 10px sans-serif";
//                    ctx.textAlign = "left";
//                    ctx.textBaseline = "middle";
//                    ctx.fillStyle = "#ff0000";
//                    ctx.fillText(
//                            textToDisplay,
//                            toPixels(physBounds.upperBound.x),
//                            toPixels(physBounds.upperBound.y));

                    fixture = fixture.GetNext();
                }
                physBody = physBody.GetNext();
            }
            ctx.restore();
        }
    },
    //-----------------------------------------
    _registerBody: function(bodyDef) {
        var body = gPhysicsEngine.world.CreateBody(bodyDef);
        return body;
    }
});
var gPhysicsEngine = new PhysicsEngineClass();