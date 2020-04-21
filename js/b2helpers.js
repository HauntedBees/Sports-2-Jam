const toRadians = 180 / Math.PI;
const angleToRadians = Math.PI / 180;
const PIXELS_TO_METERS = 30.0;
const p2m = pixels => pixels / PIXELS_TO_METERS;
const m2p = meters => meters * PIXELS_TO_METERS;
const vecp2m = pixelpoint => ({ x: p2m(pixelpoint.x), y: p2m(pixelpoint.y) });
const vecm2p = meterpoint => ({ x: m2p(meterpoint.x), y: m2p(meterpoint.y) });
const dist = (a, b) => {
    const dx = b.x - a.x, dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
};
const b2Vec2 = Box2D.Common.Math.b2Vec2,
	b2BodyDef = Box2D.Dynamics.b2BodyDef,
	b2Body = Box2D.Dynamics.b2Body,
	b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
	b2World = Box2D.Dynamics.b2World,
	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
	b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
	b2ContactListener = Box2D.Dynamics.b2ContactListener;

function b2Helpers(world) {    
    this.world = world;
    this.GetStar = function(x, y, power, displayPower) {
        const gravityPower = power;
        const gravityRange = 2;
        return this.GetCircle(x, y, 10, false, {
            gravityPower: gravityPower,
            radius: 10,
            gravityRange: gravityRange,
            powerIdx: displayPower,
            identity: "star"
        }, false);
    };
    this.GetBaseball = function(position, velocity, runner) {
        const ball = this.GetCircle(position.x, position.y, 7, true, {
            generateParticles: true, stopped: false,
            runner: runner, identity: "baseball"
        }, false);
        if(runner !== undefined) { runner.SetBall(ball); }
        ball.SetLinearVelocity(velocity);
        ball.beeForces = [];
        return ball;
    };

    this.GetPlayerCollider = function(x, y, radius, player, playerType) {
        x = p2m(x); y = p2m(y);
        radius = p2m(radius);
        const userData = {
            player: player,
            identity: playerType
        };
        const fixDef = new b2FixtureDef;
        fixDef.density = 1.0;
        fixDef.friction = 1.0;
        fixDef.restitution = 0.1;
        fixDef.shape = new b2CircleShape(radius);
        fixDef.isSensor = true;
        fixDef.userData = userData;
        
        const bodyDef = new b2BodyDef();
        bodyDef.type = b2Body.b2_dynamicBody;
        bodyDef.position.x = x;
        bodyDef.position.y = y;
        bodyDef.userData = userData;
    
        const circle = this.world.CreateBody(bodyDef);
        circle.CreateFixture(fixDef);
        return circle;
    };
    this.GetCircle = function(x, y, radius, isDynamic, userData, isSensor) {
        x = p2m(x); y = p2m(y);
        radius = p2m(radius);
        const fixDef = new b2FixtureDef;
        fixDef.density = 1.0;
        fixDef.friction = 1.0;
        fixDef.restitution = 0.6;
        fixDef.shape = new b2CircleShape(radius);
        fixDef.isSensor = isSensor || false;
        if(userData !== undefined) { fixDef.userData = userData; }
        
        const bodyDef = new b2BodyDef();
        bodyDef.type = isDynamic ? b2Body.b2_dynamicBody : b2Body.b2_staticBody;
        bodyDef.position.x = x;
        bodyDef.position.y = y;
        if(userData !== undefined) { bodyDef.userData = userData; }
    
        const circle = this.world.CreateBody(bodyDef);
        circle.CreateFixture(fixDef);
        return circle;
    };
    this.GetBarrier = function(x, y, w, h) {
        return this.GetBox(x, y, w, h, 1, 1, 0.5, false, false, "barrier");
    };
    this.GetBox = function(x, y, w, h, density, friction, restitution, isDynamic, isSensor, identity) {
        x = p2m(x); y = p2m(y);
        w = p2m(w); h = p2m(h);
        const fixDef = new b2FixtureDef();
        fixDef.density = density;
        fixDef.friction = friction;
        fixDef.restitution = restitution;
        fixDef.shape = new b2PolygonShape();
        fixDef.shape.SetAsBox(w, h);
        fixDef.isSensor = isSensor;
        fixDef.userData = { identity: identity };
        
        const bodyDef = new b2BodyDef();
        bodyDef.type = isDynamic ? b2Body.b2_dynamicBody : b2Body.b2_staticBody;
        bodyDef.position.x = x;
        bodyDef.position.y = y;
        bodyDef.userData = { identity: identity };
        
        const box = this.world.CreateBody(bodyDef);
        box.CreateFixture(fixDef);
        return box;
    };
}