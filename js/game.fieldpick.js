class FieldPickHandler extends Handler {
    state = 0; // 0 = selecting constellation, 1 = placing outfielders, 2 = confirm
    constsel = 0; totalOutfielders = 0;
    outfielders = []; ofx = 0; ofy = 0;
    scale = 0.32; maxY = 0;
    leftx = 0; rightx = 0; topy = 0; bottomy = 0;
    boundsMult = 1.5;
    constructor() {
        super();
        this.team = BaseStar.data.GetFieldTeam();
        this.myControls = this.team.GetControls();
    }
    CleanUp() { gfx.ClearSome(["interface", "text"]); }
    KeyPress(key) {
        switch(key) {
            case this.myControls.cancel: return this.Cancel();
            case this.myControls.pause: 
            case this.myControls.confirm: return this.Confirm();
            case this.myControls.left: 
                if(this.state === 0) {
                    this.constsel = Math.max(0, this.constsel - 1);
                } else {
                    this.MoveOutfielder(-1, 0);
                }
                break;  
            case this.myControls.right:
                if(this.state === 0) {
                    this.constsel = Math.min(2, this.constsel + 1);
                } else {
                    this.MoveOutfielder(1, 0);
                }
                break;
            case this.myControls.up: return this.MoveOutfielder(0, -1);
            case this.myControls.down: return this.MoveOutfielder(0, 1);
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
        } else {
            game.Transition(TeamSelection, []);
        }
    }
    Confirm() {
        if(this.state === 0) {
            this.state = 1;
            const c = ConstellationInfo[this.team.GetConstellations()[this.constsel]];
            this.totalOutfielders = 20 - c.stars.length;
            const scaleInfo = this.DrawConstellation(c, 320, 365);
            this.scale = scaleInfo.scale;
            this.maxY = scaleInfo.maxy;
            while(((Math.max(1000, this.maxY) * this.scale) * this.boundsMult) > 284) {
                this.scale -= 0.01;
            }
            const w = (1000 * this.boundsMult) * this.scale, h = ((Math.max(1000, this.maxY) * this.scale) * this.boundsMult) / 2;
            this.leftx = -w / 2;
            this.x0 = -500 * this.scale;
            this.y0 = -(this.maxY * this.scale) / 2;
            this.rightx = w;
            this.topy = -h;
            this.bottomy = h;
            this.AddOutfielder(true);
        } else if(this.state === 1) {
            this.AddOutfielder(false);
        } else {
            const x0 = -500 * this.scale;
            const y0 = -(this.maxY * this.scale) / 2;
            
            const me = this;
            BaseStar.FieldSetupComplete(this.team.GetConstellations()[this.constsel], this.outfielders.map(o => ({
                x: (o.x - x0) / me.scale,
                y: (o.y - y0) / me.scale
            })));
        }
    }
    MoveOutfielder(dx, dy) {
        this.ofx += 10 * dx;
        this.ofy += 10 * dy;
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
            this.ofx = RandRange(this.leftx, this.rightx);
            this.ofy = RandRange(this.topy, this.bottomy);
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
            gfx.WriteOptionText("Place your Outfielders", 320, 64, "text", "#FFFFFF", 24);
            gfx.WriteEchoOptionText(`Remaining Outfielders: ${this.totalOutfielders - this.outfielders.length}`, 320, 180, "text", "#FFFFFF", "#BA66FF", 16);
        } else {
            gfx.WriteOptionText("Is this OK?", 320, 64, "text", "#FFFFFF", 24);
            gfx.WriteOptionText("Press CONFIRM button or CANCEL button.", 320, 180, "text", "#FFFFFF", 24);
        }

        const c = ConstellationInfo[this.team.GetConstellations()[this.constsel]];
        const cx = 320, cy = 120;
        gfx.DrawCenteredSprite("constellations", c.hx, c.hy, cx, cy, "interface", 128, 0.5);
        gfx.DrawCenteredSprite("bigsprites", 0, 0, cx, cy, "interface", 128, 0.5);
        
        const w = (1000 * this.boundsMult) * this.scale;
        const csx = 320 - w / 4, csy = 340;
        this.DrawConstellation(c, csx, csy, this.scale, 0.5);
        gfx.DrawLineToCameras(csx + this.leftx, csy + this.topy, csx + this.rightx, csy + this.topy, "#00FF00", "interface");
        gfx.DrawLineToCameras(csx + this.leftx, csy + this.bottomy, csx + this.rightx, csy + this.bottomy, "#00FF00", "interface");
        gfx.DrawLineToCameras(csx + this.leftx, csy + this.topy, csx + this.leftx, csy + this.bottomy, "#00FF00", "interface");
        gfx.DrawLineToCameras(csx + this.rightx, csy + this.topy, csx + this.rightx, csy + this.bottomy, "#00FF00", "interface");

        this.outfielders.forEach(o => {
            gfx.DrawCenteredSprite("baseballers", 6, 1, csx + o.x, csy + o.y, "interface", 64, 0.5);
        });
        
        if(this.state === 1) {
            gfx.DrawCenteredSprite("baseballers", 6, 1, csx + this.ofx, csy + this.ofy, "interface", 64, 0.5);
            if(this.ofy < this.bottomy) { gfx.DrawCenteredSprite("sprites", 11, 1, csx + this.ofx, csy + this.ofy + 16, "interface", 32, 0.75); }
            if(this.ofy > this.topy) { gfx.DrawCenteredSprite("sprites", 12, 1, csx + this.ofx, csy + this.ofy - 16, "interface", 32, 0.75); }
            if(this.ofx < this.rightx) { gfx.DrawCenteredSprite("sprites", 13, 1, csx + this.ofx + 16, csy + this.ofy, "interface", 32, 0.75); }
            if(this.ofx > this.leftx) { gfx.DrawCenteredSprite("sprites", 14, 1, csx + this.ofx - 16, csy + this.ofy, "interface", 32, 0.75); }
        }
    }
    DrawConstellationSelection() {
        gfx.WriteOptionText(this.team.name, 320, 32, "text", "#FFFFFF", 24);
        gfx.WriteOptionText("Select a Constellation", 320, 64, "text", "#FFFFFF", 24);
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
        gfx.WriteEchoOptionText(`Outfielders: ${20 - c.stars.length}`, 320, textY, "text", "#FFFFFF", "#BA66FF", 16);
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
            gfx.DrawCenteredSpriteToCameras("star", "sprites", star.power, 0, csx + star.x * scale, csy + star.y * scale, "interface", 32, starScale);
        });

        return { scale: scale, maxy: maxy };
    }
}