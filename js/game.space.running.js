class RunHandler extends SecondaryHandler {
    animCounter = Math.floor(Math.random() * 100);
    /** @param {Team} team @param {FieldRunHandler} fieldRunHandler @param {Runner} runner @param {Runner[]} onBaseRunners @param {any[]} balls */
    constructor(team, fieldRunHandler, runner, onBaseRunners, balls) {
        super(team);
        this.fullHandler = fieldRunHandler;
        this.runner = runner;
        this.onBaseRunners = onBaseRunners;
        this.balls = balls;
    }
    Confirm() {
        if(this.runner.ball !== null) {
            this.runner.JumpOffBall(this.onBaseRunners.map(e => e.targetStar));
        } else if(this.runner.atBase && this.onBaseRunners.every(e => e.atBase)) {
            const me = this.fullHandler;
            AnimationHelpers.StartScrollText("SAFE!", function() { me.SafeBall(); });
        } else {
            this.runner.Dash();
        }
    }
    AimForNextStar(dir) {
        if(this.runner.ball !== null) { return; }
        const len = this.runner.stargets.length;
        let nextidx = (this.runner.targetStar + dir + len) % len;
        while(this.onBaseRunners.some(e => e.targetStar === nextidx)) {
            nextidx = (nextidx + dir + len) % len
        }
        this.runner.MoveToStar(nextidx);
    }
    TargetClosestBase() {
        this.runner.JumpOffBall(this.onBaseRunners.map(e => e.targetStar));
    }
    SwitchRunner() {
        if(this.onBaseRunners.length === 0) { return; }
        const newRunner = this.onBaseRunners.shift();
        this.onBaseRunners.push(this.runner);
        this.runner = newRunner;
        BaseStar.cameras[0].SwitchFocus(this.runner);
    }
    KeyPress(key) {
        switch(key) {
            case this.myControls.pause: 
            case this.myControls.confirm: return this.Confirm();
            case this.myControls.left: return this.AimForNextStar(-1);
            case this.myControls.right: return this.AimForNextStar(1);
            case this.myControls.up: return this.TargetClosestBase();
            case this.myControls.cancel: return this.SwitchRunner();
        }
    }
    Update() {
        this.runner.Update();
        this.runner.SyncCollider();
        this.animCounter += 0.1;
        if(this.animCounter > 100) {
            this.animCounter = 0;
        }
        this.onBaseRunners.forEach(e => {
            e.Update();
            e.SyncCollider();
        });
        if(!this.team.isPlayerControlled) { BaseStar.cpu.HandleRun(); }
    }
    AnimUpdate() {
        this.DrawInfoUI();
        this.runner.Draw();
        this.onBaseRunners.forEach(e => e.Draw());
        if(this.runner.targetStar >= 0) {
            const targ = this.runner.targetStar;
            const stars = this.runner.stargets, len = this.runner.stargets.length;
            const currStar = stars[targ];
            const prevStar = stars[(targ - 1 + len) % len];
            const nextStar = stars[(targ + 1) % len];
            const scale = 1 + Math.sin(this.animCounter) / 4;
            gfx.DrawCenteredSpriteToCameras("r_UI", "sprites", 8, 2, prevStar.x + 8, prevStar.y - 24, "overlay", 32, scale);
            gfx.DrawCenteredSpriteToCameras("r_UI", "sprites", 9, 2, nextStar.x + 8, nextStar.y - 24, "overlay", 32, scale);
            if(this.runner.atBase) {
                gfx.DrawCenteredSpriteToCameras("r_UI", "sprites", 9, 0, currStar.x + 8, currStar.y - 24, "overlay", 32, scale);
                gfx.DrawCenteredSpriteToCameras("r_UI", "sprites", 10, 2, currStar.x + 8, this.runner.y - 48, "overlay", 32, scale);
            } else {
                gfx.DrawCenteredSpriteToCameras("r_UI", "sprites", 8, 1, currStar.x + 8, currStar.y - 24, "overlay", 32, 2 * scale);
                gfx.DrawCenteredSpriteToCameras("r_UI", "sprites", 10, 2, this.runner.x, this.runner.y - 24, "overlay", 32, scale);
            }
        }
    }
    DrawInfoUI() {
        const prefix = this.team.GetLayerPrefix();
        if(prefix === null) { return; }
        const layer = prefix + "text";
        if(this.runner.ball !== null) {
            const cx = 320, cy = 45;
            gfx.DrawCenteredSprite("sprites", 11, 2, cx, cy, layer, 32, 1);
            gfx.WriteEchoPlayerText("Jump Off Ball", cx + 32, cy + 5, 300, layer, "#FFFFFF", "#BA66FF", 16, "left");
        } else {
            const cx = 185, cx2 = 440, cy = 30;
            gfx.DrawCenteredSprite("sprites", 14, 1, cx, cy, layer, 32, 1);
            gfx.DrawCenteredSprite("sprites", 13, 1, cx + 32, cy, layer, 32, 1);
            gfx.WriteEchoPlayerText("Cycle Targets", cx + 64, cy + 5, 300, layer, "#FFFFFF", "#BA66FF", 16, "left");
            
            gfx.DrawCenteredSprite("sprites", 12, 1, cx + 16, cy + 32, layer, 32, 1);
            gfx.WriteEchoPlayerText("Target Closest", cx + 64, cy + 37, 300, layer, "#FFFFFF", "#BA66FF", 16, "left");

            if(this.runner.atBase && this.onBaseRunners.every(e => e.atBase)) {
                gfx.DrawCenteredSprite("sprites", 11, 2, cx2, cy, layer, 32, 1);
                gfx.WriteEchoPlayerText("Finish", cx2 + 32, cy + 5, 300, layer, "#FFFFFF", "#BA66FF", 16, "left");
            } else if(!this.runner.dashed) {
                gfx.DrawCenteredSprite("sprites", 11, 2, cx2, cy, layer, 32, 1);
                gfx.WriteEchoPlayerText("Dash", cx2 + 32, cy + 5, 300, layer, "#FFFFFF", "#BA66FF", 16, "left");
            }
            if(this.onBaseRunners.length > 0) {
                gfx.DrawCenteredSprite("sprites", 12, 2, cx2, cy + 32, layer, 32, 1);
                gfx.WriteEchoPlayerText("Switch Runner", cx2 + 32, cy + 37, 300, layer, "#FFFFFF", "#BA66FF", 16, "left");
            }
        }
    }
}