class FieldRunHandler extends Handler {
    state = 0; debug = 1; // 0 = no debug, 1 = only local, 2 = local + b2Debug
    stars = []; balls = [];
    constellationName = "";
    particles = []; slamdunks = [];
    /** @type Fielder[] */ fielders = [];
    /** @type Runner[] */ onBasePlayers = [];
    constructor(ballDetails, constellation) {
        super();
        const p1IsRunner = BaseStar.data.team1.isUp;
        const runningTeam = p1IsRunner ? BaseStar.data.team1 : BaseStar.data.team2;
        const fieldTeam = p1IsRunner ? BaseStar.data.team2 : BaseStar.data.team1;
        this.constellationName = constellation;
        this.minimap = new MiniMap(this);

        this.world = new b2World(new b2Vec2(0, 0), true);
        BaseStar.b2Helper = new b2Helpers(this.world);
        this.InitDebug();
        this.balls = [];
        this.particles = [];
        this.slamdunks = [];
        this.GetStarsAndPlayersFromConstellation(constellation, runningTeam, fieldTeam);
        this.SwingBat(ballDetails);
        const l = new b2ContactListener();
        const me = this;
        l.BeginContact = function(c) { me.StartCollision(c) };
        l.EndContact = function(c) { me.ExitCollision(c) };
        this.world.SetContactListener(l);

        this.runHandler = new RunHandler(runningTeam, this, this.runner, this.onBasePlayers, this.balls);
        this.fieldHandler = new FieldHandler(fieldTeam, this, this.fielders);
        this.freeMovement = !p1IsRunner;
        this.freeMovement2 = p1IsRunner;

        if(p1IsRunner) {
            BaseStar.cameras[0].ignores = ["f_"];
            BaseStar.cameras[0].SwitchFocus(this.runner);
            BaseStar.cameras[1].ignores = ["r_"];
            BaseStar.cameras[1].SwitchFocus(this.balls[0], true);
        } else {
            BaseStar.cameras[0].ignores = ["r_"];
            BaseStar.cameras[0].SwitchFocus(this.balls[0], true);
            BaseStar.cameras[1].ignores = ["f_"];
            BaseStar.cameras[1].SwitchFocus(this.runner);
        }
        BaseStar.cpu.InitFieldRun(this.runHandler, this.fieldHandler, !runningTeam.isPlayerControlled, !fieldTeam.isPlayerControlled);
    }
    CleanUp() {
        this.minimap.CleanUp();
        const w = this.world;
        this.particles = [];
        this.slamdunks.forEach(e => w.DestroyBody(e.body));
        this.balls.forEach(e => w.DestroyBody(e));
        this.stars.forEach(e => w.DestroyBody(e));
        this.world = null;
        BaseStar.cpu.ClearFieldRun();
        gfx.ClearLayer("debug");
        BaseStar.cameras[0].SwitchFocus(null);
        BaseStar.cameras[0].ignores = [];
        BaseStar.cameras[1].SwitchFocus(null);
        BaseStar.cameras[1].ignores = [];
    }
    StartCollision(c) {
        const b1 = c.GetFixtureA().GetBody(), b2 = c.GetFixtureB().GetBody();
        const b1u = b1.GetUserData(), b2u = b2.GetUserData();
        const i1 = b1u.identity, i2 = b2u.identity;
        if(i1 === i2) { return; }
        if(Either(i1, i2, "outfielder", "infielder")) { return; }
        if(Either(i1, i2, "infielder", "baseball") || Either(i1, i2, "outfielder", "baseball")) {
            if((i1 === "baseball" && b1u.lastFielder === b2u.player) || (i2 === "baseball" && b2u.lastFielder === b1u.player)) {
                return; // guy who just threw ball can't catch it again!
            }
            this.fieldHandler.CatchBall(i1 === "baseball" ? b2u.player : b1u.player, 
                                                     i1 === "baseball" ? b1 : b2,
                                                     this.runHandler.runner);
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
    } 
    ExitCollision(c) {
        /*const b1 = c.GetFixtureA().GetBody(), b2 = c.GetFixtureB().GetBody();
        const b1u = b1.GetUserData(), b2u = b2.GetUserData();
        if(b1u !== null) {
            if(b1u.particleBox === b2) { b1u.doParticleBox = true; }
            if(b1u.movingBox === b2) { b1u.doMoveBox = true; }
        } else if(b2u !== null) {
            if(b2u.particleBox === b1) { b2u.doParticleBox = true; }
            if(b2u.movingBox === b1) { b2u.doMoveBox = true; }
        }*/
    }
    InitDebug() {
        if(this.debug !== 2) { return; }
        const debugDraw = new b2DebugDraw();
        debugDraw.SetSprite(gfx.ctx["debug"]);
        debugDraw.SetDrawScale(PIXELS_TO_METERS);
        debugDraw.SetFillAlpha(0.5);
        debugDraw.SetLineThickness(1.0);
        debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
        this.world.SetDebugDraw(debugDraw); 
    }
    /** @param {string} constellationName @param {Team} runningTeam @param {Team} fieldTeam */
    GetStarsAndPlayersFromConstellation(constellationName, runningTeam, fieldTeam) {
        const c = ConstellationInfo[constellationName];
        const o = c.offset, s = c.scale;
        const powerMult = 5;//20 / c.stars.length;
        this.stars = [];
        
        const runnerStars = [];
        c.stars.forEach((e, i) => {
            const x = o.x + e.x * s.x, y = o.y + e.y * s.y;
            runnerStars.push({ x: x, y: y });
            this.stars.push(BaseStar.b2Helper.GetStar(x, y, e.power * powerMult));
            this.fielders.push(new Infielder(fieldTeam.name, fieldTeam.players[(BaseStar.data.inning.pitcherIdx + i) % 20], x, y, i));
        });
        BaseStar.outfielders.forEach((e, i) => {
            const x = o.x + e.x * s.x, y = o.y + e.y * s.y;
            this.fielders.push(new Outfielder(fieldTeam.name, fieldTeam.players[(BaseStar.data.inning.pitcherIdx + c.stars.length + i) % 20], x, y));
        });
        this.runner = new Runner(runningTeam.name, runningTeam.players[BaseStar.data.inning.atBatPlayerIdx], 10, 240, runnerStars);
        BaseStar.data.inning.playersOnBase.forEach(e => {
            const b = new Runner(runningTeam.name, e.playerInfo, e.x, e.y, runnerStars);
            b.targetStar = e.baseIdx;
            b.atBase = true;
            this.onBasePlayers.push(b);
        });
    }
    SwingBat(d) {
        const startPos = { x: 0, y: 240 + d.pos * 8 };
        const angle = 4 * (2 * d.dir + d.offset); // approx. [-13.2, 13.2]; *4 = [-52.8, 52.8]
        const y = 2 * d.power * Math.sin(angle / toRadians); // TODO: "toRadians" is very ambiguous/poorly named
        const x = 2 * d.power * Math.cos(angle / toRadians);
        const linearVelocity = new b2Vec2(x, y);
        this.balls.push(BaseStar.b2Helper.GetBaseball(startPos, linearVelocity, this.runner));
    }
    SafeBall() {
        BaseStar.data.inning.strikes = 0;
        BaseStar.data.inning.playersOnBase = this.runHandler.onBaseRunners.map(e => e.GetRunnerShell());
        BaseStar.data.inning.playersOnBase.push(this.runHandler.runner.GetRunnerShell());
        if(BaseStar.data.inning.playersOnBase.length === this.stars.length) {
            const me = this;
            AnimationHelpers.StartScrollText("TOUCHDOWN!", function() { me.Touchdown(); });
        } else {
            BaseStar.SwitchHandler(AtBatHandler);
        }
    }
    Touchdown() {
        BaseStar.data.Touchdown();
        BaseStar.SwitchHandler(AtBatHandler);
    }
    CatchOut() { // a fielder has caught the ball while the batter was still on it; all players not on bases are out
        BaseStar.data.inning.playersOnBase = this.runHandler.onBaseRunners.filter(e => e.atBase).map(e => e.GetRunnerShell());
        if(BaseStar.data.inning.IncreaseOutsAndReturnIfSwitch()) {
            AnimationHelpers.StartScrollText("CHANGE PLACES!", function() { BaseStar.ChangePlaces(); });
        } else {
            BaseStar.SwitchHandler(AtBatHandler);
        }
    }
    SwitchFielderFreeMovement(newVal) {
        input.ClearAllKeys();
        if(BaseStar.data.team1.isUp) {
            this.freeMovement2 = newVal;
            BaseStar.freeMovement2 = newVal;
        } else {
            this.freeMovement = newVal;
            BaseStar.freeMovement = newVal;
        }
    }
    KeyPress(key) {
        if(AnimationHelpers.IsAnimating()) { return; }
        this.runHandler.KeyPress(key);
        this.fieldHandler.KeyPress(key);
    }
    Update() {
        if(AnimationHelpers.IsAnimating() || game.paused) { return; }
        this.world.Step(1 / 60, 10, 10);	
        this.world.ClearForces();
        if(++this.hundredTimer > 100) { this.hundredTimer = 0; }
        if(this.fieldHandler.slamDunkIdx >= 0) {
            const dunkerPos = this.fieldHandler.fielders[this.fieldHandler.slamDunkIdx];
            const numDunkers = 20;
            for(let i = 0; i < numDunkers; i++) {
                const radian = Math.PI / (numDunkers / 2) * i, len = 4, v = 10;
                const dunker = BaseStar.b2Helper.GetCircle(dunkerPos.x + len * Math.cos(radian), dunkerPos.y + len * Math.sin(radian), 10, true, { identity: "slammer" }, true);
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
            const me = this;
            this.slamdunks.forEach(slammer => {
                me.world.DestroyBody(slammer.body)
            });
            this.slamdunks = [];
        }
        this.ApplyBallGravityForces();
        this.runHandler.Update();
        this.fieldHandler.Update();
        if(this.runner.atBase && this.runner.targetStar === this.fieldHandler.ballFielderIdx) {
            const me = this;
            AnimationHelpers.StartScrollText("OUT!", function() { me.CatchOut(); });
        }
    }
    ApplyBallGravityForces() {
        this.balls.forEach(ball => {
            const ballData = ball.GetUserData();
            const ballPos = ball.GetWorldCenter();
            ball.beeForces = [];
            if((this.hundredTimer % 3) === 0 && ballData.generateParticles) {
                this.particles.push({
                    x: m2p(ballPos.x) - 24 + Math.floor(Math.random() * 17),
                    y: m2p(ballPos.y) - 24 + Math.floor(Math.random() * 17),
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
                            x: m2p(ballPos.x), y: m2p(ballPos.y),
                            dx: m2p(starDist.x), dy: m2p(starDist.y)
                        });
                    }
                }
            } else if(ballData.nextForce !== undefined) {
                ball.SetLinearVelocity(ballData.nextForce);
                ball.SetActive(true);
                delete ballData.nextForce;
            }
            if(ballData.runner !== undefined) {
                this.runner.x = m2p(ballPos.x);
                this.runner.y = m2p(ballPos.y);
            }
        });
    }
    GetBallAngle(angleInRadians) {
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
    AnimUpdate() {
        this.DebugDraw();
        this.particles.forEach(particle => {
            if(--particle.timer <= 0) {
                particle.frame = (++particle.frame % 2);
                particle.timer = Math.ceil(Math.random() * 6);
            }
            gfx.DrawSpriteToCameras("debug", "sprites", particle.frame, 1, particle.x, particle.y, "interface");
        });
        this.slamdunks.forEach(slammer => {
            const pos = slammer.body.GetWorldCenter();
            if(++slammer.animIdx >= 8) {
                slammer.animIdx = 0;
                slammer.frame = slammer.frame === 1 ? 0 : 1;
            }
            gfx.DrawCenteredSpriteToCameras("dunk", "sprites", 7, slammer.frame, m2p(pos.x), m2p(pos.y), "interface", 32);
        });
        this.balls.forEach(ball => {
            const pos = ball.GetWorldCenter();
            const linearVelocity = ball.GetLinearVelocity();
            const sx = this.GetBallAngle(Math.atan2(linearVelocity.y, linearVelocity.x));
            gfx.DrawCenteredSpriteToCameras("ball", "sprites", sx, 2, m2p(pos.x), m2p(pos.y), "interface", 32);
        });
        this.stars.forEach(star => {
            const pos = star.GetWorldCenter(), data = star.GetUserData();
            gfx.DrawCenteredSpriteToCameras("star", "sprites", data.powerIdx, 0, m2p(pos.x), m2p(pos.y), "interface", 32);
        });
        const myConstellation = ConstellationInfo[this.constellationName];
        myConstellation.connections.forEach(e => {
            const star1 = this.stars[e[0]].GetWorldCenter(), star2 = this.stars[e[1]].GetWorldCenter();
            gfx.DrawLineToCameras(m2p(star1.x), m2p(star1.y), m2p(star2.x), m2p(star2.y), "#0000FF", "interface");
        });
        this.fieldHandler.AnimUpdate();
        this.runHandler.AnimUpdate();
        gfx.DrawHUDRectToCameras(155, 1, 484, 100, "#FFFFFF", "#000000", "overlay");
        this.minimap.Draw();
    }
    DebugDraw() { // TODO: this ain't gonna last long
        if(this.debug === 0) { return; }
        if(this.debug === 2) {
            this.world.DrawDebugData();
        } else {
            gfx.ClearLayer("debug");
        }
        const ctx = gfx.ctx["debug"];
        gfx.DrawLineToCameras(this.debugBounds[0], this.debugBounds[1], this.debugBounds[2], this.debugBounds[1], "#FFFF00", "debug");
        gfx.DrawLineToCameras(this.debugBounds[0], this.debugBounds[3], this.debugBounds[2], this.debugBounds[3], "#FFFF00", "debug");
        gfx.DrawLineToCameras(this.debugBounds[0], this.debugBounds[1], this.debugBounds[0], this.debugBounds[3], "#FFFF00", "debug");
        gfx.DrawLineToCameras(this.debugBounds[2], this.debugBounds[1], this.debugBounds[2], this.debugBounds[3], "#FFFF00", "debug");
        const baseStroke = "#666666";
        ctx.save();
        ctx.lineWidth = 1;
        this.stars.forEach(star => {
            const ud = star.GetUserData()
            const radius = m2p(ud.radius) * ud.gravityRange;
            const pos = BaseStar.cameras[0].GetPosFromMeters(star.GetWorldCenter(), "debug");
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
            ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.stroke();
        });
        ctx.restore();
        ctx.save();
        ctx.lineWidth = 1;
        this.balls.forEach(ball => {
            const pos = BaseStar.cameras[0].GetPosFromMeters(ball.GetWorldCenter(), "ball");
            const vel = ball.GetLinearVelocity();
            ctx.strokeStyle = "#FF0000";
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.lineTo(pos.x + m2p(vel.x) * 0.5, pos.y + m2p(vel.y) * 0.5);
            ctx.stroke();
            ctx.fill();
            ctx.strokeStyle = "#0000FF";
            ball.beeForces.forEach(f => {
                const pos = BaseStar.cameras[0].GetPos(f, "debug");
                ctx.beginPath();
				ctx.moveTo(pos.x, pos.y);
				ctx.lineTo(pos.x + f.dx, pos.y + f.dy);
				ctx.stroke();
				ctx.fill();
            });
        });
        ctx.restore();
    }
}
function Either(a, b, condition1, condition2) {
    return (a === condition1 && b === condition2) || (a === condition2 && b === condition1);
}