class Camera {
    /** @param {{ x: number; y: number; }} focus @param {string[]} ignores @param {boolean} visible */
    constructor(focus, ignores, visible) {
        this.cx = 320; this.cy = 240;
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
        const newX = this.cx + this.zoom * (posObj.x - myPos.x);
        const newY = this.cy + this.zoom * (posObj.y - myPos.y);
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