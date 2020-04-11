BaseStar.Pitching = {
    myControls: null, 
    ready: false, // ready to throw
    throwStyle: 0, // 0 = straight
    dx: 0, throwState: 0, ballPos: 0, // for aiming and throwing
    idealBatX: 0, idealBatY: 0, 
    pitchAnimState: 0, miscCounter: 0, // animation buddies
    ballx: 0, bally: 0, balldx: 0, balldy: 0, 
    throwing: false, 
    team: null,
    Init: function(c, team) {
        this.myControls = c;
        this.team = team;
        this.ready = true;
        this.dx = 0; this.throwStyle = 0; this.ballPos = 0;
        this.t = 0; this.miscCounter = 0;
    },
    ThrowBall: function() {
        this.throwing = true;
        this.t = 1;
        this.idealBatX = 250 + this.dx + 60;
        this.idealBatY = 314;
    },
    BallHit: function(bx, by, dir, force) {
        this.throwState = 1;
        this.ballx = bx; this.bally = by;
        this.balldx = dir; this.balldy = -force - 2;
    },
    KeyPress: function(key) {
        switch(key) {
            case this.myControls.pause: this.WAAA = true; break;
            case this.myControls.cancel: delete this.WAAA; break;
            case this.myControls.left:
                if(this.ready && this.pitchAnimState < 5) { this.dx = Math.max(this.dx - 1, -10); }
                break;
            case this.myControls.right:
                if(this.ready && this.pitchAnimState < 5) { this.dx = Math.min(this.dx + 1, 10); }
                break;
        }
    },
    Update: function() {
        if(this.throwState === 1) {
            this.ballx += this.balldx;
            this.bally += this.balldy;
            this.miscCounter = (8 + this.miscCounter - 1) % 8;
        } else if(this.pitchAnimState === 5) {
            if(this.WAAA === true) { return; }
            this.ballPos += 1 + Math.log(1 + this.ballPos / 1000); // TODO: real speed math
            this.miscCounter = (this.miscCounter + 1) % 8;
        } else if(this.throwing && this.pitchAnimState < 5 && ++this.miscCounter > 8) {
            this.pitchAnimState++;
            this.miscCounter = 0;
        }
    },
    AnimUpdate: function() {
        gfx.DrawSprite(this.team, this.pitchAnimState, 1, 320 + this.dx, 150, "interface", 64, 0.5);
        if(this.throwState === 1) {
            gfx.DrawCenteredSprite("sprites", this.miscCounter, 2, this.ballx, this.bally, "interface", 32, 1);
            if(this.ballx < -16 || this.ballx > 656 || this.bally < 0) { this.throwState = 2; }
        } else if(this.pitchAnimState === 5) { // ball is thrown
            if(this.throwStyle === 0) {
                const d = this.GetBallDetails();
                gfx.DrawLine(d.x1, d.y1, d.x2, d.y2, "#DDDDFFDD");
                const ballScale = Math.max(0.1, Math.log(0.1 + d.ballThrowPercentage) + Math.E) / 2;
                gfx.DrawCenteredSprite("sprites", this.miscCounter, 2, d.ballx, d.bally, "interface", 32, ballScale);
            }
            gfx.DrawCenteredSprite("sprites", 2, 1, this.idealBatX, this.idealBatY, "interface", 32, 2);
        }
    },
    GetBallDetails: function() {
        const x1 = 343 + this.dx, y1 = 180;
        const x2 = x1 + ((this.idealBatX - x1) * 2.5), y2 = y1 + ((this.idealBatY - y1) * 2.5);
        const dx = x2 - x1, dy = y2 - y1;
        const ballThrowPercentage = this.ballPos / 100;
        const ballx = x1 + dx * ballThrowPercentage;
        const bally = y1 + dy * ballThrowPercentage;
        return {
            x1: x1, y1: y1, x2: x2, y2: y2, dx: dx, dy: dy, 
            idealx: this.idealBatX, idealy: this.idealBatY,
            ballx: ballx, bally: bally,
            ballThrowPercentage: ballThrowPercentage
        };
    }
};