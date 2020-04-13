class BatHandler extends SecondaryHandler {
    ready = false; // ready to swing
    state = 0; // 0 = direction, 1 = power, 2 = moving, 3 = swinging
    dir = 0; power = 0; // for setting swing (dir between -5 and 5, power between 0 and 12)
    dx = 0; // position
    swingState = 0; // for swinging
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
            }
        }
        if(this.state === 3 && !this.team.isPlayerControlled) {
            BaseStar.cpu.TrySwing();
        }
    }
    AnimUpdate() {
        const batHandlerX = 240, batHandlerY = 360;
        if(this.team.isPlayerControlled) {
            gfx.DrawMapCharacter(batHandlerX, batHandlerY, { x: 0, y: 0 }, "batmeter", 128, 128, "interface", 0, 0);
            const offset = Math.round(35 * Math.sin(this.dirCursorCounter));
            gfx.DrawSprite("sprites", ((--this.dirCursorFlicker > 0 && this.dirCursorFlicker % 2 === 0) ? 3 : 2), 1, batHandlerX + 48 + offset, batHandlerY + 73, "interface");
            if(this.power > 0) {
                const pow = Math.max(0, Math.floor(this.power) - 1);
                if(pow > 6) {
                    gfx.DrawSprite("sprites", 3 + ((pow - 6) % 5), 6 + Math.floor((pow - 6) / 5), batHandlerX + 60, batHandlerY + 14, "interface");
                }
                if(pow < 10) {
                    gfx.DrawSprite("sprites", 3 + (pow % 5), 4 + Math.floor(pow / 5), batHandlerX + 60, batHandlerY + 46, "interface");
                } else {
                    gfx.DrawSprite("sprites", 4 + pow - 10, 7, batHandlerX + 60, batHandlerY + 46, "interface");
                }
            }
        }
        gfx.DrawSprite(this.team.name, this.swingState, 0, 250 + this.dx, 300, "interface", 64);
    }
}