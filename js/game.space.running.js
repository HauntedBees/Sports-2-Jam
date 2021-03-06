class RunHandler extends SecondaryHandler {
    /** @param {Team} team @param {FieldRunHandler} fieldRunHandler @param {Runner} runner @param {Runner[]} onBaseRunners @param {any} ball */
    constructor(team, fieldRunHandler, runner, onBaseRunners, ball) {
        super(team);
        this.fullHandler = fieldRunHandler;
        this.runner = runner;
        this.onBaseRunners = onBaseRunners;
        this.ball = ball;
        this.animCounter = Math.floor(Math.random() * 100);
    }
    Confirm() {
        if(this.runner.ball !== null) {
            this.runner.JumpOffBall(this.onBaseRunners.map(e => e.targetStar));
        } else if(this.IsSafe()) {
            const me = this.fullHandler;
            AnimationHelpers.StartScrollText("SAFE!", function() { me.SafeBall(); });
        } else {
            Sounds.PlaySound("explosion");
            this.runner.Dash();
        }
    }
    IsSafe() { return this.runner.onBase && this.onBaseRunners.every(e => e.onBase); }
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
        Sounds.PlaySound("switch_02");
        const newRunner = this.onBaseRunners.shift();
        this.onBaseRunners.push(this.runner);
        this.runner = newRunner;
        BaseStar.cameras[0].SwitchFocus(this.runner, false);
    }
    KeyPress(key) {
        switch(key) {
            case this.myControls["confirm"]: return this.Confirm();
            case this.myControls["left"]: return this.AimForNextStar(-1);
            case this.myControls["right"]: return this.AimForNextStar(1);
            case this.myControls["up"]: return this.TargetClosestBase();
            case this.myControls["cancel"]: return this.SwitchRunner();
        }
    }
    Update() {
        this.runner.Update();
        this.runner.SyncCollider();
        if(this.runner.onBase && this.fullHandler.pitcher.ball !== null) {
            const me = this.fullHandler;
            AnimationHelpers.StartScrollText("SAFE!", function() { me.SafeBall(); });
            return;
        }
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
            gfx.DrawClampedSpriteToCameras("r_UI", "sprites", 8, 2, 11, 3, prevStar.x + 8, prevStar.y - 32, "overlay", 32, scale);
            gfx.DrawClampedSpriteToCameras("r_UI", "sprites", 9, 2, 11, 3, nextStar.x + 8, nextStar.y - 32, "overlay", 32, scale);
            if(this.runner.onBase) {
                gfx.DrawClampedSpriteToCameras("r_UI", "sprites", 9, 0, 11, 3, currStar.x + 8, currStar.y - 32, "overlay", 32, scale);
                gfx.DrawClampedSpriteToCameras("r_UI", "sprites", 10, 2, 11, 3, currStar.x + 8, this.runner.y - 56, "overlay", 32, scale);
            } else {
                gfx.DrawClampedSpriteToCameras("r_UI", "sprites", 8, 1, 11, 3, currStar.x + 8, currStar.y - 32, "overlay", 32, 2 * scale);
                gfx.DrawClampedSpriteToCameras("r_UI", "sprites", 10, 2, 11, 3, this.runner.x, this.runner.y - 32, "overlay", 32, scale);
            }
        }
    }
    DrawInfoUI() {
        const prefix = this.team.GetLayerPrefix();
        if(prefix === null) { return; }
        const layer = prefix + "text";
        const xInfo = this.fullHandler.GetInfoUIX(this.team.playerNum, false);
        if(this.runner.ball !== null) {
            const cy = 45;
            gfx.DrawCenteredSprite("sprites", 11, 2, xInfo.centerX, cy, layer, 32, 1);
            gfx.WriteEchoPlayerText("Jump Off Sol", xInfo.centerX + 32, cy + 5, 300, layer, "#FFFFFF", "#BA66FF", 16, "left");
        } else {
            const cy = 30;
            gfx.DrawCenteredSprite("sprites", 14, 1, xInfo.leftX, cy, layer, 32, 1);
            gfx.DrawCenteredSprite("sprites", 13, 1, xInfo.leftX + 32, cy, layer, 32, 1);
            gfx.WriteEchoPlayerText("Cycle Targets", xInfo.leftX + 64, cy + 5, 300, layer, "#FFFFFF", "#BA66FF", 16, "left");
            
            gfx.DrawCenteredSprite("sprites", 12, 1, xInfo.leftX + 16, cy + 32, layer, 32, 1);
            gfx.WriteEchoPlayerText("Target Closest", xInfo.leftX + 64, cy + 37, 300, layer, "#FFFFFF", "#BA66FF", 16, "left");

            if(this.IsSafe()) {
                gfx.DrawCenteredSprite("sprites", 11, 2, xInfo.rightX, cy, layer, 32, 1);
                gfx.WriteEchoPlayerText("Finish", xInfo.rightX + 32, cy + 5, 300, layer, "#FFFFFF", "#BA66FF", 16, "left");
            } else if(!this.runner.dashed) {
                gfx.DrawCenteredSprite("sprites", 11, 2, xInfo.rightX, cy, layer, 32, 1);
                gfx.WriteEchoPlayerText("Dash", xInfo.rightX + 32, cy + 5, 300, layer, "#FFFFFF", "#BA66FF", 16, "left");
            }
            if(this.onBaseRunners.length > 0) {
                gfx.DrawCenteredSprite("sprites", 12, 2, xInfo.rightX, cy + 32, layer, 32, 1);
                gfx.WriteEchoPlayerText("Switch Runner", xInfo.rightX + 32, cy + 37, 300, layer, "#FFFFFF", "#BA66FF", 16, "left");
            }
        }
    }
}