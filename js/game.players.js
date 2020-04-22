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
            gfx.DrawCenteredSpriteToCameras("player", this.team, 6, 1, this.x, this.y, "interface", 64, 0.5);
        };
        this.GetMiniMapDrawDetails = function() {
            return [this.team, 6, 1, 64, { x: this.x, y: this.y }, false, 0.5];
        };
    }
}
class Fielder extends Player {
    pitcher = false;
    base = -1;
    constructor(teamname, playerInfo, x, y, type, radius) {
        super(teamname, playerInfo, x, y, type, radius);
        this.CatchBall = function (ball) {
            this.ball = ball;
            console.log("CAUGHT");
            const ballData = this.ball.GetUserData();
            ballData.held = true;
            ballData.lastFielder = undefined;
            ballData.generateParticles = false;
        };
        this.ThrowBall = function (target) {
            if (this.ball === null) {
                return;
            }
            const dx = target.x - this.x, dy = target.y - this.y;
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
        };
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
    Move(x, y) {
        this.x += x;
        this.y += y;
    }
}
class Outfielder extends Fielder {
    constructor(team, playerInfo, x, y) {
        super(team, playerInfo, x, y, "outfielder", 25);
    }
}
class Pitcher extends Outfielder {
    constructor(team, playerInfo, x, y) {
        super(team, playerInfo, x, y);
        this.pitcher = true;
    }
}
class Infielder extends Fielder {
    /**
     * @param {string} team
     * @param {{ team: number; name: string; stat1: number; stat2: number; stat3: number; stat4: number; }} playerInfo
     * @param {number} x @param {number} y @param {number} base
     * @param {FieldRunHandler} mainHandler
     */
    constructor(team, playerInfo, x, y, base, mainHandler) {
        super(team, playerInfo, x, y, "infielder", 35);
        this.base = base;
        this.animCounter = 0;
        this.animFrame = 0;
        this.mainHandler = mainHandler;
        this.Update = function () {
            if(++this.animCounter === 6) {
                this.animCounter = 0;
                this.animFrame++;
            }
        };
        this.Draw = function () {
            const ballPos = vecm2p(this.mainHandler.ball.GetWorldCenter());
            const angle = Math.atan2(this.y - ballPos.y, this.x - ballPos.x);
            gfx.DrawRotatedSpriteToCameras("player", this.team, angle, this.animFrame % 2, 7, this.x, this.y, "interface", 64, 0.5);
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
        let nextx = 0, nexty = 0, stepVector = null;
        let animFrame = 0, animCounter = 0;
        this.atBase = false;
        let running = false;
        let dashTimer = 0;
        this.onBase = onBase;
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
            this.targetStar = idx;
            running = true;
            this.atBase = false;
        };
        this.Update = function () {
            if (++animCounter > 5) {
                animFrame = (++animFrame % 3);
                animCounter = 0;
            }
            if (!running) { return; }
            
            const mult = 1 + ((dashTimer -- > 0) ? Math.floor(dashTimer / 8) : 0);
            this.x += mult * stepVector.x;
            this.y += mult * stepVector.y;

            const d = Dist(this.x, this.y, nextx, nexty);
            if (d < 2) {
                running = false;
                this.x = this.stargets[this.targetStar].x;
                this.y = this.stargets[this.targetStar].y;
                this.atBase = true;
            }
        };
        this.Draw = function () {
            if (running) {
                gfx.DrawCenteredSpriteToCameras("player", this.team, animFrame, 2, this.x, this.y, "interface", 64, 0.5);
            } else {
                gfx.DrawCenteredSpriteToCameras("player", this.team, 6, 1, this.x, this.y, "interface", 64, 0.5);
            }
        };
        this.GetMiniMapDrawDetails = function() {
            if(running) {
                return [this.team, animFrame, 2, 64, { x: this.x, y: this.y }, false, 0.5];
            } else if(this.onBase) {
                return [this.team, 6, 1, 64, { x: this.x - 100, y: this.y - 100 }, false, 0.4];
            } else {
                return [this.team, 6, 1, 64, { x: this.x, y: this.y }, false, 0.4];
            }
        };
    }
}
function Dist(ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay;
    return Math.sqrt(dx * dx + dy * dy);
}