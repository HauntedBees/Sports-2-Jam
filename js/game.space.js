class FieldRunHandler extends Handler {
    constructor(ballDetails, pitcherPos, constellation) {
        super();
        this.state = 0; 
        this.debug = 0; // 0 = no debug, 1 = only local, 2 = local + b2Debug
        this.stars = []; 
        this.ball = null; 
        this.hundredTimer = 0;
        this.gravMult = 1.5; 
        this.showSplitScreenIn2P = true;
        this.slamdunks = []; 
        this.boondaries = [];
        /** @type {Runner} */ this.runner = null;
        this.b2updateRate = b2Framerate * SpeedMult();
        /** @type Fielder[] */ this.fielders = [];
        /** @type Runner[] */ this.onBasePlayers = [];

        const p1IsRunner = BaseStar.data.team1.isUp;
        const runningTeam = p1IsRunner ? BaseStar.data.team1 : BaseStar.data.team2;
        const fieldTeam = p1IsRunner ? BaseStar.data.team2 : BaseStar.data.team1;

        this.constellationName = constellation;
        this.minimap = new MiniMap(this);

        this.world = new b2World(new b2Vec2(0, 0), true);
        BaseStar.b2Helper = new b2Helpers(this.world);
        this.InitDebug();
        const runnerDetails = this.GetStarsAndPlayersFromConstellationAndSwingBat(constellation, runningTeam, fieldTeam, pitcherPos, ballDetails);
        this.CreateBoundaries();
        
        const l = new b2ContactListener();
        l.BeginContact = c => this.StartCollision(c);
        l.EndContact = c => this.ExitCollision(c);
        this.world.SetContactListener(l);

        this.runHandler = new RunHandler(runningTeam, this, this.runner, this.onBasePlayers, this.ball);
        this.fieldHandler = new FieldHandler(fieldTeam, this, this.fielders);
        this.freeMovement = !p1IsRunner;
        this.freeMovement2 = p1IsRunner;

        if(p1IsRunner) {
            BaseStar.cameras[0].ignores = ["f_"];
            BaseStar.cameras[0].SwitchFocus(this.runner, true);
            BaseStar.cameras[1].ignores = ["r_"];
            BaseStar.cameras[1].SwitchFocus(this.ball, true);
        } else {
            BaseStar.cameras[0].ignores = ["r_"];
            BaseStar.cameras[0].SwitchFocus(this.ball, true);
            BaseStar.cameras[1].ignores = ["f_"];
            BaseStar.cameras[1].SwitchFocus(this.runner, true);
        }
        BaseStar.cpu.InitFieldRun(this.runHandler, this.fieldHandler, !runningTeam.isPlayerControlled, !fieldTeam.isPlayerControlled, runnerDetails.runnerPos, runnerDetails.linearVelocity);
    }
    CleanUp() {
        this.minimap.CleanUp();
        const w = this.world;
        this.slamdunks.forEach(e => w.DestroyBody(e.body));
        w.DestroyBody(this.ball);
        this.stars.forEach(e => w.DestroyBody(e));
        this.world = null;
        BaseStar.cpu.ClearFieldRun();
        gfx.ClearLayer("debug");
        BaseStar.cameras[0].SwitchFocus(null, true);
        BaseStar.cameras[0].ignores = [];
        BaseStar.cameras[1].SwitchFocus(null, true);
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
                this.fieldHandler.BonkyOut(false);
            }
        } else if(Either(i1, i2, "slammer", "runner")) {
            this.fieldHandler.BonkyOut(true);
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
    CreateBoundaries() {
        const scale = BaseStar.fullMult;
        const bounds = BaseStar.fieldBounds;
        const boundx = bounds.x * scale, boundy = bounds.y * scale;
        const boundw = bounds.w * scale, boundh = bounds.h * scale;
        BaseStar.b2Helper.GetBarrier(boundx, boundy - 20, boundw, 20);
        BaseStar.b2Helper.GetBarrier(boundx, boundy + boundh, boundw, 20);
        BaseStar.b2Helper.GetBarrier(boundx - 20, boundy, 20, boundh);
        BaseStar.b2Helper.GetBarrier(boundx + boundw, boundy, 20, boundh);
        const boundBottom = boundy + boundh, boundRight = boundx + boundw;
        for(let x = 0; x < boundw; x += 64) {
            this.boondaries.push({ x: x, y: boundy, sx: 4 + Math.floor(Math.random() * 4) });
            this.boondaries.push({ x: x, y: boundBottom, sx: 4 + Math.floor(Math.random() * 4) });
        }
        for(let y = 0; y < boundh; y += 64) {
            this.boondaries.push({ x: boundx, y: y, sx: 4 + Math.floor(Math.random() * 4) });
            this.boondaries.push({ x: boundRight, y: y, sx: 4 + Math.floor(Math.random() * 4) });
        }
        this.debugBounds = [boundx, boundy, boundx + boundw, boundy + boundh];
    }
    /** @param {string} constellationName @param {Team} runningTeam @param {Team} fieldTeam @param {number} pitcherDx @param {any} ballDetails */
    GetStarsAndPlayersFromConstellationAndSwingBat(constellationName, runningTeam, fieldTeam, pitcherDx, ballDetails) {
        const c = ConstellationInfo[constellationName];
        const o = PAdd(c.offset, { x: 200, y: 0 }), s = PMult(c.scale, BaseStar.fullMult);
        const GetPoint = (x, y) => ({
            x: o.x + x * s.x,
            y: o.y + y * s.y
        });
        const powerMult = 100 / c.stars.length;
        this.stars = [];
        const runnerStars = [];
        const bounds = BaseStar.fieldBounds;
        const pitcherPos = GetPoint(bounds.x, bounds.y + bounds.h / 2 + pitcherDx * 25);
        this.pitcher = new Pitcher(fieldTeam, fieldTeam.players[BaseStar.data.inning.pitcherIdx], pitcherPos.x, pitcherPos.y);
        const mainHandler = this;
        c.stars.forEach((e, i) => {
            const p = GetPoint(e.x + 16, e.y);
            runnerStars.push(p);
            mainHandler.stars.push(BaseStar.b2Helper.GetStar(p.x, p.y, e.power * e.power * powerMult, e.power));
            mainHandler.fielders.push(new Infielder(fieldTeam, fieldTeam.players[(BaseStar.data.inning.pitcherIdx + 1 + i) % 20], p.x, p.y, i, mainHandler));
        });
        this.fielders.push(this.pitcher);
        BaseStar.outfielders.forEach((e, i) => {
            const p = GetPoint(e.x, e.y);
            mainHandler.fielders.push(new Outfielder(fieldTeam, fieldTeam.players[(BaseStar.data.inning.pitcherIdx + 1 + c.stars.length + i) % 20], p.x, p.y));
        });
        const runnerPos = GetPoint(bounds.x + 30, bounds.y + bounds.h / 2 + ballDetails.pos * 5);
        this.runner = new Runner(runningTeam, runningTeam.players[BaseStar.data.inning.atBatPlayerIdx], runnerPos.x, runnerPos.y, false, runnerStars);
        
        const angle = 4 * (2 * ballDetails.dir + ballDetails.offset); // approx. [-13.2, 13.2]; *4 = [-52.8, 52.8]
        const y = 2 * ballDetails.power * Math.sin(angle * angleToRadians);
        const x = 2 * ballDetails.power * Math.cos(angle * angleToRadians);
        const linearVelocity = new b2Vec2(x, y);
        this.ball = BaseStar.b2Helper.GetBaseball(runnerPos, linearVelocity, this.runner);

        BaseStar.data.inning.playersOnBase.forEach(e => {
            const b = new Runner(runningTeam, e.playerInfo, e.x, e.y, true, runnerStars);
            b.targetStar = e.baseIdx;
            b.onBase = true;
            b.baseNumber = e.baseIdx;
            mainHandler.onBasePlayers.push(b);
        });
        return { runnerPos: runnerPos, linearVelocity: linearVelocity }
    }
    SafeBall() {
        BaseStar.data.inning.strikes = 0;
        BaseStar.data.inning.playersOnBase = this.runHandler.onBaseRunners.map(e => e.GetRunnerShell());
        BaseStar.data.inning.playersOnBase.push(this.runHandler.runner.GetRunnerShell());
        if(BaseStar.data.inning.playersOnBase.length === this.stars.length) {
            const me = this;
            AnimationHelpers.StartScrollText("TOUCHDOWN!", function() { me.Touchdown(); });
        } else {
            this.FinishBatting();
        }
    }
    Touchdown() {
        BaseStar.data.Touchdown();
        this.FinishBatting();
    }
    CatchOut() { // a fielder has caught the ball while the batter was still on it; all players not on bases are out
        BaseStar.data.inning.playersOnBase = this.runHandler.onBaseRunners.filter(e => e.onBase).map(e => e.GetRunnerShell());
        if(BaseStar.data.inning.IncreaseOutsAndReturnIfSwitch()) {
            BaseStar.TeamSwitchHandler();
        } else {
            this.FinishBatting();
        }
    }
    FinishBatting() {
        BaseStar.data.inning.IncrementBatter();
        BaseStar.SwitchHandler(AtBatHandler);
    }
    KeyPress(key) {
        if(AnimationHelpers.IsAnimating()) { return; }
        this.runHandler.KeyPress(key);
        this.fieldHandler.KeyPress(key);
    }
    Update() {
        if(AnimationHelpers.IsAnimating() || BaseStar.paused) { return; }
        this.world.Step(this.b2updateRate, 10, 10);	
        this.world.ClearForces();
        BaseStar.cameras.forEach(e => e.Update());
        if(++this.hundredTimer > 100) { this.hundredTimer = 0; }
        if(this.fieldHandler.slamDunkIdx >= 0) {
            const dunker = this.fieldHandler.fielders[this.fieldHandler.slamDunkIdx];
            const numDunkers = dunker.pitcher ? 40 : 20;
            for(let i = 0; i < numDunkers; i++) {
                const radian = Math.PI / (numDunkers / 2) * i, len = 4, v = 10;
                const b2dunky = BaseStar.b2Helper.GetCircle(dunker.x + len * Math.cos(radian), dunker.y + len * Math.sin(radian), 10, true, { identity: "slammer" }, true);
                b2dunky.SetLinearVelocity(new b2Vec2(v * Math.cos(radian), v * Math.sin(radian)));
                this.slamdunks.push({
                    frame: 0, animIdx: Math.floor(Math.random() * 10), 
                    body: b2dunky
                });
            }
            this.dunkyTargeting = dunker.pitcher;
            this.fieldHandler.dunkSpan = dunker.pitcher ? 9999 : 50;
            this.fieldHandler.slamDunkIdx = -1;
        }
        if(--this.fieldHandler.dunkSpan <= 0 && this.slamdunks.length > 0) {
            this.slamdunks.forEach(slammer => {
                this.world.DestroyBody(slammer.body)
            });
            this.slamdunks = [];
        }

        if(this.dunkyTargeting) { this.ApplyDunkies(); }
        this.gravMult *= 1 + (0.001 * SpeedMult()); // NOTE: the math on this doesn't really check out but eh
        if(this.gravMult > 13) { this.gravMult = 13; }
        this.ApplyBallGravityForces(this.ball, this.gravMult);
        this.runHandler.Update();
        this.fieldHandler.Update();
        if(this.runner.justArrivedOnBase && this.runner.baseNumber === this.fieldHandler.ballFielderIdx) {
            const me = this;
            AnimationHelpers.StartScrollText("OUT!", function() { me.CatchOut(); });
        }
    }
    
    ApplyDunkies() {
        this.slamdunks.forEach(dunky => {
            const dunko = dunky.body;
            const dPos = dunko.GetWorldCenter();
            const rPos = this.runner.collider.GetWorldCenter();
            const playerDis = new b2Vec2(0, 0);
            playerDis.Add(dPos);
            playerDis.Subtract(rPos);
            const force = 4 / playerDis.Length();
            playerDis.NegativeSelf();
            playerDis.Multiply(force);
            dunko.ApplyForce(playerDis, dunko.GetWorldCenter());
        });
    }
    ApplyBallGravityForces(ball, gravMult) {
        const ballData = ball.GetUserData();
        const ballPos = ball.GetWorldCenter();
        const ballMass = ball.GetMass();
        ball.beeForces = [];
        if((this.hundredTimer % 3) === 0 && ballData.generateParticles) {
            BaseStar.particles.push({
                x: m2p(ballPos.x) - 24 + Math.floor(Math.random() * 17),
                y: m2p(ballPos.y) - 24 + Math.floor(Math.random() * 17),
                frame: Math.floor(Math.random() * 1), 
                timer: Math.ceil(Math.random() * 6), 
            });
            if((!playerOptions["particles"].value && BaseStar.particles.length > 20) || BaseStar.particles.length > 1000) { BaseStar.particles.shift(); }
        }
        if(ballData.held) {
            ball.SetActive(false);
        } else if(ballData.immunity === undefined || --ballData.immunity <= 0) {
            if(gravMult > 12) {
                let onlyStar = -1, closestDist = 10000;
                this.stars.forEach((star, i) => {
                    const pos = star.GetWorldCenter();
                    const d = Dist(pos.x, pos.y, ballPos.x, ballPos.y);
                    if(d < closestDist) {
                        closestDist = d;
                        onlyStar = i;
                    }
                });
                if(onlyStar >= 0) { this.ApplyForceFromStar(ball, gravMult, this.stars[onlyStar], ballPos, ballData.thrown, true); }
            } else {
                this.stars.forEach(star => this.ApplyForceFromStar(ball, gravMult, star, ballPos, ballMass, ballData.thrown, false));
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
    }
    ApplyForceFromStar(ball, gravMult, star, ballPos, ballMass, thrown, superGravity) {
        const starPos = star.GetWorldCenter();
        const starData = star.GetUserData();
        const starDist = new b2Vec2(0, 0);
        starDist.Add(ballPos);
        starDist.Subtract(starPos);
        let force = gravMult * (starData.gravityPower * ballMass) / Math.pow(starDist.Length(), 2);
        if(superGravity) {
            starDist.NegativeSelf();
            starDist.Multiply(10);
            this.ball.SetLinearVelocity(starDist);
        } else {
            if (starDist.Length() > starData.radius * starData.gravityRange) { force *= 0.1; } // if ball is far away, weaken the force
            if(thrown) { force *= 0.05; } // gravity is weaker when ball is thrown from fielder to fielder
            starDist.NegativeSelf();
            starDist.Multiply(force);
            ball.ApplyForce(starDist, ball.GetWorldCenter());
            ball.ApplyForce(starDist, ball.GetWorldCenter());
            ball.beeForces.push({
                x: m2p(ballPos.x), y: m2p(ballPos.y),
                dx: m2p(starDist.x), dy: m2p(starDist.y)
            });
        }
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
        BaseStar.particles.forEach(particle => {
            if(--particle.timer <= 0) {
                particle.frame = (++particle.frame % 2);
                particle.timer = Math.ceil(Math.random() * 6);
            }
            gfx.DrawSpriteToCameras("sparkle", "sprites", particle.frame, 1, particle.x, particle.y, "interface");
        });
        this.slamdunks.forEach(slammer => {
            const pos = slammer.body.GetWorldCenter();
            if(++slammer.animIdx >= 8) {
                slammer.animIdx = 0;
                slammer.frame = slammer.frame === 1 ? 0 : 1;
            }
            gfx.DrawCenteredSpriteToCameras("dunk", "sprites", 7, slammer.frame, m2p(pos.x), m2p(pos.y), "interface", 32);
        });

        const myConstellation = ConstellationInfo[this.constellationName];
        myConstellation.connections.forEach(e => {
            const star1 = this.stars[e[0]].GetWorldCenter(), star2 = this.stars[e[1]].GetWorldCenter();
            gfx.DrawLineToCameras(m2p(star1.x), m2p(star1.y), m2p(star2.x), m2p(star2.y), "#0000FF99", "interface");
        });
        this.fieldHandler.AnimUpdate();
        this.stars.forEach(star => {
            const pos = star.GetWorldCenter(), data = star.GetUserData();
            gfx.DrawCenteredSpriteToCameras("star", "sprites", data.powerIdx, 0, m2p(pos.x), m2p(pos.y), "interface", 32);
        });
        this.runHandler.AnimUpdate();
    
        const fieldHoldingInfo = this.fieldHandler.GetPlayerHoldingBallDetails();
        if(fieldHoldingInfo !== null) {
            gfx.DrawCenteredSpriteToCameras("ball", "sprites", 0, 2, fieldHoldingInfo.x, fieldHoldingInfo.y, "interface", 32);
        } else {
            const pos = this.ball.GetWorldCenter();
            const linearVelocity = this.ball.GetLinearVelocity();
            const sx = this.GetBallAngle(Math.atan2(linearVelocity.y, linearVelocity.x));
            gfx.DrawCenteredSpriteToCameras("ball", "sprites", sx, 2, m2p(pos.x), m2p(pos.y), "interface", 32);
        }

        this.boondaries.forEach(asteroid => {
            gfx.DrawCenteredSpriteToCameras("asteroid", "sprites", asteroid.sx, 2, asteroid.x, asteroid.y, "interface", 64, 1);
        });

        gfx.DrawHUDRectToCameras(0, 1, 640, 100, "#FFFFFF", "#000000", "overlay");
        this.minimap.Draw(this.runHandler.team.showUI, this.fieldHandler.team.showUI);
    }
    GetInfoUIX(playerNum, isFielding) {
        const xInfo = { centerX: 320, leftX: 185, rightX: 440 };
        if(outerGameData.gameType === "2p_local") {
            if(playerNum === 1) {
                xInfo.centerX -= 160;
                if(isFielding) {
                    xInfo.leftX -= 150;
                    xInfo.rightX -= 150;
                } else {
                    xInfo.leftX -= 120;
                    xInfo.rightX -= 120;
                }
            } else {
                if(isFielding) {
                    xInfo.leftX += 20;
                    xInfo.rightX += 20;
                } else {
                    xInfo.leftX += 40;
                    xInfo.rightX += 40;
                }
            }
        }
        return xInfo;
    }
    DebugDraw() {
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
        const pos = BaseStar.cameras[0].GetPosFromMeters(this.ball.GetWorldCenter(), "ball");
        const vel = this.ball.GetLinearVelocity();
        ctx.strokeStyle = "#FF0000";
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x + m2p(vel.x) * 0.5, pos.y + m2p(vel.y) * 0.5);
        ctx.stroke();
        ctx.fill();
        ctx.strokeStyle = "#0000FF";
        this.ball.beeForces.forEach(f => {
            const pos = BaseStar.cameras[0].GetPos(f, "debug");
            ctx.beginPath();
			ctx.moveTo(pos.x, pos.y);
			ctx.lineTo(pos.x + f.dx, pos.y + f.dy);
			ctx.stroke();
			ctx.fill();
        });
        ctx.restore();
    }
}