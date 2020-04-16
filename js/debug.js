class Debug {
    constructor() {
        document.addEventListener("keypress", this.KeyPress);
    }
    /** @param {KeyboardEvent} e */
    KeyPress(e) {

        if(game.currentHandler === BaseStar) {
            if(e.key === "p") { game.paused = !game.paused; }
            if(e.key === "-") { BaseStar.cameras[0].zoom -= 0.1; }
            if(e.key === "=" || e.key === "+") { BaseStar.cameras[0].zoom += 0.1; }
            if(e.key === "4") { BaseStar.cameras[0].offsetx += 10; }
            if(e.key === "6") { BaseStar.cameras[0].offsetx -= 10; }
            if(e.key === "8") { BaseStar.cameras[0].offsety += 10; }
            if(e.key === "2") { BaseStar.cameras[0].offsety -= 10; }
        }

        if(e.key === " ") { return; }
        if(game.currentHandler.earthX !== undefined) { // Team Selection
            const idx = game.currentHandler.sy * game.currentHandler.rowLength + game.currentHandler.sx;
            if(e.key === "4") { game.currentHandler.earthX -= 1; }
            if(e.key === "6") { game.currentHandler.earthX += 1; }
            if(e.key === "8") { game.currentHandler.earthY -= 2; }
            if(e.key === "2") { game.currentHandler.earthY += 2; }
            console.clear();
            console.log(game.currentHandler.earthX + ", " + game.currentHandler.earthY);
        }
        if(game.currentHandler.subhandler !== undefined && game.currentHandler.subhandler.constructor.name === "FieldPickHandler") {
            if(e.key === "-") { game.currentHandler.subhandler.scale -= 0.005; }
            if(e.key === "=" || e.key === "+") { game.currentHandler.subhandler.scale += 0.005; }
            if(e.key === "5") { console.log(game.currentHandler.subhandler.maxY); }
        }
    }
}
const debuggo = new Debug();