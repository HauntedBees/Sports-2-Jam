class Player {
    constructor(teamname, name, x, y, type, radius) {
        this.team = teamname;
        this.name = name;
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
            gfx.DrawCenteredSprite(this.team, 6, 1, this.x, this.y, "interface", 64, 0.5);
        };
    }
}
class Fielder extends Player {
    constructor(teamname, name, x, y, type, radius) {
        super(teamname, name, x, y, type, radius);
        this.x = x - 10 + Math.floor(11 * Math.random());
        this.y = y - 10 + Math.floor(11 * Math.random());
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
            console.log(dx + ", " + dy + ", " + magnitude);
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
    }
}
class Outfielder extends Fielder {
    constructor(team, name, x, y) {
        super(team, name, x, y, "outfielder", 25); 
    }
}
class Infielder extends Fielder {
    constructor(team, name, x, y, base) {
        super(team, name, x, y, "infielder", 35);
        this.base = base;
    }
}
class RunnerShell {
    /** @param {Runner} runner */
    constructor(runner) {
        this.name = runner.name;
        this.x = runner.x;
        this.y = runner.y;
        this.baseIdx = runner.targetStar;
    }
}
class Runner extends Player {
    constructor(teamname, name, x, y, stars) {
        super(teamname, name, x, y, "runner", 15);
        this.dashed = false;
        this.targetStar = -1;
        let nextx = 0, nexty = 0, stepVector = null;
        let animFrame = 0, animCounter = 0;
        this.atBase = false;
        let running = false;
        let dashTimer = 0;
        this.stargets = stars;
        this.ball = null;
        this.GetRunnerShell = (function() { return new RunnerShell(this); });
        this.SetBall = function (ball) { this.ball = ball; };
        this.JumpOffBall = /** @param {number[]} occupiedBases */
        function (occupiedBases) {
            delete this.ball.GetUserData().runner;
            this.ball = null;
            let lowestDistance = -1;
            this.stargets.forEach((star, i) => {
                const tx = star.x, ty = star.y;
                const dx = tx - this.x, dy = ty - this.y;
                const magnitude = Math.sqrt(dx * dx + dy * dy);
                if (occupiedBases.indexOf(i) < 0 && (magnitude < lowestDistance || lowestDistance < 0)) {
                    nextx = tx;
                    nexty = ty;
                    stepVector = { x: dx / magnitude, y: dy / magnitude };
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
            stepVector = { x: dx / magnitude, y: dy / magnitude };
            this.targetStar = idx;
            running = true;
            this.atBase = false;
        };
        this.Update = function () {
            if (++animCounter > 5) {
                animFrame = (++animFrame % 3);
                animCounter = 0;
            }
            if (!running) {
                return;
            }
            if (dashTimer-- > 0) {
                const mult = 1 + Math.floor(dashTimer / 8);
                this.x += mult * stepVector.x;
                this.y += mult * stepVector.y;
            }
            else {
                this.x += stepVector.x;
                this.y += stepVector.y;
            }
            const d = Dist(this.x, this.y, nextx, nexty);
            if (d < 2) {
                running = false;
                this.atBase = true;
            }
        };
        this.Draw = function () {
            if (running) {
                gfx.DrawCenteredSprite(this.team, animFrame, 2, this.x, this.y, "interface", 64, 0.5);
            }
            else {
                gfx.DrawCenteredSprite(this.team, 6, 1, this.x, this.y, "interface", 64, 0.5);
            }
        };
    }
}
function Dist(ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay;
    return Math.sqrt(dx * dx + dy * dy);
}