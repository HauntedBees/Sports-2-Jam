class Player {
    constructor(teamname, playerInfo, x, y, type, radius) {
        this.team = teamname;
        this.playerInfo = playerInfo;
        this.homex = x;
        this.x = x;
        this.homey = y;
        this.y = y;
        this.type = type;
        this.ball = null;
        this.collider = BaseStar.b2Helper.GetPlayerCollider(this.x, this.y, radius, this, type);
        this.SyncCollider = function () {
            this.collider.SetPosition({ x: p2m(this.x), y: p2m(this.y) });
        };
        this.Update = function () { };
        this.Draw = function () {
            gfx.DrawCenteredSpriteToCameras("player", this.team, 0, 8, this.x, this.y, "interface", 64, 0.5);
            gfx.DrawCenteredSpriteToCameras("player", "baseballers", 4, 8, this.x, this.y, "interface", 64, 0.5);
        };
        this.GetMiniMapDrawDetails = function() {
            return [this.team, 6, 1, 64, { x: this.x, y: this.y }, false, 0.5];
        };
    }
}
class Fielder extends Player {
    pitcher = false; catchDir = 0; base = -1;
    force = { x: 0, y: 0 };
    caughtBallTimer = 0; throwAnimState = 0;
    constructor(teamname, playerInfo, x, y, type, radius) {
        super(teamname, playerInfo, x, y, type, radius);
        this.Update = function () {
            if (this.ball !== null) {
                this.ball.SetPosition({ x: p2m(this.x), y: p2m(this.y - 10) });
            }
        };
        this.GetMiniMapDrawDetails = function() {
            if(this.ball === null) {
                return [this.team, this.pitcher ? 3: 6, this.pitcher ? 2 : 1, 64, { x: this.x, y: this.y }, false, this.pitcher ? 0.33 : 0.25];
            } else {
                return [this.team, 4, 2, 64, { x: this.x, y: this.y }, false, this.pitcher ? 0.6 : 0.5];
            }
        };
    }
    CatchBall(ball) {
        this.ball = ball;
        console.log("CAUIGHT!");
        console.log(m2p(this.ball.GetWorldCenter().x));
        console.log(this.x);
        if(m2p(this.ball.GetWorldCenter().x) > this.x) {
            this.catchDir = 0;
        } else {
            this.catchDir = 1;
        }
        this.caughtBallTimer = 5;
        this.force = { x: 0, y: 0 };
        const ballData = this.ball.GetUserData();
        ballData.held = true;
        ballData.lastFielder = undefined;
        ballData.generateParticles = false;
    }
    ThrowBall(target) {
        if (this.ball === null) { return; }
        const dx = target.x - this.x, dy = target.y - this.y;
        this.catchDir = dx < 0 ? 1 : 0;
        const magnitude = Math.sqrt(dx * dx + dy * dy);
        const force = new b2Vec2(dx / magnitude, dy / magnitude);
        force.Multiply(20);
        const ballData = this.ball.GetUserData();
        ballData.lastFielder = this;
        ballData.immunity = 10;
        ballData.held = false;
        ballData.thrown = true;
        ballData.generateParticles = true;
        ballData.nextForce = force;
        this.ball = null;
        this.throwAnimState = 2;
    }
    Move(x, y) {
        this.x += x;
        this.y += y;
    }
    GetBallOffset() {
        return { x: this.x, y : this.y };
    };
}
class Outfielder extends Fielder {
    angle = 0;
    constructor(team, playerInfo, x, y) {
        super(team, playerInfo, x, y, "outfielder", 25);
        let animFrame = 0, animCounter = 0, sy = 0;
        let moving = false;
        this.Update = function() {
            if (++animCounter > 5) {
                animFrame = (++animFrame % 4);
                animCounter = 0;
            }
            this.force = PMult(this.force, 0.7);
            if(Math.abs(this.force.x) < 0.1) { this.force.x = 0; }
            if(Math.abs(this.force.y) < 0.1) { this.force.y = 0; }

            let angle = Math.atan2(this.force.y, this.force.x) / angleToRadians + 23;
            if(angle > 360) { angle -= 360; }
            else if(angle < 0) { angle += 360; }
            sy = Math.floor(angle / 45);

            if(this.caughtBallTimer > 0) { this.caughtBallTimer--; }
            if(this.throwAnimState > 0) { this.throwAnimState--; }
            moving = this.force.x !== 0 || this.force.y !== 0;
            if(moving) {
                if(this.force.x !== 0 && this.force.y !== 0) {
                    this.x += this.force.x * Math.SQRT1_2;
                    this.y += this.force.y * Math.SQRT1_2;
                } else {
                    this.x += this.force.x;
                    this.y += this.force.y;
                }
            }
        }
        this.Draw = function () {
            if(this.throwAnimState > 0) {
                if(this.catchDir === 1) { // throwing to left
                    const sx = this.throwAnimState === 2 ? 2 : 3;
                    gfx.DrawCenteredSpriteToCameras("player", this.team, sx, 8, this.x, this.y, "interface", 64, 0.75);
                    gfx.DrawCenteredSpriteToCameras("player", "baseballers", sx + 4, 8, this.x, this.y, "interface", 64, 0.75);
                } else { // throwing to right
                    const sx = this.throwAnimState === 2 ? 5 : 4;
                    gfx.DrawCenteredSpriteToCameras("player", this.team + "flip", sx, 8, this.x, this.y, "interface", 64, 0.75);
                    gfx.DrawCenteredSpriteToCameras("player", "baseballersflip", sx - 4, 8, this.x, this.y, "interface", 64, 0.75);
                }
            } else if(this.caughtBallTimer > 0) {
                if(this.catchDir === 1) { // caught from left
                    gfx.DrawCenteredSpriteToCameras("player", this.team, 1, 8, this.x, this.y, "interface", 64, 0.75);
                    gfx.DrawCenteredSpriteToCameras("player", "baseballers", 5, 8, this.x, this.y, "interface", 64, 0.75);
                } else { // caught from right
                    gfx.DrawCenteredSpriteToCameras("player", this.team + "flip", 6, 8, this.x, this.y, "interface", 64, 0.75);
                    gfx.DrawCenteredSpriteToCameras("player", "baseballersflip", 2, 8, this.x, this.y, "interface", 64, 0.75);
                }
            } else if (moving) {
                gfx.DrawCenteredSpriteToCameras("player", this.team, animFrame, sy, this.x, this.y, "interface", 64, 0.75);
                gfx.DrawCenteredSpriteToCameras("player", "baseballers", animFrame + 4, sy, this.x, this.y, "interface", 64, 0.75);
            } else {
                gfx.DrawCenteredSpriteToCameras("player", this.team, 0, 8, this.x, this.y, "interface", 64, 0.75);
                gfx.DrawCenteredSpriteToCameras("player", "baseballers", 4, 8, this.x, this.y, "interface", 64, 0.75);
            }
        };
    }
    Move(x, y) {
        if(this.caughtBallTimer > 0) { return; }
        this.force.x += x;
        this.force.y += y;
    }
    GetBallOffset() {
        if(this.caughtBallTimer > 0) {
            return { x: this.x + (this.catchDir === 1 ? 15 : -15), y : this.y - 15 };
        } else {
            return { x: this.x - 2, y : this.y + 5 };
        }
    };
}
class Pitcher extends Outfielder {
    constructor(team, playerInfo, x, y) {
        super(team, playerInfo, x, y);
        this.pitcher = true;
    }
}
class Infielder extends Fielder {
    animCounter = 0; animFrame = 0;
    /**
     * @param {string} team
     * @param {{ team: number; name: string; stat1: number; stat2: number; stat3: number; stat4: number; }} playerInfo
     * @param {number} x @param {number} y @param {number} base
     * @param {FieldRunHandler} mainHandler
     */
    constructor(team, playerInfo, x, y, base, mainHandler) {
        super(team, playerInfo, x, y, "infielder", 35);
        this.base = base;
        this.mainHandler = mainHandler;
        this.Update = function () {
            if(this.ball !== null) {
                this.animFrame = 0;
            } else if(++this.animCounter === 4) {
                this.animCounter = 0;
                this.animFrame++;
            }
        };
        this.Draw = function () {
            const ballPos = vecm2p(this.mainHandler.ball.GetWorldCenter());
            const angle = Math.atan2(this.y - ballPos.y, this.x - ballPos.x) - 1.17;
            gfx.DrawRotatedSpriteToCameras("player", this.team + "_big", angle, 1 + this.animFrame % 2, 0, this.x + 7 * Math.sin(angle), this.y - 7 * Math.cos(angle), "interface", 128, 0.5);
        };
    }
    Move(x, y) { }
}
class RunnerShell {
    /** @param {Runner} runner */
    constructor(runner) {
        this.playerInfo = runner.playerInfo;
        this.x = runner.x;
        this.y = runner.y;
        this.baseIdx = runner.targetStar;
    }
}
class Runner extends Player {
    constructor(teamname, playerInfo, x, y, onBase, stars) {
        super(teamname, playerInfo, x, y, (onBase ? "runnerOnBase" : "runner"), 15);
        this.dashed = false;
        this.targetStar = -1;
        let nextx = 0, nexty = 0, stepVector = { x: 0, y: 0 }, sy = 0;
        let animFrame = 0, animCounter = 0;
        let running = false;
        let dashTimer = 0;
        this.onBase = onBase;
        this.baseNumber = -1;
        this.stargets = stars;
        this.ball = null;
        const speed = BaseStar.fullMult * 1;
        this.GetRunnerShell = (function() { return new RunnerShell(this); });
        this.SetBall = function (ball) { this.ball = ball; };
        this.JumpOffBall = /** @param {number[]} occupiedBases */
        function (occupiedBases) {
            if(this.ball !== null) {
                delete this.ball.GetUserData().runner;
                this.ball = null;
            }
            let lowestDistance = -1;
            this.stargets.forEach((star, i) => {
                const tx = star.x, ty = star.y;
                const dx = tx - this.x, dy = ty - this.y;
                const magnitude = Math.sqrt(dx * dx + dy * dy);
                if (occupiedBases.indexOf(i) < 0 && (magnitude < lowestDistance || lowestDistance < 0)) {
                    nextx = tx;
                    nexty = ty;
                    stepVector = { x: speed * dx / magnitude, y: speed * dy / magnitude };
                    lowestDistance = magnitude;
                    this.targetStar = i;
                }
                this.CalculateRunAngle();
            });
            running = true;
        };
        this.Dash = function () {
            if (this.dashed) { return; }
            this.dashed = true;
            dashTimer = 30;
        };
        this.MoveToStar = function (idx) {
            if (this.ball !== null) {
                return;
            }
            const star = this.stargets[idx];
            nextx = star.x;
            nexty = star.y;
            const dx = nextx - this.x, dy = nexty - this.y;
            const magnitude = Math.sqrt(dx * dx + dy * dy);
            stepVector = { x: speed * dx / magnitude, y: speed * dy / magnitude };
            this.CalculateRunAngle();
            this.targetStar = idx;
            running = true;
            this.onBase = false;
            this.baseNumber = -1;
        };
        this.CalculateRunAngle = function() {
            let angle = Math.atan2(stepVector.y, stepVector.x) / angleToRadians + 23;
            if(angle > 360) { angle -= 360; }
            else if(angle < 0) { angle += 360; }
            sy = Math.floor(angle / 45);
        };
        this.Update = function () {
            if (++animCounter > 5) {
                animFrame = (++animFrame % 4);
                animCounter = 0;
            }
            if (!running) { return; }
            
            const mult = 1 + ((dashTimer -- > 0) ? Math.floor(dashTimer / 8) : 0);
            this.x += mult * stepVector.x;
            this.y += mult * stepVector.y;

            const d = Dist(this.x, this.y, nextx, nexty);
            if (d < (2 * mult * 1.2)) {
                running = false;
                this.x = this.stargets[this.targetStar].x;
                this.y = this.stargets[this.targetStar].y;
                this.onBase = true;
                this.baseNumber = this.targetStar;
            }
        };
        this.Draw = function () {
            const drawY = this.y - (this.ball === null ? 0 : 10);
            if (running) {
                gfx.DrawCenteredSpriteToCameras("player", this.team, animFrame, sy, this.x, drawY, "interface", 64, 0.75);
                gfx.DrawCenteredSpriteToCameras("player", "baseballers", animFrame + 4, sy, this.x, drawY, "interface", 64, 0.75);
            } else {
                gfx.DrawCenteredSpriteToCameras("player", this.team, 0, 8, this.x, drawY, "interface", 64, 0.75);
                gfx.DrawCenteredSpriteToCameras("player", "baseballers", 4, 8, this.x, drawY, "interface", 64, 0.75);
            }
        };
        this.GetMiniMapDrawDetails = function() {
            if(running) {
                return [this.team, animFrame, sy, 64, { x: this.x, y: this.y }, false, 0.4];
            } else if(this.onBase) {
                return [this.team, 4, 8, 64, { x: this.x - 100, y: this.y - 100 }, false, 0.3];
            } else {
                return [this.team, 4, 8, 64, { x: this.x, y: this.y }, false, 0.3];
            }
        };
    }
}
function Dist(ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay;
    return Math.sqrt(dx * dx + dy * dy);
}