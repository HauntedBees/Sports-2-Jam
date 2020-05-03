class Pitch {
    constructor(speed, velocity, x1, y1, dx) {
        this.x1 = x1;
        this.y1 = y1;
        this.idealX = 320 + dx;
        this.idealY = 200;

        this.x2 = x1 + ((this.idealX - x1) * 2);
        this.y2 = y1 + ((this.idealY - y1) * 2);

        this.dx = this.x2 - this.x1;
        this.dy = this.y2 - this.y1;
        this.speed = speed;
        this.velocity = velocity;

        this.ballPos = 0;
        this.animCounter = 0;
    }
    Advance() {
        this.ballPos += SpeedMult() * this.velocity;
        this.animCounter = (this.animCounter + 1) % 8;
    }
    Draw() { }
    GetPercent() { return this.ballPos / 100; }
    GetPosition() {
        const percentage = this.GetPercent();
        return { 
            x: this.x1 + this.dx * percentage,
            y: this.y1 + this.dy * percentage
        }
    }
}
class StandardPitch extends Pitch {
    constructor(x1, y1, dx) {
        const pitchSpeed = RandRange(160, 220);
        const ballVelocity = RandFloat(1.45, 1.55);
        super(pitchSpeed, ballVelocity, x1, y1, dx);
    }
    Draw() {
        const percentage = this.ballPos / 100;
        const ballx = this.x1 + this.dx * percentage;
        const bally = this.y1 + this.dy * percentage;
        const ballScale = (Math.log(0.1 + percentage) + Math.E) / 2;
        gfx.DrawLine(this.x1, this.y1, this.x2, this.y2, "#DDDDFFDD", "interface");
        gfx.DrawCenteredSprite("sprites", this.animCounter, 2, ballx, bally, "interface", 32, ballScale);
    }
}
class UnityPitch extends Pitch {
    constructor(x1, y1, dx) {
        const pitchSpeed = RandRange(75, 110);
        const ballVelocity = RandFloat(1.45, 1.55);
        super(pitchSpeed, ballVelocity, x1, y1, dx);
    }
    Draw() {
        const percentage = this.ballPos / 100;
        const ballx = this.x1 + this.dx * percentage;
        const bally = this.y1 + this.dy * percentage;
        const ballScale = (Math.log(0.1 + percentage) + Math.E) / 2;
        const invx = this.x1 + this.dx * (1 - percentage);
        const invy = this.y1 + this.dy * (1 - percentage);

        gfx.DrawLine(this.x1, this.y1, this.x2, this.y2, "#DDDDFFDD", "interface");
        gfx.DrawLine(this.x1, this.y2, this.x2, this.y1, "#DDDDFFDD", "interface");
        gfx.DrawCenteredSprite("sprites", this.animCounter, 2, ballx, bally, "interface", 32, ballScale);
        gfx.DrawCenteredSprite("sprites", this.animCounter, 2, invx, bally, "interface", 32, ballScale);
        gfx.DrawCenteredSprite("sprites", this.animCounter, 2, invx, invy, "interface", 32, ballScale);
        gfx.DrawCenteredSprite("sprites", this.animCounter, 2, ballx, invy, "interface", 32, ballScale);
    }
}
class DeceitPitch extends Pitch {
    constructor(x1, y1, dx) {
        const pitchSpeed = RandRange(85, 130);
        const ballVelocity = RandFloat(0.6, 1.3);
        super(pitchSpeed, ballVelocity, x1, y1, dx);
        this.numBalls = RandRange(3, 8);
        this.realBall = RandRange(0, this.numBalls - 3);
        if(this.realBall === 0) {
            this.realBall = RandRange(0, this.numBalls - 3);
        }
        this.ballGap = RandRange(15, 40);
    }
    Draw() {
        gfx.DrawLine(this.x1, this.y1, this.x2, this.y2, "#DDDDFFDD", "interface");
        for(let i = 0; i < this.numBalls; i++) {
            const myBallThrowPercentage = (this.ballPos - i * this.ballGap) / 100;
            const x = this.x1 + this.dx * myBallThrowPercentage;
            const y = this.y1 + this.dy * myBallThrowPercentage;
            if(myBallThrowPercentage >= 0) {
                const myScale = (Math.log(0.1 + myBallThrowPercentage) + Math.E) / 2;
                gfx.DrawCenteredSprite("sprites", this.animCounter, (i === this.realBall ? 2 : 3), x, y, "interface", 32, myScale);
            }
        }
    }
    GetPercent() { return (this.ballPos - this.realBall * this.ballGap) / 100; }
}
class SinePitch extends Pitch {
    constructor(x1, y1, pitcherdx) {
        const pitchSpeed = RandRange(160, 220);
        const ballVelocity = RandFloat(1.45, 1.55);
        super(pitchSpeed, ballVelocity, x1, y1, pitcherdx);

        this.pitchSpeed = 160 + Math.floor(60 * Math.random());
        this.ballVelocity = RandFloat(1.45, 1.55);
        
        const x2 = x1 + ((this.idealX - x1) * 2);
        const y2 = y1 + ((this.idealY - y1) * 2);
        this.x2f = x2; this.y2f = y2;
        const dx = x2 - x1, dy = y2 - y1;
        const magnitude = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const xShift = x1, yShift = y1;
        const frequency = RandFloat(0.05, 0.15);
        const amplitude = RandRange(20, 30);
        this.sinFormula = function(percentage) {
            const t = magnitude * percentage;
            const x = t * Math.cos(angle) - amplitude * Math.sin(t * frequency) * Math.sin(angle) + xShift;
            const y = t * Math.sin(angle) + amplitude * Math.sin(t * frequency) * Math.cos(angle) + yShift;
            return { x: x, y: y };
        };
        const newIdealPos = this.sinFormula(0.5);
        this.idealX = newIdealPos.x;
        this.idealY = newIdealPos.y;
    }
    Draw() {
        const percentage = this.ballPos / 100;
        let lastPos = this.sinFormula(0);
        for(let i = 1; i < 100; i++) {
            const newPos = this.sinFormula(i / 100);
            gfx.DrawLine(lastPos.x, lastPos.y, newPos.x, newPos.y, "#DDDDFFDD", "interface");
            lastPos = newPos;
        }
        const pos = this.sinFormula(percentage);
        const ballScale = (Math.log(0.1 + percentage) + Math.E) / 2;
        gfx.DrawCenteredSprite("sprites", this.animCounter, 2, pos.x, pos.y, "interface", 32, ballScale);
    }
}
class PitchHandler extends SecondaryHandler {
    ready = false; // ready to throw
    dx = 0; throwStyle = 1; pitchSpeed = 0; throwState = 0;
    t = 0; miscCounter = 0; pitchAnimState = 0; // animation buddies
    /** @type {Pitch} */ pitch = null;
    ballOffsetX = 17; ballOffsetY = 114;
    throwing = false;
    /** @param {Team} team @param {AtBatHandler} atBatHandler */
    constructor(team, atBatHandler) {
        super(team);
        this.fullHandler = atBatHandler;
    }
    ThrowBall() {
        this.throwing = true;
        this.t = 1;
        const x1 = this.pitcherx + this.ballOffsetX, y1 = this.pitchery + this.ballOffsetY;
        switch(this.throwStyle) {
            case 0: this.pitch = new SinePitch(x1, y1, this.dx); break;
            case 1: this.pitch = new StandardPitch(x1, y1, this.dx); break;
            case 2: this.pitch = new UnityPitch(x1, y1, this.dx); break;
            case 3: this.pitch = new DeceitPitch(x1, y1, this.dx); break;
        }
    }
    /** @param {number} dir @param {number} force @param {number} offset */
    BallHit(dir, force, offset) {
        if(offset === 0) {
            Sounds.PlaySound("gong_01", false);
        } else {
            Sounds.PlaySound(`glass_0${RandRange(1, 6)}`, false);
        }
        const ballPos = this.pitch.GetPosition();
        this.throwState = 1;
        this.ballx = ballPos.x; this.bally = ballPos.y;
        this.balldx = dir; this.balldy = -force - 2;
        if(Math.random() > 0.75) { SpeakHandler.SpeakFromKey(`spk_solHit${RandRange(0, 4)}`); }
    }
    KeyPress(key) {
        switch(key) {
            case this.myControls["left"]:
                if(!this.ready) { this.throwStyle = 3; }
                else if(this.pitchAnimState < 5) { this.dx = Math.max(this.dx - 1, -10); }
                break;
            case this.myControls["right"]:
                if(!this.ready) { this.throwStyle = 2; }
                else if(this.pitchAnimState < 5) { this.dx = Math.min(this.dx + 1, 10); }
                break;
            case this.myControls["down"]:
                if(!this.ready) { this.throwStyle = 0; }
                break;
            case this.myControls["up"]:
                if(!this.ready) { this.throwStyle = 1; }
                break;
            case this.myControls["confirm"]:
                this.ready = true;
                break;
        }
    }
    Update() {
        this.pitcherx = 340 + this.dx;
        this.pitchery = 20;
        if(this.throwState === 1) {
            this.ballx += this.balldx;
            this.bally += this.balldy;
            this.miscCounter = (8 + this.miscCounter - 1) % 8;
        } else if(this.pitchAnimState === 3) {
            this.pitch.Advance();
            if(this.pitch.GetPercent() > 0.7) {
                const struckOut = BaseStar.data.inning.AddStrikeAndReturnIfOut();
                const me = this.fullHandler;
                if(!this.team.isPlayerControlled) {
                    BaseStar.cpu.PlayerFailures[this.throwStyle] += 1;
                }
                if(struckOut) {
                    AnimationHelpers.StartScrollText("STRUCK OUT!", function() { me.StrikeOut(); });
                } else {
                    AnimationHelpers.StartScrollText("STRUCK IN!", function() { me.StrikeOut(); });
                }
            }
        } else if(this.throwing && this.pitchAnimState < 3 && ++this.miscCounter > 8) {
            this.miscCounter = 0;
            if(++this.pitchAnimState === 3) {
                Sounds.PlaySound("plop_0" + (Math.random() <= 0.5 ? "2" : "1"), false);
            }
        }
    }
    AnimUpdate() {
        gfx.DrawRectSprite(this.team.pitcherSheet, this.pitchAnimState, 0, this.pitcherx, this.pitchery, "interface", 92, 240, 0.75);
        gfx.DrawRectSprite("pitcher", this.pitchAnimState, 1, this.pitcherx, this.pitchery, "interface", 92, 240, 0.75);
        switch(this.pitchAnimState) {
            case 0:
                gfx.DrawCenteredSprite("sprites", 7, 2, this.pitcherx + 55, this.pitchery + 81, "interface", 32, 0.5);
                break;
            case 1:
                gfx.DrawCenteredSprite("sprites", 7, 2, this.pitcherx + 15, this.pitchery + 34, "interface", 32, 0.6);
                break;
            case 2:
                gfx.DrawCenteredSprite("sprites", 7, 2, this.pitcherx + 25, this.pitchery + 8, "interface", 32, 0.7);
                break;
        }
        if(this.team.showUI && !this.ready) {
            const centerx = outerGameData.gameType === "2p_local" ? 420 : 320, centery = 400, d = 20;
            gfx.DrawCenteredSprite("sprites", 11, 2, centerx, centery, "text", 32, 1);
            gfx.DrawCenteredSprite("sprites", 11, this.throwStyle === 0 ? 1 : 0, centerx, centery + d, "text", 32, 1);
            gfx.DrawCenteredSprite("sprites", 12, this.throwStyle === 1 ? 1 : 0, centerx, centery - d, "text", 32, 1);
            gfx.DrawCenteredSprite("sprites", 13, this.throwStyle === 2 ? 1 : 0, centerx + d, centery, "text", 32, 1);
            gfx.DrawCenteredSprite("sprites", 14, this.throwStyle === 3 ? 1 : 0, centerx - d, centery, "text", 32, 1);
            gfx.WriteEchoOptionText(PitchNames[this.throwStyle], centerx, centery + 3 * d, "text", "#FFFFFF", "#BA66FF", 24);
        }
        if(this.throwState === 1) { // ball is hit by batter
            gfx.DrawCenteredSprite("sprites", this.miscCounter, 2, this.ballx, this.bally, "interface", 32, 1);
            if(this.ballx < -16 || this.ballx > 656 || this.bally < 0) { this.throwState = 2; }
        } else if(this.pitchAnimState === 3) { // ball is thrown
            this.pitch.Draw();
            gfx.DrawCenteredSprite("sprites", 2, 1, this.pitch.idealX, this.pitch.idealY, "interface", 32, 2);
        }
    }
};