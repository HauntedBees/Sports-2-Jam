function GetDebugFunkoPop() {
    const fph = new FieldPickHandler();
    const cs = fph.team.GetConstellations();
    fph.constsel = Math.floor(Math.random() * 3);
    let i = 0;
    while(cs[fph.constsel] === "" && ++i < 5) {
        fph.constsel = (fph.constsel + 1) % 3;
        console.log("redo");
    }
    fph.Confirm();
    const x0 = -500 * fph.scale, y0 = -(fph.maxY * fph.scale) / 2;
    BaseStar.FieldSetupComplete(cs[fph.constsel], [
        {x: -7, y: -37},
        {x: 134, y: -18},
        {x: 197, y: 53},
        {x: 10, y: 81},
        {x: 63, y: 19},
        {x: 226, y: -94},
        {x: -86, y: 68},
        {x: -1, y: -90},
        {x: 144, y: -98},
        {x: -56, y: -92},
        {x: 117, y: 93},
        {x: 16, y: 28},
        {x: 57, y: -91},
        {x: 217, y: 1},
        {x: 236, y: -57}
    ], {
        x: (fph.leftx - x0) / fph.scale,
        y: (fph.topy - y0) / fph.scale,
        w: (fph.rightx - fph.leftx) / fph.scale,
        h: (fph.bottomy - fph.topy) / fph.scale
    });
}
class FieldPickHandler extends Handler {
    state = 0; // 0 = selecting constellation, 1 = placing outfielders, 2 = confirm
    constsel = 0; totalOutfielders = 0;
    outfielders = []; ofx = 0; ofy = 0;
    scale = 0.32; maxY = 0;
    leftx = 0; rightx = 0; topy = 0; bottomy = 0;
    noZoneLeft = 0; noZoneRight = 0; noZoneTop = 0; noZoneBottom = 0;
    boundsMult = 1; boundShift = 1000;
    constructor() {
        super();
        this.team = BaseStar.data.GetFieldTeam();
        this.myControls = this.team.GetControls();
        if(!this.team.isPlayerControlled) {
            BaseStar.cpu.PickConstellationAndPlaceOutfielders(this, false);
        }
    }
    CleanUp() { gfx.ClearSome(["interface", "text"]); }
    KeyPress(key) {
        switch(key) {
            case this.myControls["cancel"]: return this.Cancel();
            case this.myControls["confirm"]: return this.Confirm();
            case this.myControls["left"]: 
                if(this.state === 0) {
                    this.constsel = Math.max(0, this.constsel - 1);
                } else {
                    this.MoveOutfielder(-1, 0);
                }
                break;  
            case this.myControls["right"]:
                if(this.state === 0) {
                    this.constsel = Math.min(2, this.constsel + 1);
                } else {
                    this.MoveOutfielder(1, 0);
                }
                break;
            case this.myControls["up"]: return this.MoveOutfielder(0, -1);
            case this.myControls["down"]: return this.MoveOutfielder(0, 1);
        }
    }
    Cancel() {
        if(this.state > 0) {
            if(this.outfielders.length === 0) {
                this.state = 0;
            } else {
                const o = this.outfielders.pop();
                this.ofx = o.x;
                this.ofy = o.y;
                this.state = 1;
            }
        }
    }
    Confirm() {
        if(this.state === 0) {
            this.state = 1;
            const constellationName = this.team.GetConstellations()[this.constsel];
            const c = ConstellationInfo[constellationName];
            this.totalOutfielders = 20 - c.stars.length - 1;
            SpeakHandler.Speak(`The ${this.team.LastName()} choose ${constellationName}. ${miscFillers[RandRange(0, 10)]}`);
            this.SetBounds(c);
            this.AddOutfielder(true);
            return false;
        } else if(this.state === 1) {
            this.AddOutfielder(false);
            return false;
        } else {
            this.FinishFieldSetup();
            return true;
        }
    }
    SetBounds(constellationInfo) {
        const scaleInfo = this.DrawConstellation(constellationInfo, 320, 365);
        this.scale = scaleInfo.scale;
        this.maxY = scaleInfo.maxy;
        while(((Math.max(this.boundShift, this.maxY) * this.scale) * this.boundsMult) > 284) {
            this.scale -= 0.01;
        }
        const w = (this.boundShift * this.boundsMult) * this.scale, h = (this.maxY * 1.25 * this.scale * this.boundsMult) / 2;
        this.leftx = -w / 2 - 200 * this.scale;
        this.x0 = -500 * this.scale;
        this.y0 = -(this.maxY * this.scale) / 2;
        this.rightx = w * 0.75;
        this.topy = -h;
        this.bottomy = h;
        const dx = this.rightx - this.leftx;
        const dy = this.bottomy - this.topy;
        this.noZoneLeft = this.leftx;
        this.noZoneTop = this.topy + dy / 3;
        this.noZoneBottom = this.topy + dy * 2 / 3;
        this.noZoneRight = this.leftx + 15 * this.scale + dx / 4;
    }
    FinishFieldSetup() {
        const x0 = -500 * this.scale;
        const y0 = -(this.maxY * this.scale) / 2;
        BaseStar.FieldSetupComplete(this.team.GetConstellations()[this.constsel], this.outfielders.map(o => ({
            x: (o.x - x0) / this.scale,
            y: (o.y - y0) / this.scale
        })), {
            x: (this.leftx - x0) / this.scale,
            y: (this.topy - y0) / this.scale,
            w: (this.rightx - this.leftx) / this.scale,
            h: (this.bottomy - this.topy) / this.scale
        });
    }
    MoveOutfielder(dx, dy) {
        let newX = this.ofx + 10 * dx, newY = this.ofy + 10 * dy;
        if(InRect(newX, newY, this.noZoneLeft, this.noZoneRight, this.noZoneTop, this.noZoneBottom)) { return; }
        this.ofx = newX;
        this.ofy = newY;
        if(this.ofx > this.rightx) { this.ofx = this.rightx; }
        else if(this.ofx < this.leftx) { this.ofx = this.leftx  ; }
        if(this.ofy > this.bottomy) { this.ofy = this.bottomy; }
        else if(this.ofy < this.topy) { this.ofy = this.topy  ; }
    }
    AddOutfielder(first) {
        if(!first) { this.outfielders.push({ x: this.ofx, y: this.ofy }); }
        if((this.totalOutfielders - this.outfielders.length) === 0) {
            this.state = 2;
        } else {
            let attempts = 5;
            let nx = RandRange(this.leftx, this.rightx), ny = RandRange(this.topy, this.bottomy);
            while(InRect(nx, ny, this.noZoneLeft, this.noZoneRight, this.noZoneTop, this.noZoneBottom) && --attempts > 0) {
                nx = RandRange(this.leftx, this.rightx);
                ny = RandRange(this.topy, this.bottomy);
            }
            if(attempts === 0 && InRect(nx, ny, this.noZoneLeft, this.noZoneRight, this.noZoneTop, this.noZoneBottom)) {
                nx = this.rightx;
                ny = this.topy;
            }
            this.ofx = nx;
            this.ofy = ny;
        }
    }
    Update() { }
    AnimUpdate() {
        gfx.ClearLayer("text");
        if(this.state === 0) {
            this.DrawConstellationSelection();
        } else {
            this.DrawOutfielderSection();    
        }
    }
    DrawOutfielderSection() {
        gfx.WriteOptionText(this.team.name, 320, 32, "text", "#FFFFFF", 24);
        if(this.state === 1) {
            if(this.team.isPlayerControlled) {
                gfx.WriteOptionText("Place your Wanderers", 320, 64, "text", "#FFFFFF", 24);
            } else {
                gfx.WriteOptionText("are placing their Wanderers", 320, 64, "text", "#FFFFFF", 24);
            }
            gfx.WriteEchoOptionText(`Remaining Wanderers: ${this.totalOutfielders - this.outfielders.length}`, 320, 180, "text", "#FFFFFF", "#BA66FF", 16);
        } else {
            if(this.team.isPlayerControlled) {
                gfx.WriteOptionText("Is this OK?", 320, 64, "text", "#FFFFFF", 24);
                gfx.WriteOptionText("Press CONFIRM button or CANCEL button.", 320, 180, "text", "#FFFFFF", 24);
            } else {
                gfx.WriteOptionText("are finalizing their choices", 320, 64, "text", "#FFFFFF", 24);
            }
        }

        const c = ConstellationInfo[this.team.GetConstellations()[this.constsel]];
        const cx = 320, cy = 120;
        gfx.DrawCenteredSprite("constellations", c.hx, c.hy, cx, cy, "interface", 128, 0.5);
        gfx.DrawCenteredSprite("bigsprites", 0, 0, cx, cy, "interface", 128, 0.5);
        
        const w = (this.boundShift * this.boundsMult) * this.scale;
        const csx = 383 - w / 4, csy = 340;
        this.DrawConstellation(c, csx, csy, this.scale, 0.5);
        // borders
        gfx.DrawLineToCameras(csx + this.leftx, csy + this.topy, csx + this.rightx, csy + this.topy, "#00FF00", "interface");
        gfx.DrawLineToCameras(csx + this.leftx, csy + this.bottomy, csx + this.rightx, csy + this.bottomy, "#00FF00", "interface");
        gfx.DrawLineToCameras(csx + this.leftx, csy + this.topy, csx + this.leftx, csy + this.bottomy, "#00FF00", "interface");
        gfx.DrawLineToCameras(csx + this.rightx, csy + this.topy, csx + this.rightx, csy + this.bottomy, "#00FF00", "interface");
        // no placement zone
        gfx.DrawLineToCameras(csx + this.noZoneLeft, csy + this.noZoneTop, csx + this.noZoneRight, csy + this.noZoneTop, "#FF0000", "interface");
        gfx.DrawLineToCameras(csx + this.noZoneLeft, csy + this.noZoneBottom, csx + this.noZoneRight, csy + this.noZoneBottom, "#FF0000", "interface");
        gfx.DrawLineToCameras(csx + this.noZoneLeft, csy + this.noZoneTop, csx + this.noZoneLeft, csy + this.noZoneBottom, "#FF0000", "interface");
        gfx.DrawLineToCameras(csx + this.noZoneRight, csy + this.noZoneTop, csx + this.noZoneRight, csy + this.noZoneBottom, "#FF0000", "interface");

        this.outfielders.forEach(o => {
            gfx.DrawCenteredSprite(this.team.name, 0, 8, csx + o.x, csy + o.y, "interface", 64, 0.5);
            gfx.DrawCenteredSprite("baseballers", 4, 8, csx + o.x, csy + o.y, "interface", 64, 0.5);
        });
        
        if(this.state === 1) {
            gfx.DrawCenteredSprite(this.team.name, 0, 8, csx + this.ofx, csy + this.ofy, "interface", 64, 0.5);
            gfx.DrawCenteredSprite("baseballers", 4, 8, csx + this.ofx, csy + this.ofy, "interface", 64, 0.5);
            if(this.ofy < this.bottomy) { gfx.DrawCenteredSprite("sprites", 11, 1, csx + this.ofx, csy + this.ofy + 16, "interface", 32, 0.75); }
            if(this.ofy > this.topy) { gfx.DrawCenteredSprite("sprites", 12, 1, csx + this.ofx, csy + this.ofy - 16, "interface", 32, 0.75); }
            if(this.ofx < this.rightx) { gfx.DrawCenteredSprite("sprites", 13, 1, csx + this.ofx + 16, csy + this.ofy, "interface", 32, 0.75); }
            if(this.ofx > this.leftx) { gfx.DrawCenteredSprite("sprites", 14, 1, csx + this.ofx - 16, csy + this.ofy, "interface", 32, 0.75); }
        }
    }
    DrawConstellationSelection() {
        gfx.WriteOptionText(this.team.name, 320, 32, "text", "#FFFFFF", 24);
        if(this.team.isPlayerControlled) {
            gfx.WriteOptionText("Select a Constellation", 320, 64, "text", "#FFFFFF", 24);
        } else {
            gfx.WriteOptionText("are selecting a Constellation", 320, 64, "text", "#FFFFFF", 24);
        }
        const constellations = this.team.GetConstellations();
        const cx = 180, cy = 160, csel = this.constsel;
        constellations.forEach((name, i) => {
            const c = ConstellationInfo[name];
            if(c === undefined) { return; }
            gfx.DrawCenteredSprite("constellations", c.hx, c.hy, cx + 140 * i, cy, "interface", 128, 1);
            if(csel === i) {
                gfx.WriteEchoOptionText(name, cx + 140 * i, cy + 85, "text", "#FFFF00", "#BA6600", 16);
                gfx.DrawCenteredSprite("bigsprites", 0, 0, cx + 140 * i, cy, "interface", 128, 1);
            } else {
                gfx.WriteEchoOptionText(name, cx + 140 * i, cy + 85, "text", "#FFFFFF", "#BA66FF", 16);
            }
        });
        const c = ConstellationInfo[constellations[this.constsel]];
        const textY = 265;
        gfx.WriteEchoOptionText(`Stars: ${c.stars.length}`, 160, textY, "text", "#FFFFFF", "#BA66FF", 16);
        gfx.WriteEchoOptionText(`Wanderers: ${20 - c.stars.length - 1}`, 320, textY, "text", "#FFFFFF", "#BA66FF", 16);
        gfx.WriteEchoOptionText(`Gravity: ${c.stars.reduce((a, b) => a + b.power, 0)}`, 480, textY, "text", "#FFFFFF", "#BA66FF", 16);
        this.DrawConstellation(c, 320, 380);
    }
    DrawConstellation(c, cx, cy, forceScale, starScale) {
        starScale = starScale || 1;
        let maxy = 0;
        c.stars.forEach(star => {
            if(star.y > maxy) { maxy = star.y; }
        });
        let scale = forceScale || 0.32;
        while(!forceScale && maxy * scale > 180) { scale -= 0.01; }

        const csx = cx - (500 * scale), csy = cy - (maxy * scale) / 2;
        c.connections.forEach(e => {
            const star1 = c.stars[e[0]], star2 = c.stars[e[1]];
            gfx.DrawLineToCameras(csx + scale * star1.x, csy + scale * star1.y, csx + scale * star2.x, csy + scale * star2.y, "#0000FF", "interface");
        });
        c.stars.forEach(star => {
            gfx.DrawCenteredSpriteToCameras("star", "sprites", star.power, 0, csx + star.x * scale, csy + star.y * scale, "interface", 32, starScale * 0.5);
        });

        return { scale: scale, maxy: maxy };
    }
}