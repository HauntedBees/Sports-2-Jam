class FieldHandler extends SecondaryHandler {
    /** @param {Team} team @param {FieldRunHandler} fieldRunHandler @param {Fielder[]} fielders */
    constructor(team, fieldRunHandler, fielders) {
        super(team);
        this.ballFielderIdx = -1; 
        this.targetFielderIdx = -1; 
        this.doubleSpeed = false;
        this.dunkSpan = 0; 
        this.dunked = false; 
        this.pitcherdunked = false; 
        this.slamDunkIdx = -1;
        this.animCounter = Math.floor(Math.random() * 100);
        this.fullHandler = fieldRunHandler;
        this.fielders = fielders;
        this.pitcher = fieldRunHandler.pitcher;
    }
    /** @param {Fielder} fielder @param {{ GetUserData: () => any; }} ball @param {Runner} runner */
    CatchBall(fielder, ball, runner) {
        Sounds.PlaySound("metal_0" + (Math.random() <= 0.5 ? "4" : "5"));
        const ballInfo = ball.GetUserData();
        if(ballInfo.runner === undefined) { // catching ball, runner is not connected to ball
            this.SwitchFielderFreeMovement(false);
            fielder.CatchBall(ball);
            this.ballFielderIdx = this.fielders.findIndex(e => e === fielder);
            // if the ball reaches the pitcher (or the base the runner is on already on) when all runners are at their bases, the round ends and they're automatically safe
            if(this.fullHandler.runHandler.IsSafe() && (fielder.pitcher || this.fullHandler.runHandler.runner.targetStar === this.ballFielderIdx)) {
                const me = this.fullHandler;
                AnimationHelpers.StartScrollText("SAFE!", function() { me.SafeBall(); });
                return;
            }
            let lowestDistance = 999999;
            this.fielders.forEach((fielder, i) => {
                const dx = fielder.x - runner.x, dy = fielder.y - runner.y;
                const magnitude = Math.sqrt(dx * dx + dy * dy);
                if(magnitude < lowestDistance && i !== this.targetFielderIdx) {
                    lowestDistance = magnitude;
                    this.targetFielderIdx = i;
                }
            });
            if(Math.random() > 0.5) { SpeakHandler.SpeakMiscFiller(14, 17, fielder.playerInfo.name); }
        } else { // runner is still one with the ball
            const me = this.fullHandler;
            AnimationHelpers.StartScrollText("OUT!", function() { me.CatchOut(); });
        }
    }
    BonkyOut(slamDunk) {
        const me = this.fullHandler;
        Sounds.PlaySound("metal_0" + (Math.random() <= 0.5 ? "4" : "5"));
        AnimationHelpers.StartScrollText((slamDunk ? "SLAM DUNK!  " : "") + "OUT!", function() { me.CatchOut(); });
    }
    MoveFielders(dx, dy) {
        const speed = this.doubleSpeed ? 10 : 5;
        this.fielders.forEach(f => {
            f.Move(speed * dx, speed * dy, true);
        });
    }
    AimForNextFielder(dir) {
        const len = this.fielders.length;
        let nextIdx = (this.targetFielderIdx + dir + len) % len;
        this.targetFielderIdx = nextIdx;
    }
    TargetRunner() {
        let minDist = -1;
        const runner = this.fullHandler.runner;
        const onbaseIds = this.fullHandler.runHandler.onBaseRunners.map(e => e.baseNumber);
        this.fielders.forEach((f, i) => {
            if(f.base < 0) { return; } // only target catchers, not wanderers
            if(onbaseIds.indexOf(f.base) >= 0) { return; } // only target bases the current runner can actually reach
            const d = Dist(runner.x, runner.y, f.x, f.y);
            if((minDist < 0 || d < minDist) && i !== this.ballFielderIdx) {
                minDist = d;
                this.targetFielderIdx = i;
            }
        });
    }
    TargetPitcher() {
        this.fielders.forEach((f, i) => {
            if(f.pitcher) { this.targetFielderIdx = i; }
        });
    }
    ThrowBall() {
        if(this.targetFielderIdx === this.ballFielderIdx) {
            if(this.fielders[this.ballFielderIdx].pitcher) {
                if(this.pitcherdunked) { return; } // can't dunk twice in one round!
                Sounds.PlaySound("spring_06");
                this.slamDunkIdx = this.ballFielderIdx;
                this.pitcherdunked = true;
            } else {
                if(this.dunked) { return; } // can't dunk twice in one round!
                Sounds.PlaySound("spring_06");
                this.slamDunkIdx = this.ballFielderIdx;
                this.dunked = true;
            }
        } else {
            this.fullHandler.gravMult = Math.max(1.5, this.fullHandler.gravMult / 2);
            this.fielders[this.ballFielderIdx].ThrowBall(this.fielders[this.targetFielderIdx]);
            this.SwitchFielderFreeMovement(true);
            this.ballFielderIdx = -1;
            this.targetFielderIdx = -1;
        }
    }
    SwitchFielderFreeMovement(newVal) {
        const controls = this.team.GetControls();
        controls.ClearAllKeys();
        controls.freeMovement = newVal;
    }
    KeyPress(key) {
        let dx = 0, dy = 0, confirm = false, cancel = false;
        switch(key) {
            case this.myControls["confirm"]: confirm = true; break;
            case this.myControls["cancel"]: cancel = true; break;
            case this.myControls["up"]: dy -= 1; break;
            case this.myControls["down"]: dy += 1; break;
            case this.myControls["left"]: dx -= 1; break;
            case this.myControls["right"]: dx += 1; break;
        }
        if(this.ballFielderIdx < 0) { // moving
            if(dx !== 0 || dy !== 0) { this.MoveFielders(dx, dy); }
        } else { // throwing ball
            if(cancel) {
                this.targetFielderIdx = this.ballFielderIdx;
                this.ThrowBall();
            }
            else if(confirm) { this.ThrowBall(); }
            else if(dy === -1) { this.TargetRunner(); }
            else if(dy === 1) { this.TargetPitcher(); }
            else if(dx !== 0) { this.AimForNextFielder(dx); }
        }
    }
    Update() {
        const ballPos = vecm2p(this.fullHandler.ball.GetWorldCenter());
        const someoneHasBall = this.fielders.some(e => e.ball !== null);
        this.fielders.forEach(f => {
            if(!someoneHasBall) {
                const mult = 0.5;
                const angle = Math.atan2(ballPos.y - f.y, ballPos.x - f.x);
                f.Move(mult * Math.cos(angle), mult * Math.sin(angle), false);
                f.SyncCollider();
            }
            f.Update();
        });
        this.animCounter += 0.1;
        if(this.animCounter > 100) {
            this.animCounter = 0;
        }
        if(!this.team.isPlayerControlled) { BaseStar.cpu.HandleField(); }
    }
    AnimUpdate() {
        this.DrawInfoUI();
        this.fielders.forEach(e => e.Draw());
        if(this.targetFielderIdx >= 0) {
            const targ = this.targetFielderIdx;
            const len = this.fielders.length;
            const currFielder = this.fielders[targ];
            const prevFielder = this.fielders[(targ - 1 + len) % len];
            const nextFielder = this.fielders[(targ + 1) % len];
            const scale = 1 + Math.sin(this.animCounter) / 4;
            gfx.DrawClampedSpriteToCameras("f_UI", "sprites", 8, 3, 12, 3, prevFielder.x - 8, prevFielder.y - 24, "overlay", 32, scale);
            gfx.DrawClampedSpriteToCameras("f_UI", "sprites", 9, 3, 12, 3, nextFielder.x - 8, nextFielder.y - 24, "overlay", 32, scale);
            if(targ === this.ballFielderIdx) {
                gfx.DrawClampedSpriteToCameras("f_UI", "sprites", 10, this.dunked ? 0 : 1, 12, 3, currFielder.x - 8, currFielder.y - 24, "overlay", 32, 2 * scale);
            } else {
                gfx.DrawClampedSpriteToCameras("f_UI", "sprites", 9, 1, 12, 3, currFielder.x - 8, currFielder.y - 24, "overlay", 32, 2 * scale);
            }
        }
    }
    GetPlayerHoldingBallDetails() {
        let details = null;
        this.fielders.forEach(e => {
            if(e.ball !== null) {
                details = e.GetBallOffset();
            }
        });
        return details;
    }
    DrawInfoUI() {
        const prefix = this.team.GetLayerPrefix();
        if(prefix === null) { return; }
        const layer = prefix + "text";
        const xInfo = this.fullHandler.GetInfoUIX(this.team.playerNum, true);
        if(this.ballFielderIdx < 0) {
            const cy = 45;
            gfx.DrawCenteredSprite("sprites", 12, 6, xInfo.centerX, cy, layer, 32, 1);
            gfx.DrawCenteredSprite("sprites", 14, 6, xInfo.centerX + 32, cy, layer, 32, 1);
            gfx.DrawCenteredSprite("sprites", 11, 6, xInfo.centerX + 64, cy, layer, 32, 1);
            gfx.DrawCenteredSprite("sprites", 13, 6, xInfo.centerX + 96, cy, layer, 32, 1);
            gfx.WriteEchoPlayerText("Move", xInfo.centerX + 128, cy + 5, 100, layer, "#FFFFFF", "#BA66FF", 16, "left");
        } else {
            const cy = 16, cy2 = 30;
            gfx.DrawCenteredSprite("sprites", 14, 1, xInfo.leftX, cy, layer, 32, 1);
            gfx.DrawCenteredSprite("sprites", 13, 1, xInfo.leftX + 32, cy, layer, 32, 1);
            gfx.WriteEchoPlayerText("Cycle Targets", xInfo.leftX + 64, cy + 5, 300, layer, "#FFFFFF", "#BA66FF", 16, "left");
            
            gfx.DrawCenteredSprite("sprites", 12, 1, xInfo.leftX + 16, cy + 32, layer, 32, 1);
            gfx.WriteEchoPlayerText("Target Becomer", xInfo.leftX + 64, cy + 37, 300, layer, "#FFFFFF", "#BA66FF", 16, "left");

            gfx.DrawCenteredSprite("sprites", 11, 1, xInfo.leftX + 16, cy + 64, layer, 32, 1);
            gfx.WriteEchoPlayerText("Target Pitcher", xInfo.leftX + 64, cy + 69, 300, layer, "#FFFFFF", "#BA66FF", 16, "left");

            if(this.targetFielderIdx === this.ballFielderIdx) {
                if(!this.dunked) {
                    gfx.DrawCenteredSprite("sprites", 11, 2, xInfo.rightX, cy2 + 16, layer, 32, 1);
                    gfx.WriteEchoPlayerText("Slam Dunk", xInfo.rightX + 32, cy2 + 21, 300, layer, "#FFFFFF", "#BA66FF", 16, "left");
                }
            } else {
                gfx.DrawCenteredSprite("sprites", 11, 2, xInfo.rightX, cy2, layer, 32, 1);
                gfx.WriteEchoPlayerText("Throw Sol", xInfo.rightX + 32, cy2 + 5, 300, layer, "#FFFFFF", "#BA66FF", 16, "left");

                gfx.DrawCenteredSprite("sprites", 12, 2, xInfo.rightX, cy2 + 32, layer, 32, 1);
                gfx.WriteEchoPlayerText("Slam Dunk", xInfo.rightX + 32, cy2 + 37, 300, layer, "#FFFFFF", "#BA66FF", 16, "left");
            }
        }
    }
}