class Camera {
    /** @param {{ x: number; y: number; }} focus @param {string[]} ignores @param {boolean} visible */
    constructor(focus, ignores, visible) {
        this.cx = 320; this.cy = 240;
        this.offsetx = 0; this.offsety = 0;
        this.visible = visible;
        if(focus === null) {
            this.focusObj = { x: this.cx, y: this.cy };
        } else {
            this.focusObj = focus;
        }
        this.zoom = 1;
        this.forcedLayer = "";
        this.prefix = "";
        this.ignores = ignores;
    }
    /** @param {any} focus @param {boolean} [isB2] */
    SwitchFocus(focus, isB2) {
        // TODO: some sort of smoother transition
        if(isB2) {
            this.isB2 = true;
            this.focusObjB2 = focus;
            this.focusObj = null;
        } else {
            this.isB2 = false;
            this.focusObj = focus;
            this.focusObjB2 = null;
        }
    }
    /** @param {{ x: number; y: number; }} posObj @param {string} type */
    GetPos(posObj, type) {
        // TODO: allow clamping (if something is above the camera, but clamped, draw it anyway at the very top of the screen, perhaps with some indicator)
        const myPos = this.isB2 ? vecm2p(this.focusObjB2.GetWorldCenter()) : this.focusObj;
        if(myPos === null) { 
            return { x: posObj.x, y: posObj.y, ignore: !this.visible || this.ignores.some(e => type.includes(e)) };
        }
        const newX = this.cx + this.zoom * (posObj.x - myPos.x) + this.offsetx;
        const newY = this.cy + this.zoom * (posObj.y - myPos.y) + this.offsety;
        const bounds = this.zoom < 0.5 ? 9999 : 64;// * this.zoom;
        return {
            x: newX, y: newY,
            ignore: !this.visible || this.ignores.some(e => type.includes(e)) || (newX < -bounds || newY < -bounds || newX > (this.cx * 2 + bounds) || newY > (this.cy * 2 + bounds))
        };
    }
    /** @param {{ x: number; y: number; }} posObj @param {string} type */
    GetPosFromMeters(posObj, type) {
        return this.GetPos({ x: m2p(posObj.x), y: m2p(posObj.y) }, type);
    }
}
class MiniMapCamera extends Camera {
    /** @param {{ x: number; y: number; }} focus */
    constructor(focus) {
        super(focus, ["UI", "debug"], true);
        this.zoom = 0.2;
        this.focusObj = { x: 320 * this.zoom, y: 240 * this.zoom };
        this.cx = 32;
        this.cy = 7.2;
        this.forcedLayer = "minimap";
    }
}
class MiniMap {
    mult = 0.075; offset = { x: 20, y: 20 };
    w = 160; h = 120;
    t = 0;
    /** @param {FieldRunHandler} space */
    constructor(space) {
        document.getElementById("minimap").style["display"] = "block";
        this.space = space;
        this.const = ConstellationInfo[this.space.constellationName];

        const scale = BaseStar.fullMult;
        const bounds = BaseStar.fieldBounds;
        const boundx = bounds.x * scale, boundy = bounds.y * scale;
        const boundw = bounds.w * scale, boundh = bounds.h * scale;
        const wScale = this.w / boundw, hScale = this.h / boundh;
        if(wScale < hScale) {
            this.mult = wScale;
            this.offset.x = -boundx * wScale;
            this.offset.y = -boundy * wScale + (this.h - (boundh * wScale)) / 2;
        } else {
            this.mult = hScale;
            this.offset.y = -boundy * hScale;
            this.offset.x = -boundx * hScale + (this.w - (boundw * hScale)) / 2;
        }
    }
    CleanUp() {
        document.getElementById("minimap").style["display"] = "none";
    }
    Draw() { // TODO: UI just for runner or fielders
        gfx.ClearLayer("minimap");
        gfx.DrawMapCharacter(0, 0, { x: 0, y: 0 }, "background2", 640, 480, "minimap", 0, 0);
        this.space.stars.forEach(star => {
            const pos = star.GetWorldCenter(), data = star.GetUserData();
            this.DoSprite("sprites", data.powerIdx, 0, 32, pos, true, 0.2);
        });
        this.const.connections.forEach(e => {
            const star1 = this.space.stars[e[0]].GetWorldCenter(), star2 = this.space.stars[e[1]].GetWorldCenter();
            this.DoLine(star1, star2, true);
        });
        this.space.slamdunks.forEach(slammer => {
            const pos = slammer.body.GetWorldCenter();
            if(++slammer.animIdx >= 8) {
                slammer.animIdx = 0;
                slammer.frame = slammer.frame === 1 ? 0 : 1;
            }
            this.DoSprite("sprites", 7, slammer.frame, 32, pos, true, 0.2);
        });
        this.space.balls.forEach(ball => {
            const pos = ball.GetWorldCenter();
            const linearVelocity = ball.GetLinearVelocity();
            const sx = this.space.GetBallAngle(Math.atan2(linearVelocity.y, linearVelocity.x));
            this.DoSprite("sprites", sx, 2, 32, pos, true, 0.5);
        });
        let hasBall = this.space.runner.ball !== null;
        this.DoSprite(...this.space.runner.GetMiniMapDrawDetails());
        const me = this;
        this.space.fielders.forEach(f => {
            me.DoSprite(...f.GetMiniMapDrawDetails());
            hasBall = hasBall || (f.ball !== null);
        });
        const ball = this.space.balls[0];
        let pos = ball.GetWorldCenter();
        if(hasBall) { pos = { x: pos.x, y: pos.y - 1 }; }
        this.t += 0.1;
        this.DoSprite("sprites", 4, 1, 32, pos, true, 0.5 + 0.1 * Math.sin(this.t));

        /*const db = this.space.debugBounds;
        const ul = { x: db[0], y: db[1] }, ur = { x: db[0], y: db[3] }, bl = { x: db[2], y: db[1] }, br = { x: db[2], y: db[3] };
        this.DoLine(ul, ur, false); this.DoLine(ul, bl, false); this.DoLine(ur, br, false); this.DoLine(bl, br, false);*/
    }
    DoLine(a, b, isBox2D) {
        if(isBox2D) { a = vecm2p(a); b = vecm2p(b); }
        a = PAdd(PMult(a, this.mult), this.offset);
        b = PAdd(PMult(b, this.mult), this.offset);
        gfx.DrawLine(a.x, a.y, b.x, b.y, "#0000FF", "minimap", undefined, undefined, 1);
    }
    DoSprite(sheet, sx, sy, size, pos, isBox2D, scale) {
        if(isBox2D) { pos = vecm2p(pos); }
        pos = PAdd(PMult(pos, this.mult), this.offset);
        gfx.DrawCenteredSprite(sheet, sx, sy, pos.x, pos.y, "minimap", size, scale);
    }
}