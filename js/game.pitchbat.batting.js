class BatHandler extends SecondaryHandler {
    ready = false; // ready to swing
    state = 0; // 0 = direction, 1 = power, 2 = moving, 3 = swinging
    dir = 0; power = 0; // for setting swing (dir between -5 and 5, power between 0 and 12)
    dx = 0; // position
    swingState = 0; swingAnimState = 0; missed = false; // for swinging
    dirCursorCounter = 0; dirCursorFlicker = 0; swingCounter = 0; // animation buddies
    AwaitBall() { this.state = 3; }
    KeyPress(key) {
        switch(key) {
            case this.myControls.pause: 
            case this.myControls.confirm:
                if(this.state === 0) {
                    this.state = 1;
                    this.dir = 5 * Math.sin(this.dirCursorCounter);
                    this.dirCursorFlicker = 20;
                } else if(this.state === 1) {
                    this.state = 2;
                    this.ready = true;
                } else if(this.state === 3) {
                    this.swingCounter = 0;
                    this.state = 4;
                    this.swingState = 1;
                }
                break;
            case this.myControls.left:
                if(this.state === 2 || this.state === 3) { this.dx = Math.max(this.dx - 1, -20); }
                break;
            case this.myControls.right:
                if(this.state === 2 || this.state === 3) { this.dx = Math.min(this.dx + 1, 20); }
                break;
        }
    }
    Update() {
        if(this.state === 0) {
            this.dirCursorCounter += 0.05;
        } else if(this.state === 1) {
            this.power += 0.25;
            if(this.power > 12) { this.power = 0; }
        } else if(this.state === 4) {
            if(this.swingState < 5 && ++this.swingCounter > 3) {
                this.swingCounter = 0;
                this.swingState++;
                if(this.swingAnimState < 4) {
                    this.swingAnimState++;
                }
            }
            if(this.missed && this.swingAnimState === 4) {
                this.swingAnimState++;
            }
        }
        if(this.state === 3 && !this.team.isPlayerControlled) {
            BaseStar.cpu.TrySwing();
        }
    }
    AnimUpdate() {
        const batHandlerX = 320, batHandlerY = 360;
        gfx.DrawRectSprite(this.team.name + "_batter", this.swingAnimState, 0, 220 + this.dx, 100, "text", 145, 335, 0.75);
        if(this.team.isPlayerControlled) {
            gfx.DrawRectSprite("batmeter", 0, 0, batHandlerX, 424, "text", 128, 128, 1, true);
            const offset = Math.round(35 * Math.sin(this.dirCursorCounter));
            gfx.DrawCenteredSprite("sprites", ((--this.dirCursorFlicker > 0 && this.dirCursorFlicker % 2 === 0) ? 3 : 2), 1, batHandlerX + offset, batHandlerY + 89, "text", 32, 1);
            if(this.power > 0) {
                const powerX = batHandlerX - 4;
                const pow = Math.max(0, Math.floor(this.power) - 1);
                if(pow > 6) {
                    gfx.DrawSprite("sprites", 3 + ((pow - 6) % 5), 6 + Math.floor((pow - 6) / 5), powerX, batHandlerY + 14, "text");
                }
                if(pow < 10) {
                    gfx.DrawSprite("sprites", 3 + (pow % 5), 4 + Math.floor(pow / 5), powerX, batHandlerY + 46, "text");
                } else {
                    gfx.DrawSprite("sprites", 4 + pow - 10, 7, powerX, batHandlerY + 46, "text");
                }
            }
        }
    }
}