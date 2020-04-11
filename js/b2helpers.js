const toRadians = 180 / Math.PI;
function b2Helpers(world) {    
    this.world = world;
    this.GetStar = function(x, y, power) {
        const gravityPower = power; //this.RandomForce();
        const gravityRange = 0.5; //this.RandomRange() / 40;
        return this.GetCircle(x, y, 10, false, {
            gravityPower: gravityPower,
            radius: 10,
            gravityRange: gravityRange,
            powerIdx: Math.floor(5 * (gravityPower / 20)),
            identity: "star"
        });
    };
    this.GetBaseball = function(position, velocity, runner) {
        const ball = this.GetCircle(position.x, position.y, 7, true, {
            //doMoveBox: false, movingBox: this.GetBox(position.x, position.y, 0.6, 0.6, false, true), 
            //doParticleBox: false, particleBox: this.GetBox(position.x, position.y, 0.6, 0.6, false, true), 
            //boxTimer: 0, particleTimer: 0,
            generateParticles: true, stopped: false, runner: runner,
            identity: "baseball"
        }, true);
        if(runner !== undefined) { runner.SetBall(ball); }
        ball.SetLinearVelocity(velocity);
        ball.beeForces = [];
        return ball;
    };

    this.RandomForce = () => (Math.ceil(20 * Math.random()));     // [1, 20]
    this.RandomRange = () => (5 + Math.ceil(20 * Math.random())); // [5, 25]
    this.GetPlayerCollider = function(x, y, radius, player, playerType) {
        x = p2b(x); y = p2b(y);
        radius = p2b(radius);
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
        x = p2b(x); y = p2b(y);
        radius = p2b(radius);
        const fixDef = new b2FixtureDef;
        fixDef.density = 1.0;
        fixDef.friction = 1.0;
        fixDef.restitution = 0.1;
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
    this.GetBox = function(x, y, w, h, isDynamic, isSensor) {
        x = p2b(x); y = p2b(y);
        const fixDef = new b2FixtureDef();
        fixDef.density = 1.0;
        fixDef.friction = 1.0;
        fixDef.restitution = 0.1;
        fixDef.shape = new b2PolygonShape();
        fixDef.shape.SetAsBox(w, h);
        fixDef.isSensor = isSensor;
        
        const bodyDef = new b2BodyDef();
        bodyDef.type = isDynamic ? b2Body.b2_dynamicBody : b2Body.b2_staticBody;
        bodyDef.position.x = x;
        bodyDef.position.y = y;
        
        const box = this.world.CreateBody(bodyDef);
        box.CreateFixture(fixDef);
        return box;
    };
}
/*

        this.linkedBalls.forEach(link => {
            const link = this.linkedBalls[i];
            const ball1Pos = link.ball1.GetWorldCenter();
            const ball2Pos = link.ball2.GetWorldCenter();
            const ballDiff = new b2Vec2(0, 0);
            ballDiff.Add(ball2Pos);
            ballDiff.Subtract(ball1Pos);
            const length = ballDiff.Length();
            if(length > link.maxDistance) {
                const deltaL = length - link.maxDistance;
                let newForce = new b2Vec2(Math.SQRT1_2, Math.SQRT1_2);
                if(length > 0) {
                    newForce = ballDiff;
                    newForce.Multiply(1 / length);
                }
                const force = deltaL * 0.9;
                link.ball1.ApplyForce(new b2Vec2(newForce.x * force, newForce.y * force), ball1Pos);
                link.ball2.ApplyForce(new b2Vec2(-newForce.x * force, -newForce.y * force), ball2Pos);
            }
        });
        */