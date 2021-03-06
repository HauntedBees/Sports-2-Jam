class Camera {
    /** @param {any} focus @param {string[]} ignores @param {boolean} visible */
    constructor(focus, ignores, visible) {
        this.cx = 320; this.cy = 240;
        this.top = 120; this.bottom = 480;
        this.left = 0; this.right = 640;
        this.offsetx = 0; this.offsety = 0;
        this.visible = visible;
        if(focus === null) {
            this.focusObj = { x: this.cx, y: this.cy };
        } else {
            this.focusObj = focus;
        }
        this.zoom = 1;
        this.betwixt = -1;
        this.forcedLayer = "";
        this.prefix = "";
        this.ignores = ignores;
    }
    /** @param {any} focus @param {boolean} skipBetwixting */
    SwitchFocus(focus, skipBetwixting) {
        if(!skipBetwixting) {
            this.lastFocusObj = this.focusObj;
            this.betwixt = 0;
        } else {
            this.betwixt = -1;
        }
        if(focus === null) {
            this.focusObj = { x: this.cx, y: this.cy };
            this.zoom = 1;
        } else {
            this.focusObj = focus;
        }
    }
    Update() {
        if(this.betwixt < 0) { return; }
        this.betwixt += 0.1;
        if(this.betwixt >= 1) { this.betwixt = -1; }
    }
    /** @param {{ x: number; y: number; }} posObj @param {string} type @param {boolean} [doClamp] */
    GetPos(posObj, type, doClamp) {
        let myPos = (typeof this.focusObj.GetWorldCenter === "function") ? vecm2p(this.focusObj.GetWorldCenter()) : this.focusObj;
        if(this.betwixt >= 0) {
            const oldPos = (typeof this.lastFocusObj.GetWorldCenter === "function") ? vecm2p(this.lastFocusObj.GetWorldCenter()) : this.lastFocusObj;
            const newPos = (typeof this.focusObj.GetWorldCenter === "function") ? vecm2p(this.focusObj.GetWorldCenter()) : this.focusObj;
            const delta = PSub(newPos, oldPos);
            myPos = {
                x: oldPos.x + delta.x * this.betwixt,
                y: oldPos.y + delta.y * this.betwixt
            };
        }
        if(myPos === null) { 
            return { x: posObj.x, y: posObj.y, ignore: !this.visible || this.ignores.some(e => type.includes(e)), clamp: null, distance: 0 };
        }
        if(!this.visible || this.ignores.some(e => type.includes(e))) {
            return { x: 0, y: 0, ignore: true, clamp: null, distance: 0 }
        }
        let newX = this.cx + this.zoom * (posObj.x - myPos.x) + this.offsetx;
        let newY = this.cy + this.zoom * (posObj.y - myPos.y) + this.offsety;
        let clamp = null, distance = 0;
        if(doClamp === true) {
            const clampPadding = 16;
            let dx = 0, dy = 0;
            if(newX < this.left) {
                dx = newX - this.left;
                newX = this.left + clampPadding;
            } else if(newX > this.right) {
                dx = newX - this.right;
                newX = this.right - clampPadding;
            }
            if(newY < this.top) {
                dy = newY - this.top;
                newY = this.top + clampPadding;
            } else if(newY > this.bottom) {
                dy = newY - this.bottom;
                newY = this.bottom - clampPadding;
            }
            if(dy !== 0 || dx !== 0) {
                clamp = Math.atan2(dy, dx);
                distance = Math.sqrt(dx * dx + dy * dy);
            }
        }
        return { x: newX, y: newY, ignore: false, clamp: clamp, distance: distance };
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
    /** @param {FieldRunHandler} space */
    constructor(space) {
        this.mult = 0.075;
        this.offset = { x: 20, y: 20 };
        this.w = 160;
        this.h = 120;
        this.t = 0;
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
    Draw(showRunnerData, showFielderData) {
        gfx.ClearLayer("minimap");
        gfx.DrawMapCharacter(0, 0, { x: 0, y: 0 }, "background2", 640, 480, "minimap", 0, 0);
        if(playerOptions["particles"].value) {
            BaseStar.particles.forEach(p => {
                this.DoSprite("sprites", 0, 1, 32, p, false, 0.2);
            });
        }
        let runnerTargetOverlayPos = null;
        let fielderTargetOverlayPos = null;
        this.space.stars.forEach((star, i) => {
            const pos = star.GetWorldCenter(), data = star.GetUserData();
            this.DoSprite("sprites", data.powerIdx, 0, 32, pos, true, 0.2);
            if(showRunnerData && this.space.runHandler.runner.targetStar === i) {
                runnerTargetOverlayPos = PAdd(pos, {x: 0, y: -1});
            }
            if(showFielderData && this.space.fieldHandler.targetFielderIdx === i) {
                fielderTargetOverlayPos = PAdd(pos, {x: 0, y: -1});
            }
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
        
        let pos = this.space.ball.GetWorldCenter();
        const linearVelocity = this.space.ball.GetLinearVelocity();
        const sx = this.space.GetBallAngle(Math.atan2(linearVelocity.y, linearVelocity.x));
        this.DoSprite("sprites", sx, 2, 32, pos, true, 0.5);

        let hasBall = this.space.runner.ball !== null;
        this.space.fielders.forEach(f => {
            this.DoSprite(...f.GetMiniMapDrawDetails());
            hasBall = hasBall || (f.ball !== null);
        });
        if(hasBall) { pos = { x: pos.x, y: pos.y - 1 }; }
        this.t += 0.1;
        this.DoSprite("sprites", 4, 1, 32, pos, true, 0.5 + 0.1 * Math.sin(this.t));

        this.space.runHandler.onBaseRunners.forEach(f => {
            this.DoSprite(...f.GetMiniMapDrawDetails());
        });
        this.DoBaseballerSprite(...this.space.runHandler.runner.GetMiniMapDrawDetails());

        if(runnerTargetOverlayPos !== null) { this.DoSprite("sprites", 10, 2, 32, runnerTargetOverlayPos, true, 0.5); }
        if(fielderTargetOverlayPos !== null) { this.DoSprite("sprites", 10, 3, 32, fielderTargetOverlayPos, true, 0.5); }
    }
    DoLine(a, b, isBox2D) {
        if(isBox2D) { a = vecm2p(a); b = vecm2p(b); }
        a = PAdd(PMult(a, this.mult), this.offset);
        b = PAdd(PMult(b, this.mult), this.offset);
        gfx.DrawLine(a.x, a.y, b.x, b.y, "#0000FF", "minimap", undefined, undefined, 1);
    }
    DoBaseballerSprite(sheet, sx, sy, size, pos, isBox2D, scale) {
        this.DoSprite(sheet, sx, sy, size, pos, isBox2D, scale);
        this.DoSprite("baseballers", sx + 4, sy, size, pos, isBox2D, scale);
    }
    DoSprite(sheet, sx, sy, size, pos, isBox2D, scale) {
        if(isBox2D) { pos = vecm2p(pos); }
        pos = PAdd(PMult(pos, this.mult), this.offset);
        gfx.DrawCenteredSprite(sheet, sx, sy, pos.x, pos.y, "minimap", size, scale);
    }
}