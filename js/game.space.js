BaseStar.SpaceFly = {
    world: null, canvas: null, helper: null, hundredTimer: 0, 
    stars: [], balls: [], linkedBalls: [], 
    particles: [], slamdunks: [], 
    p1IsRunner: false, isP2Player: false, runHandler: null, fieldHandler: null, 
    runner: null, fielders: [], 
    debug: false, 
    Init: function(p1Handler, p2Handler, isP2Player, ballDetails, constellation) {
        this.p1IsRunner = p1Handler === BaseStar.Running;
        this.runHandler = this.p1IsRunner ? p1Handler : p2Handler;
        this.fieldHandler = !this.p1IsRunner ? p1Handler : p2Handler;
        this.isP2Player = isP2Player;
        this.world = new b2World(new b2Vec2(0, 0), true);
        this.helper = new b2Helpers(this.world);
        this.InitDebug();
        this.balls = [];
        this.linkedBalls = [];
        this.particles = [];
        this.slamdunks = [];
        this.state = 0;
        this.GetStarsAndPlayersFromConstellation(constellation);
        this.SwingBat(ballDetails);
        const l = new Box2D.Dynamics.b2ContactListener();
        l.BeginContact = this.StartCollision;
        l.EndContact = this.ExitCollision;
        this.world.SetContactListener(l);
        if(this.p1IsRunner) {
            this.runHandler.Init(controls, true, this.runner, this.balls);
            this.fieldHandler.Init(this.isP2Player ? controls2 : {}, this.isP2Player, this.fielders);
        } else {
            this.fieldHandler.Init(controls, true, this.fielders);
            this.runHandler.Init(this.isP2Player ? controls2 : {}, this.isP2Player, this.runner, this.balls);
        }
        this.freeMovement = !this.p1IsRunner;
        this.freeMovement2 = this.p1IsRunner;
    },
    SwitchFielderFreeMovement: function(newVal) {
        input.ClearAllKeys();
        if(this.p1IsRunner) {
            this.freeMovement2 = newVal;
            BaseStar.freeMovement2 = newVal;
        } else {
            this.freeMovement = newVal;
            BaseStar.freeMovement = newVal;
        }
    },
    InitDebug: function() {
        this.debug = true;
        const debugDraw = new b2DebugDraw();
        debugDraw.SetSprite(gfx.ctx["debug"]);
        debugDraw.SetDrawScale(PTM_RATIO);
        debugDraw.SetFillAlpha(0.5);
        debugDraw.SetLineThickness(1.0);
        debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
        this.world.SetDebugDraw(debugDraw); 
    },
    DebugDraw: function() {
        if(!this.debug) { return; }
        this.world.DrawDebugData();
        const ctx = gfx.ctx["debug"];
        const baseStroke = "#666666";
        ctx.save();
        ctx.lineWidth = 1;
        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];
            const ud = star.GetUserData()
            const radius = b2p(ud.radius) * ud.gravityRange;
            const pos = star.GetWorldCenter();
            let fillColor = "#00000000", strokeOpacity = "";
            switch(ud.powerIdx) { // [0, 4]
                case 0: fillColor = "#D0D0D010"; strokeOpacity = "11"; break;
                case 1: fillColor = "#D0D0D910"; strokeOpacity = "33"; break;
                case 2: fillColor = "#D0D0E210"; strokeOpacity = "55"; break;
                case 3: fillColor = "#D0D0EB10"; strokeOpacity = "77"; break;
                case 4: fillColor = "#D0D0FF10"; strokeOpacity = "AA"; break;
            }
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = baseStroke + strokeOpacity;
            ctx.beginPath();
            ctx.arc(b2p(pos.x), b2p(pos.y), radius, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();
        ctx.save();
        ctx.lineWidth = 1;
        for(let i = 0; i < this.balls.length; i++) {
            const ball = this.balls[i];
            const pos = ball.GetWorldCenter();
            const vel = ball.GetLinearVelocity();
            ctx.strokeStyle = "#FF0000";
            ctx.beginPath();
            ctx.moveTo(b2p(pos.x), b2p(pos.y));
            ctx.lineTo(b2p(pos.x + vel.x * 0.5), b2p(pos.y + vel.y * 0.5));
            ctx.stroke();
            ctx.fill();
            ctx.strokeStyle = "#0000FF";
            for(let j = 0; j < ball.beeForces.length; j++) {
                const f = ball.beeForces[j];
                ctx.beginPath();
				ctx.moveTo(f.x, f.y);
				ctx.lineTo(f.x + f.dx, f.y + f.dy);
				ctx.stroke();
				ctx.fill();
            }
        }
        ctx.restore();
    },
    StartCollision: function(c) {
        const b1 = c.GetFixtureA().GetBody(), b2 = c.GetFixtureB().GetBody();
        const b1u = b1.GetUserData(), b2u = b2.GetUserData();
        const i1 = b1u.identity, i2 = b2u.identity;
        if(i1 === i2) { return; }
        if(Either(i1, i2, "outfielder", "infielder")) { return; }
        if(Either(i1, i2, "infielder", "baseball") || Either(i1, i2, "outfielder", "baseball")) {
            if((i1 === "baseball" && b1u.lastFielder === b2u.player) || (i2 === "baseball" && b2u.lastFielder === b1u.player)) {
                return; // guy who just threw ball can't catch it again!
            }
            BaseStar.SpaceFly.fieldHandler.CatchBall(i1 === "baseball" ? b2u.player : b1u.player, 
                                                     i1 === "baseball" ? b1 : b2,
                                                     BaseStar.SpaceFly.runner);
        } else if(Either(i1, i2, "baseball", "runner")) {
            const ballData = i1 === "baseball" ? b1u : b2u;
            if(ballData.thrown) {
                console.log("THAT'S A BONKY, BUDDY!");
            } else {
                console.log("that's fine");
            }
        } else if(Either(i1, i2, "slammer", "runner")) {
            //const runner = i1 === "slammer" ? b2u.player : b1u.player;
            console.log("THAT'S A BONKY, BUDDY!");
        }
    },  
    ExitCollision: function(c) {
        /*const b1 = c.GetFixtureA().GetBody(), b2 = c.GetFixtureB().GetBody();
        const b1u = b1.GetUserData(), b2u = b2.GetUserData();
        if(b1u !== null) {
            if(b1u.particleBox === b2) { b1u.doParticleBox = true; }
            if(b1u.movingBox === b2) { b1u.doMoveBox = true; }
        } else if(b2u !== null) {
            if(b2u.particleBox === b1) { b2u.doParticleBox = true; }
            if(b2u.movingBox === b1) { b2u.doMoveBox = true; }
        }*/
    },
    KeyPress: function(key) {
        this.runHandler.KeyPress(key);
        this.fieldHandler.KeyPress(key);
    },
    Update: function() {
        this.world.Step(1 / 60, 10, 10);	
        this.world.ClearForces();
        if(++this.hundredTimer > 100) { this.hundredTimer = 0; }
        if(this.fieldHandler.slamDunkIdx >= 0) {
            const dunkerPos = this.fieldHandler.fielders[this.fieldHandler.slamDunkIdx];
            const numDunkers = 20;
            for(let i = 0; i < numDunkers; i++) {
                const radian = Math.PI / (numDunkers / 2) * i, len = 4, v = 10;
                const dunker = this.helper.GetCircle(dunkerPos.x + len * Math.cos(radian), dunkerPos.y + len * Math.sin(radian), 10, true, { identity: "slammer" }, true);
                dunker.SetLinearVelocity(new b2Vec2(v * Math.cos(radian), v * Math.sin(radian)));
                this.slamdunks.push({
                    frame: 0, animIdx: Math.floor(Math.random() * 10), 
                    body: dunker
                });
            }
            this.fieldHandler.dunkSpan = 50;
            this.fieldHandler.slamDunkIdx = -1;
        }
        if(--this.fieldHandler.dunkSpan <= 0 && this.slamdunks.length > 0) {
            this.slamdunks.forEach(slammer => {
                BaseStar.SpaceFly.world.DestroyBody(slammer.body)
            });
            this.slamdunks = [];
        }
        this.ApplyBallGravityForces();
        this.runHandler.Update();
        this.fieldHandler.Update();
    },
    AnimUpdate: function() {
        this.DebugDraw();
        this.particles.forEach(particle => {
            if(--particle.timer <= 0) {
                particle.frame = (++particle.frame % 2);
                particle.timer = Math.ceil(Math.random() * 6);
            }
            gfx.DrawSprite("sprites", particle.frame, 1, particle.x, particle.y, "interface");
        });
        this.slamdunks.forEach(slammer => {
            const pos = slammer.body.GetWorldCenter();
            if(++slammer.animIdx >= 8) {
                slammer.animIdx = 0;
                slammer.frame = slammer.frame === 1 ? 0 : 1;
            }
            gfx.DrawCenteredSprite("sprites", 7, slammer.frame, b2p(pos.x), b2p(pos.y), "interface", 32);
        });
        this.balls.forEach(ball => {
            const pos = ball.GetWorldCenter();
            const linearVelocity = ball.GetLinearVelocity();
            const sx = this.GetBallAngle(Math.atan2(linearVelocity.y, linearVelocity.x));
            gfx.DrawCenteredSprite("sprites", sx, 2, b2p(pos.x), b2p(pos.y), "interface", 32);
        });
        this.stars.forEach(star => {
            const pos = star.GetWorldCenter(), data = star.GetUserData();
            gfx.DrawCenteredSprite("sprites", data.powerIdx, 0, b2p(pos.x), b2p(pos.y), "interface", 32);
        });
        this.fieldHandler.AnimUpdate();
        this.runHandler.AnimUpdate();
    },
    ApplyBallGravityForces: function() {
        this.balls.forEach(ball => {
            const ballData = ball.GetUserData();
            const ballPos = ball.GetWorldCenter();
            ball.beeForces = [];
            if((this.hundredTimer % 3) === 0 && ballData.generateParticles) {
                this.particles.push({
                    x: b2p(ballPos.x) - 24 + Math.floor(Math.random() * 17),
                    y: b2p(ballPos.y) - 24 + Math.floor(Math.random() * 17),
                    frame: Math.floor(Math.random() * 1), 
                    timer: Math.ceil(Math.random() * 6), 
                });
                if(this.particles.length > 2000) { this.particles.shift(); }
            }
            if(ballData.held) {
                ball.SetActive(false);
            } else if(ballData.immunity === undefined || --ballData.immunity <= 0) {
                for (let j = 0; j < this.stars.length; j++) {
                    const starPos = this.stars[j].GetWorldCenter();
                    const starData = this.stars[j].GetUserData();
                    const starDist = new b2Vec2(0, 0);
                    starDist.Add(ballPos);
                    starDist.Subtract(starPos);
                    const force = (starData.gravityPower * ball.GetMass()) / Math.pow(starDist.Length(), 2);
                    if (starDist.Length() < starData.radius * starData.gravityRange) {
                        starDist.NegativeSelf();
                        starDist.Multiply(force);
                        if(ballData.thrown) { starDist.Multiply(0.5); } // gravity is weaker when ball is thrown from fielder to fielder
                        ball.ApplyForce(starDist, ball.GetWorldCenter());
                        ball.beeForces.push({
                            x: b2p(ballPos.x), y: b2p(ballPos.y),
                            dx: b2p(starDist.x), dy: b2p(starDist.y)
                        });
                    }
                }
            } else if(ballData.nextForce !== undefined) {
                ball.SetLinearVelocity(ballData.nextForce);
                ball.SetActive(true);
                delete ballData.nextForce;
            }
            if(ballData.runner !== undefined) {
                this.runner.x = b2p(ballPos.x);
                this.runner.y = b2p(ballPos.y);
            }
        });
    },
    GetStarsAndPlayersFromConstellation: function(constellationName) {
        const c = constellations[constellationName];
        const o = c.offset, s = c.scale;
        const powerMult = 5;//20 / c.stars.length;
        this.stars = []; this.fielders = [];
        const runnerStars = [];
        c.stars.forEach((e, i) => {
            const x = o.x + e.x * s.x, y = o.y + e.y * s.y;
            runnerStars.push({ x: x, y: y });
            this.stars.push(this.helper.GetStar(x, y, e.power * powerMult));
            this.fielders.push(new Infielder("Shitters", "", x, y, i))
        });
        this.runner = new Runner("Fuckers", "", 10, 240, runnerStars);
    },
    SwingBat: function(d) {
        const startPos = { x: 0, y: 240 + d.pos * 8 };
        const angle = 4 * (2 * d.dir + d.offset); // approx. [-13.2, 13.2]; *4 = [-52.8, 52.8]
        const y = 2 * d.power * Math.sin(angle / toRadians); // TODO: "toRadians" is very ambiguous/poorly named
        const x = 2 * d.power * Math.cos(angle / toRadians);
        const linearVelocity = new b2Vec2(x, y);
        this.balls.push(this.helper.GetBaseball(startPos, linearVelocity, this.runner));
        /*if(d.swingType === 1) { // standard swing  (not sure if/how the rest'll translate to the new playstyle)
            this.balls.push(this.helper.GetBaseball(startPos, linearVelocity));
        } else if(d.swingType === 2) { // multi ball
            linearVelocity.Multiply(0.25);
            this.balls.push(this.helper.GetBaseball({ x: 0, y: startPos.y - 60 }, linearVelocity));
            this.balls.push(this.helper.GetBaseball({ x: 0, y: startPos.y - 20 }, linearVelocity));
            this.balls.push(this.helper.GetBaseball({ x: 0, y: startPos.y + 20 }, linearVelocity));
            this.balls.push(this.helper.GetBaseball({ x: 0, y: startPos.y + 60 }, linearVelocity));
        } else if(d.swingType === 3) { // rubber band
            const ball1 = this.helper.GetBaseball({ x: 0, y: startPos.y - 30 }, linearVelocity);
            const ball2 = this.helper.GetBaseball({ x: 0, y: startPos.y + 30 }, linearVelocity);
            this.balls.push(ball1);
            this.balls.push(ball2);
            this.linkedBalls.push({
                maxDistance: 1,
                ball1: ball1, ball2: ball2
            });
        }*/
        gfx.DrawLine(startPos.x, startPos.y, startPos.x + x, startPos.y + y, "#FF0000", "text");
    },
    GetBallAngle: function(angleInRadians) {
        let angleDegrees = angleInRadians * toRadians;
        if(angleDegrees < 0) { angleDegrees += 360; }
        if(angleDegrees >= 337 || angleDegrees < 22) {
            return 2;
        } else if(angleDegrees >= 22 && angleDegrees < 67) {
            return 1;
        } else if(angleDegrees >= 67 && angleDegrees < 112) {
            return 0;
        } else if(angleDegrees >= 112 && angleDegrees < 157) {
            return 7;
        } else if(angleDegrees >= 157 && angleDegrees < 202) {
            return 6;
        } else if(angleDegrees >= 202 && angleDegrees < 247) {
            return 5;
        } else if(angleDegrees >= 247 && angleDegrees < 292) {
            return 4;
        } else if(angleDegrees >= 292 && angleDegrees < 337) {
            return 3;
        }
        return 0;
    }
};
function Either(a, b, condition1, condition2, outVar) {
    return (a === condition1 && b === condition2) || (a === condition2 && b === condition1);
}