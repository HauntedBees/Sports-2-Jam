class PitchHandler extends SecondaryHandler {
    ready = false; // ready to throw
    dx = 0; throwStyle = 1; pitchSpeed = 0;
    t = 0; miscCounter = 0; pitchAnimState = 0; // animation buddies
    throwState = 0; ballPos = 0; // for aiming and throwing
    idealBatX = 0; idealBatY = 0; 
    ballx = 0; bally = 0; balldx = 0; balldy = 0;
    pitcherx = 0; pitchery = 0;
    ballOffsetX = 17; ballOffsetY = 114; ballVelocity = 1;
    numBalls = 1; realBall = 0; ballGap = 0;
    throwing = false;
    /** @param {Team} team @param {AtBatHandler} atBatHandler */
    constructor(team, atBatHandler) {
        super(team);
        this.fullHandler = atBatHandler;
    }
    ThrowBall() {
        this.throwing = true;
        this.t = 1;
        this.idealBatX = 320 + this.dx;
        this.idealBatY = 200;
        switch(this.throwStyle) { // TODO: sine wave?
            case 0: // fastball
                this.pitchSpeed = 160 + Math.floor(60 * Math.random());
                this.ballVelocity = RandFloat(1.45, 1.55);
                break;
            case 1: // standard
                this.pitchSpeed = 80 + Math.floor(40 * Math.random());
                this.ballVelocity = RandFloat(0.8, 1);
                break;
            case 2: // unity
                this.pitchSpeed = 75 + Math.floor(35 * Math.random());
                this.ballVelocity = RandFloat(0.95, 1.35);
                break;
            case 3: // deceit
                this.pitchSpeed = 85 + Math.floor(45 * Math.random());
                this.ballVelocity = RandFloat(0.6, 1.3);
                this.numBalls = RandRange(3, 8);
                this.realBall = RandRange(0, this.numBalls - 3);
                this.ballGap = RandRange(15, 40);
                break;
        }
    }
    /** @param {number} bx @param {number} by @param {number} dir @param {number} force */
    BallHit(bx, by, dir, force) {
        this.throwState = 1;
        this.ballx = bx; this.bally = by;
        this.balldx = dir; this.balldy = -force - 2;
    }
    GetBallDetails() {
        const x1 = this.pitcherx + this.ballOffsetX, y1 = this.pitchery + this.ballOffsetY;
        const y2 = y1 + ((this.idealBatY - y1) * 2);
        const x2 = x1 + ((this.idealBatX - x1) * 2);
        const addtl = {};
        const dx = x2 - x1, dy = y2 - y1;
        let ballThrowPercentage = this.ballPos / 100;
        const displayPercentage = ballThrowPercentage;
        let ballx = x1 + dx * ballThrowPercentage;
        let bally = y1 + dy * ballThrowPercentage;
        if(this.throwStyle === 2) {
            addtl["x2"] = x1 + dx * (1 - ballThrowPercentage);
            addtl["y2"] = y1 + dy * (1 - ballThrowPercentage);
        } else if(this.throwStyle === 3) {
            ballThrowPercentage = (this.ballPos - this.realBall * this.ballGap) / 100;
            for(let i = 0; i < this.numBalls; i++) {
                const myBallThrowPercentage = (this.ballPos - i * this.ballGap) / 100;
                addtl[i] = {
                    p: myBallThrowPercentage,
                    x: x1 + dx * myBallThrowPercentage,
                    y: y1 + dy * myBallThrowPercentage,
                    scale: myBallThrowPercentage
                };
            }
        }
        return {
            x1: x1, y1: y1, x2: x2, y2: y2, dx: dx, dy: dy, 
            idealx: this.idealBatX, idealy: this.idealBatY,
            ballx: ballx, bally: bally,
            ballThrowPercentage: ballThrowPercentage,
            displayPercentage: displayPercentage, 
            addtl: addtl
        };
    }
    KeyPress(key) {
        switch(key) {
            case this.myControls.pause: 
            case this.myControls.cancel: break;
            case this.myControls.left:
                if(!this.ready) { this.throwStyle = 3; }
                else if(this.pitchAnimState < 5) { this.dx = Math.max(this.dx - 1, -10); }
                break;
            case this.myControls.right:
                if(!this.ready) { this.throwStyle = 2; }
                else if(this.pitchAnimState < 5) { this.dx = Math.min(this.dx + 1, 10); }
                break;
            case this.myControls.down:
                if(!this.ready) { this.throwStyle = 0; }
                break;
            case this.myControls.up:
                if(!this.ready) { this.throwStyle = 1; }
                break;
            case this.myControls.confirm:
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
            this.ballPos += this.ballVelocity;
            this.miscCounter = (this.miscCounter + 1) % 8;
            if(this.GetBallDetails().ballThrowPercentage > 0.7) {
                const struckOut = BaseStar.data.inning.AddStrikeAndReturnIfOut();
                const me = this.fullHandler;
                if(struckOut) {
                    AnimationHelpers.StartScrollText("STRUCK OUT!", function() { me.StrikeOut(); });
                } else {
                    AnimationHelpers.StartScrollText("STRUCK IN!", function() { me.StrikeOut(); });
                }
            }
        } else if(this.throwing && this.pitchAnimState < 3 && ++this.miscCounter > 8) {
            this.pitchAnimState++;
            this.miscCounter = 0;
        }
    }
    AnimUpdate() {
        gfx.DrawRectSprite(this.team.name + "_pitcher", this.pitchAnimState, 0, this.pitcherx, this.pitchery, "interface", 92, 240, 0.75);
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
        if(this.team.isPlayerControlled && !this.ready) {
            const centerx = 320, centery = 400, d = 20;
            gfx.DrawCenteredSprite("sprites", 11, 2, centerx, centery, "interface", 32, 1);
            gfx.DrawCenteredSprite("sprites", 11, this.throwStyle === 0 ? 1 : 0, centerx, centery + d, "interface", 32, 1);
            gfx.DrawCenteredSprite("sprites", 12, this.throwStyle === 1 ? 1 : 0, centerx, centery - d, "interface", 32, 1);
            gfx.DrawCenteredSprite("sprites", 13, this.throwStyle === 2 ? 1 : 0, centerx + d, centery, "interface", 32, 1);
            gfx.DrawCenteredSprite("sprites", 14, this.throwStyle === 3 ? 1 : 0, centerx - d, centery, "interface", 32, 1);
            gfx.WriteEchoOptionText(PitchNames[this.throwStyle], centerx, centery + 3 * d, "interface", "#FFFFFF", "#BA66FF", 24);
        }
        if(this.throwState === 1) { // ball is hit by batter
            gfx.DrawCenteredSprite("sprites", this.miscCounter, 2, this.ballx, this.bally, "interface", 32, 1);
            if(this.ballx < -16 || this.ballx > 656 || this.bally < 0) { this.throwState = 2; }
        } else if(this.pitchAnimState === 3) { // ball is thrown
            const d = this.GetBallDetails();
            const ballScale = (Math.log(0.1 + d.displayPercentage) + Math.E) / 2;
            if(this.throwStyle < 2) { // standard or fastball
                gfx.DrawLine(d.x1, d.y1, d.x2, d.y2, "#DDDDFFDD", "interface");
                gfx.DrawCenteredSprite("sprites", this.miscCounter, 2, d.ballx, d.bally, "interface", 32, ballScale);
            } else if(this.throwStyle === 2) { // unity
                gfx.DrawLine(d.x1, d.y1, d.x2, d.y2, "#DDDDFFDD", "interface");
                gfx.DrawLine(d.x1, d.y2, d.x2, d.y1, "#DDDDFFDD", "interface");
                gfx.DrawCenteredSprite("sprites", this.miscCounter, 2, d.ballx, d.bally, "interface", 32, ballScale);
                gfx.DrawCenteredSprite("sprites", this.miscCounter, 2, d.addtl["x2"], d.bally, "interface", 32, ballScale);
                gfx.DrawCenteredSprite("sprites", this.miscCounter, 2, d.addtl["x2"], d.addtl["y2"], "interface", 32, ballScale);
                gfx.DrawCenteredSprite("sprites", this.miscCounter, 2, d.ballx, d.addtl["y2"], "interface", 32, ballScale);
            } else { // deceit
                gfx.DrawLine(d.x1, d.y1, d.x2, d.y2, "#DDDDFFDD", "interface");
                for(let i = 0; i < this.numBalls; i++) {
                    const pos = d.addtl[i];
                    if(pos.p >= 0) {
                        const myScale = (Math.log(0.1 + pos.scale) + Math.E) / 2;
                        gfx.DrawCenteredSprite("sprites", this.miscCounter, (i === this.realBall ? 2 : 8), pos.x, pos.y, "interface", 32, myScale);
                    }
                }
            }
            gfx.DrawCenteredSprite("sprites", 2, 1, this.idealBatX, this.idealBatY, "interface", 32, 2);
        }
    }
};