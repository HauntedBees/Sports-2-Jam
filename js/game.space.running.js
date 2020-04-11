BaseStar.Running = {
    myControls: null, isPlayer: false, runner: null, balls: [],
    animCounter: 0,  
    Init: function(c, isPlayer, runner, balls) {
        this.myControls = c;
        this.isPlayer = isPlayer;
        this.runner = runner;
        this.balls = balls;
        this.animCounter = Math.floor(Math.random() * 100);
    },
    AnimUpdate: function() {
        this.runner.Draw();
        if(this.runner.targetStar >= 0 && this.isPlayer) {
            const targ = this.runner.targetStar;
            const stars = this.runner.stargets, len = this.runner.stargets.length;
            const currStar = stars[targ];
            const prevStar = stars[(targ - 1 + len) % len];
            const nextStar = stars[(targ + 1) % len];
            const scale = 1 + Math.sin(this.animCounter) / 4;
            gfx.DrawCenteredSprite("sprites", 8, 2, prevStar.x + 8, prevStar.y - 24, "overlay", 32, scale);
            gfx.DrawCenteredSprite("sprites", 9, 2, nextStar.x + 8, nextStar.y - 24, "overlay", 32, scale);
            if(this.runner.atBase) {
                gfx.DrawCenteredSprite("sprites", 9, 0, currStar.x + 8, currStar.y - 24, "overlay", 32, scale);
            } else {
                gfx.DrawCenteredSprite("sprites", 8, 1, currStar.x + 8, currStar.y - 24, "overlay", 32, 2 * scale);
            }
        }
    },
    Update: function() {
        this.runner.Update();
        this.runner.SyncCollider();
        this.animCounter += 0.1;
        if(this.animCounter > 100) {
            this.animCounter = 0;
        }
    },
    KeyPress: function(key) {
        switch(key) {
            case this.myControls.pause: 
            case this.myControls.confirm:
                this.Confirm();
                break;
            case this.myControls.left: return this.AimForNextStar(-1);
            case this.myControls.right: return this.AimForNextStar(1);
        }
    },
    Confirm: function() {
        if(this.runner.ball !== null) {
            this.runner.JumpOffBall();
        } else {
            this.runner.Dash();
        }
    },
    AimForNextStar: function(dir) {
        const len = this.runner.stargets.length;
        const nextidx = (this.runner.targetStar + dir + len) % len;
        this.runner.MoveToStar(nextidx);
    }
};