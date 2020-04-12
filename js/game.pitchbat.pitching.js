class PitchHandler extends SecondaryHandler {
    ready = false; // ready to throw
    dx = 0; throwStyle = 1;
    t = 0; miscCounter = 0; pitchAnimState = 0; // animation buddies
    throwState = 0; ballPos = 0; // for aiming and throwing
    idealBatX = 0; idealBatY = 0; 
    ballx = 0; bally = 0; balldx = 0; balldy = 0; 
    throwing = false;
    ThrowBall() {
        this.throwing = true;
        this.t = 1;
        this.idealBatX = 250 + this.dx + 60;
        this.idealBatY = 314;
    }
    /** @param {number} bx @param {number} by @param {number} dir @param {number} force */
    BallHit(bx, by, dir, force) {
        this.throwState = 1;
        this.ballx = bx; this.bally = by;
        this.balldx = dir; this.balldy = -force - 2;
    }
    GetBallDetails() {
        const x1 = 343 + this.dx, y1 = 180;
        const y2 = y1 + ((this.idealBatY - y1) * 2.5);
        let x2 = x1 + ((this.idealBatX - x1) * 2.5);
        let cx = 0, cy = 0;
        const dx = x2 - x1, dy = y2 - y1;
        const ballThrowPercentage = this.ballPos / 100;
        let ballx = x1 + dx * ballThrowPercentage;
        let bally = y1 + dy * ballThrowPercentage;
        if(this.throwStyle >= 2) {
            if(this.throwStyle === 2) {
                x2 -= 360;
                cx = (x1 + x2) / 2 + 300;
            } else if(this.throwStyle === 3) {
                x2 += 360;
                cx = (x1 + x2) / 2 - 300;
            } 
            cy = (y1 + y2) / 2;
            const mt = 1 - ballThrowPercentage;
            ballx = mt * mt * x1 + 2 * mt * ballThrowPercentage * cx + ballThrowPercentage * ballThrowPercentage * x2;
            bally = mt * mt * y1 + 2 * mt * ballThrowPercentage * cy + ballThrowPercentage * ballThrowPercentage * y2;
        }
        return {
            x1: x1, y1: y1, x2: x2, y2: y2, dx: dx, dy: dy, 
            idealx: this.idealBatX, idealy: this.idealBatY,
            ballx: ballx, bally: bally,
            ballThrowPercentage: ballThrowPercentage,
            cx: cx, cy: cy
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
        if(this.throwState === 1) {
            this.ballx += this.balldx;
            this.bally += this.balldy;
            this.miscCounter = (8 + this.miscCounter - 1) % 8;
        } else if(this.pitchAnimState === 5) {
            switch(this.throwStyle) { // TODO: real speed math
                case 0: this.ballPos += 1.5 + Math.log(1 + this.ballPos / 1000); break;
                case 1: this.ballPos += 0.8 + Math.log(1 + this.ballPos / 1000); break;
                case 2: 
                case 3: this.ballPos += 1.3 + Math.log(0.8 + this.ballPos / 1000); break;
            }
            this.miscCounter = (this.miscCounter + 1) % 8;
        } else if(this.throwing && this.pitchAnimState < 5 && ++this.miscCounter > 8) {
            this.pitchAnimState++;
            this.miscCounter = 0;
        }
    }
    AnimUpdate() {
        gfx.DrawSprite(this.team.name, this.pitchAnimState, 1, 320 + this.dx, 150, "interface", 64, 0.5);
        if(this.team.isPlayerControlled && !this.ready) {
            const centerx = 250, centery = 150, d = 30;
            gfx.DrawCenteredSprite("sprites", 11, this.throwStyle === 0 ? 1 : 0, centerx, centery + d, "interface", 32, 1);
            gfx.DrawCenteredSprite("sprites", 12, this.throwStyle === 1 ? 1 : 0, centerx, centery - d, "interface", 32, 1);
            gfx.DrawCenteredSprite("sprites", 13, this.throwStyle === 2 ? 1 : 0, centerx + d, centery, "interface", 32, 1);
            gfx.DrawCenteredSprite("sprites", 14, this.throwStyle === 3 ? 1 : 0, centerx - d, centery, "interface", 32, 1);
            gfx.WriteEchoOptionText(PitchNames[this.throwStyle], centerx + 200, centery - d, "interface", "#FFFFFF", "#BA66FF", 24);
        }
        if(this.throwState === 1) {
            gfx.DrawCenteredSprite("sprites", this.miscCounter, 2, this.ballx, this.bally, "interface", 32, 1);
            if(this.ballx < -16 || this.ballx > 656 || this.bally < 0) { this.throwState = 2; }
        } else if(this.pitchAnimState === 5) { // ball is thrown
            const d = this.GetBallDetails();
            const ballScale = Math.max(0.1, Math.log(0.1 + d.ballThrowPercentage) + Math.E) / 2;
            if(this.throwStyle < 2) { // standard or fastball
                gfx.DrawLine(d.x1, d.y1, d.x2, d.y2, "#DDDDFFDD", "interface");
            } else { // curveballs
                gfx.DrawLine(d.x1, d.y1, d.x2, d.y2, "#DDDDFFDD", "interface", d.cx, d.cy);
            }
            gfx.DrawCenteredSprite("sprites", this.miscCounter, 2, d.ballx, d.bally, "interface", 32, ballScale);
            gfx.DrawCenteredSprite("sprites", 2, 1, this.idealBatX, this.idealBatY, "interface", 32, 2);
        }
    }
};