class FieldHandler extends SecondaryHandler {
    ballFielderIdx = -1;
    targetFielderIdx = -1;
    dunkSpan = 0; dunked = false; slamDunkIdx = -1;
    animCounter = Math.floor(Math.random() * 100);
    /** @param {Team} team @param {FieldRunHandler} fieldRunHandler @param {Fielder[]} fielders */
    constructor(team, fieldRunHandler, fielders) {
        super(team);
        this.fullHandler = fieldRunHandler;
        this.fielders = fielders;
        this.pitcher = fieldRunHandler.pitcher;
    }
    /** @param {Fielder} fielder @param {{ GetUserData: () => any; }} ball @param {Runner} runner */
    CatchBall(fielder, ball, runner) {
        const ballInfo = ball.GetUserData();
        if(ballInfo.runner === undefined) { // catching ball, runner is not connected to ball
            this.fullHandler.SwitchFielderFreeMovement(false);
            fielder.CatchBall(ball);
            this.ballFielderIdx = this.fielders.findIndex(e => e === fielder);
            // if the ball reaches the pitcher when all runners are at their bases, the round ends and they're automatically safe
            if(this.fullHandler.runHandler.IsSafe() && (fielder.pitcher || this.fullHandler.runHandler.runner.targetStar === this.ballFielderIdx)) {
                const me = this.fullHandler;
                AnimationHelpers.StartScrollText("SAFE!", function() { me.SafeBall(); });
                return;
            }
            let lowestDistance = -1;
            this.fielders.forEach((fielder, i) => {
                const dx = fielder.x - runner.x, dy = fielder.y - runner.y;
                const magnitude = Math.sqrt(dx * dx + dy * dy);
                if(magnitude < lowestDistance || lowestDistance < 0) {
                    lowestDistance = magnitude;
                    this.targetFielderIdx = i;
                }
            });
        } else { // runner is still one with the ball
            const me = this.fullHandler;
            AnimationHelpers.StartScrollText("OUT!", function() { me.CatchOut(); });
        }
    }
    BonkyOut(slamDunk) {
        const me = this.fullHandler;
        AnimationHelpers.StartScrollText((slamDunk ? "SLAM DUNK!  " : "") + "OUT!", function() { me.CatchOut(); });
    }
    MoveFielders(dx, dy) {
        const speed = 5;
        this.fielders.forEach(f => {
            f.Move(speed * dx, speed * dy);
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
        this.fielders.forEach((f, i) => {
            const d = Dist(runner.x, runner.y, f.x, f.y);
            if((minDist < 0 || d < minDist) && i !== this.ballFielderIdx) {
                minDist = d;
                this.targetFielderIdx = i;
            }
        });
    }
    TargetRunnerIncludeHolder() {
        let minDist = -1;
        const runner = this.fullHandler.runner;
        this.fielders.forEach((f, i) => {
            const d = Dist(runner.x, runner.y, f.x, f.y);
            if((minDist < 0 || d < minDist)) {
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
            if(this.dunked) { return; } // can't dunk twice in one round!
            this.slamDunkIdx = this.ballFielderIdx;
            this.dunked = true;
        } else {
            this.fielders[this.ballFielderIdx].ThrowBall(this.fielders[this.targetFielderIdx]);
            this.fullHandler.SwitchFielderFreeMovement(true);
            this.ballFielderIdx = -1;
            this.targetFielderIdx = -1;
        }
    }
    KeyPress(key) {
        let dx = 0, dy = 0, confirm = false;
        switch(key) {
            case this.myControls.pause: 
            case this.myControls.confirm: confirm = true; break;
            case this.myControls.up: dy -= 1; break;
            case this.myControls.down: dy += 1; break;
            case this.myControls.left: dx -= 1; break;
            case this.myControls.right: dx += 1; break;
        }
        if(this.ballFielderIdx < 0) { // moving
            if(dx !== 0 || dy !== 0) { this.MoveFielders(dx, dy); }
        } else { // throwing ball
            if(dy === -1) { this.TargetRunner(); }
            else if(dy === 1) { this.TargetPitcher(); }
            else if(dx !== 0) { this.AimForNextFielder(dx); }
            if(confirm) { this.ThrowBall(); }
        }
    }
    Update() {
        const ballPos = vecm2p(this.fullHandler.ball.GetWorldCenter());
        const someoneHasBall = this.fielders.some(e => e.ball !== null);
        this.fielders.forEach(f => {
            if(!someoneHasBall) {
                const mult = 0.5;
                const angle = Math.atan2(ballPos.y - f.y, ballPos.x - f.x);
                f.Move(mult * Math.cos(angle), mult * Math.sin(angle));
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
            gfx.DrawCenteredSpriteToCameras("f_UI_clamp", "sprites", 8, 3, prevFielder.x - 8, prevFielder.y - 24, "overlay", 32, scale);
            gfx.DrawCenteredSpriteToCameras("f_UI_clamp", "sprites", 9, 3, nextFielder.x - 8, nextFielder.y - 24, "overlay", 32, scale);
            if(targ === this.ballFielderIdx) {
                gfx.DrawCenteredSpriteToCameras("f_UI_clamp", "sprites", 10, this.dunked ? 0 : 1, currFielder.x - 8, currFielder.y - 24, "overlay", 32, 2 * scale);
            } else {
                gfx.DrawCenteredSpriteToCameras("f_UI_clamp", "sprites", 9, 1, currFielder.x - 8, currFielder.y - 24, "overlay", 32, 2 * scale);
            }
        }
    }
    DrawInfoUI() {
        const prefix = this.team.GetLayerPrefix();
        if(prefix === null) { return; }
        const layer = prefix + "text";
        if(this.ballFielderIdx < 0) {
            const cx = 320, cy = 45;
            gfx.DrawCenteredSprite("sprites", 12, 1, cx, cy, layer, 32, 1);
            gfx.DrawCenteredSprite("sprites", 14, 1, cx + 32, cy, layer, 32, 1);
            gfx.DrawCenteredSprite("sprites", 11, 1, cx + 64, cy, layer, 32, 1);
            gfx.DrawCenteredSprite("sprites", 13, 1, cx + 96, cy, layer, 32, 1);
            gfx.WriteEchoPlayerText("Move", cx + 128, cy + 5, 100, layer, "#FFFFFF", "#BA66FF", 16, "left");
        } else {
            const cx = 185, cx2 = 440, cy = 30;
            gfx.DrawCenteredSprite("sprites", 14, 1, cx, cy, layer, 32, 1);
            gfx.DrawCenteredSprite("sprites", 13, 1, cx + 32, cy, layer, 32, 1);
            gfx.WriteEchoPlayerText("Cycle Targets", cx + 64, cy + 5, 300, layer, "#FFFFFF", "#BA66FF", 16, "left");
            
            gfx.DrawCenteredSprite("sprites", 12, 1, cx + 16, cy + 32, layer, 32, 1);
            gfx.WriteEchoPlayerText("Target Runner", cx + 64, cy + 37, 300, layer, "#FFFFFF", "#BA66FF", 16, "left");

            if(this.targetFielderIdx === this.ballFielderIdx) {
                if(!this.dunked) {
                    gfx.DrawCenteredSprite("sprites", 11, 2, cx2, cy, layer, 32, 1);
                    gfx.WriteEchoPlayerText("Slam Dunk", cx2 + 32, cy + 5, 300, layer, "#FFFFFF", "#BA66FF", 16, "left");
                }
            } else {
                gfx.DrawCenteredSprite("sprites", 11, 2, cx2, cy, layer, 32, 1);
                gfx.WriteEchoPlayerText("Throw Ball", cx2 + 32, cy + 5, 300, layer, "#FFFFFF", "#BA66FF", 16, "left");
            }

            gfx.DrawCenteredSprite("sprites", 11, 1, cx2, cy + 32, layer, 32, 1);
            gfx.WriteEchoPlayerText("Target Pitcher", cx2 + 32, cy + 37, 300, layer, "#FFFFFF", "#BA66FF", 16, "left");
        }
    }
}