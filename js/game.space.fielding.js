BaseStar.Fielding = {
    myControls: null, isPlayer: false, fielders: [],
    slamDunkIdx: -1, dunkSpan: 0, dunked: false, 
    ballFielderIdx: -1, targetFielderIdx: -1, animCounter: 0, 
    Init: function(c, isPlayer, fielders) {
        this.myControls = c;
        this.isPlayer = isPlayer;
        this.fielders = fielders;
        this.ballFielderIdx = -1;
        this.targetFielderIdx = -1;
        this.dunkSpan = 0;
        this.dunked = false;
        this.animCounter = Math.floor(Math.random() * 100);
        this.slamDunkIdx = -1;
    },
    AnimUpdate: function() {
        this.fielders.forEach(e => e.Draw());
        if(this.targetFielderIdx >= 0 && this.isPlayer) {
            const targ = this.targetFielderIdx;
            const len = this.fielders.length;
            const currFielder = this.fielders[targ];
            const prevFielder = this.fielders[(targ - 1 + len) % len];
            const nextFielder = this.fielders[(targ + 1) % len];
            const scale = 1 + Math.sin(this.animCounter) / 4;
            gfx.DrawCenteredSprite("sprites", 8, 3, prevFielder.x - 8, prevFielder.y - 24, "overlay", 32, scale);
            gfx.DrawCenteredSprite("sprites", 9, 3, nextFielder.x - 8, nextFielder.y - 24, "overlay", 32, scale);
            if(targ === this.ballFielderIdx) {
                gfx.DrawCenteredSprite("sprites", 10, this.dunked ? 0 : 1, currFielder.x - 8, currFielder.y - 24, "overlay", 32, 2 * scale);
            } else {
                gfx.DrawCenteredSprite("sprites", 9, 1, currFielder.x - 8, currFielder.y - 24, "overlay", 32, 2 * scale);
            }
        }
    },
    Update: function() {
        this.fielders.forEach(e => { 
            e.Update();
            e.SyncCollider();
        });
        this.animCounter += 0.1;
        if(this.animCounter > 100) {
            this.animCounter = 0;
        }
    },
    CatchBall: function(fielder, ball, runner) {
        const ballInfo = ball.GetUserData();
        if(ballInfo.runner === undefined || true) { // catching ball, runner is not connected to ball
            BaseStar.SpaceFly.SwitchFielderFreeMovement(false);
            fielder.CatchBall(ball);
            this.ballFielderIdx = this.fielders.findIndex(e => e === fielder);
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
            // TODO: you're OUT shitheel!
        }
    },
    KeyPress: function(key) {
        let dx = 0, dy = 0, confirm = false;
        switch(key) {
            case this.myControls.pause: 
            case this.myControls.confirm: confirm = true; break;
            case this.myControls.up: dy -= 1; break;
            case this.myControls.down: dy += 1; break;
            case this.myControls.left: dx -= 1; break;
            case this.myControls.right: dx += 1; break;
                break;
        }
        if(this.ballFielderIdx < 0) { // moving
            if(dx !== 0 || dy !== 0) {
                this.MoveFielders(dx, dy);
            }
        } else { // throwing ball
            if(dx !== 0 || dy !== 0) {
                this.AimForNextFielder(dx);
            }
            if(confirm) {
                if(this.targetFielderIdx === this.ballFielderIdx) {
                    if(this.dunked) { return; } // can't dunk twice in one round!
                    this.slamDunkIdx = this.ballFielderIdx;
                    this.dunked = true;
                } else {
                    this.fielders[this.ballFielderIdx].ThrowBall(this.fielders[this.targetFielderIdx]);
                    BaseStar.SpaceFly.SwitchFielderFreeMovement(true);
                    this.ballFielderIdx = -1;
                    this.targetFielderIdx = -1;
                }
            }
        }
    },
    AimForNextFielder: function(dir) {
        const len = this.fielders.length;
        let nextIdx = (this.targetFielderIdx + dir + len) % len;
        this.targetFielderIdx = nextIdx;
    },
    MoveFielders: function(dx, dy) {
        const speed = 5;
        this.fielders.forEach(f => {
            f.x += speed * dx;
            f.y += speed * dy;
        });
    }
};