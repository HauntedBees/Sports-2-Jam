class Debug {
    constructor() {
        document.addEventListener("keypress", this.KeyPress);
    }
    /** @param {KeyboardEvent} e */
    KeyPress(e) {
        if(e.key === "-") { BaseStar.cameras[0].zoom -= 0.1; }
        if(e.key === "=" || e.key === "+") { BaseStar.cameras[0].zoom += 0.1; }
        if(e.key === "4") { BaseStar.cameras[0].offsetx += 10; }
        if(e.key === "6") { BaseStar.cameras[0].offsetx -= 10; }
        if(e.key === "8") { BaseStar.cameras[0].offsety += 10; }
        if(e.key === "2") { BaseStar.cameras[0].offsety -= 10; }
    }
}
const debuggo = new Debug();