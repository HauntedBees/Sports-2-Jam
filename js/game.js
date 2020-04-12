const BaseStar = {
    /** @type GameData */ data: null, 
    /** @type CPUplayer */ cpu: null, 
    fast: true, 
    /** @type Handler */ subhandler: null,
    freeMovement: true, 
    b2Helper: null,
    Init: function() {
        this.data = new GameData(0, 1, false);
        this.cpu = new CPUplayer();
        gfx.DrawMapCharacter(0, 0, { x: 0, y: 0 }, "background2", 640, 480, "background", 0, 0);
        this.SwitchHandler(AtBatHandler);
    },
    KeyPress: function(key) { this.subhandler.KeyPress(key); },
    Update: function() { this.subhandler.Update(); },
    AnimUpdate: function() {
        gfx.ClearSome(["interface", "overlay"]);
        this.subhandler.AnimUpdate();
    },
    ChangePlaces: function() {
        this.data.SwitchTeams();
        this.SwitchHandler(AtBatHandler);
    },
    SwitchHandler: /** @param {new () => any} handler */
    function(handler) {
        if(this.subhandler !== null) { this.subhandler.CleanUp(); }
        this.subhandler = new handler();
        this.freeMovement = this.subhandler.freeMovement;
        this.freeMovement2 = this.subhandler.freeMovement2;
    },
    SwitchHandlerWithArgs: function(handler, ...args) {
        if(this.subhandler !== null) { this.subhandler.CleanUp(); }
        this.subhandler = new handler(...args);
        this.freeMovement = this.subhandler.freeMovement;
        this.freeMovement2 = this.subhandler.freeMovement2;
    }
};
const game = {
    /** @type BaseHandler */ currentHandler: null,
    animIdx: 0, updateIdx: 0, 
    Start: function() {
        game.currentHandler = Title;
        const canvasLayers = ["background", "debug", "interface", "overlay", "text", "specialanim"];
        /** @type {{[key:string] : HTMLCanvasElement }} */ 
        let canvasObj = {};
        for(let i = 0; i < canvasLayers.length; i++) {
            const name = canvasLayers[i];
            canvasObj[name] = /** @type {HTMLCanvasElement} */ (document.getElementById(name));
        }
        /** @type {{[key:string] : CanvasRenderingContext2D }} */ 
        let contextObj = {};
        for(const key in canvasObj) {
            contextObj[key] = canvasObj[key].getContext("2d");
        }
        gfx.canvas = canvasObj; gfx.ctx = contextObj;
        gfx.LoadSpriteSheets("img", ["sprites", "title", "background", "background2", "helmets", "coin", "batmeter", "baseballers"], function() {
            document.addEventListener("keypress", input.keyPress);
            document.addEventListener("keydown", input.keyDown);
            document.addEventListener("keyup", input.keyUp);
            game.animIdx = setInterval(game.AnimUpdate, fps);
            game.updateIdx = setInterval(game.Update, 80);
            Title.Init();
        });
    },
    AnimUpdate: function() {
        if(game.currentHandler === null) { return; }
        game.currentHandler.AnimUpdate();
    },
    Update: function() {
        if(game.currentHandler === null) { return; }
        game.currentHandler.Update();
    },
    Transition: function(newscene, args) {
        const wasFast = game.currentHandler.fast || false;
        game.currentHandler = newscene;
        gfx.ClearAll();
        if(wasFast && !newscene.fast) {
            clearInterval(game.updateIdx);
            game.updateIdx = setInterval(game.Update, 80);
        } else if(!wasFast && newscene.fast) {
            clearInterval(game.updateIdx);
            game.updateIdx = setInterval(game.Update, fps);
        }
        game.currentHandler.Init(...args);
    }
};
const BaseHandler = {
    Init: function(...args) {},
    KeyPress: function(key) {},
    Update: function() {},
    AnimUpdate: function() {}
};

class Handler {
    freeMovement = false;
    freeMovement2 = false;
    constructor() {}
    KeyPress(key) {}
    Update() {}
    AnimUpdate() {}
    CleanUp() {}
}
class SecondaryHandler extends Handler {
    /** @type {Object} */
    myControls = null;
    /** @type {Team} */
    team = null;
    /** @param {Team} team */
    constructor(team) {
        super();
        this.team = team;
        this.myControls = team.GetControls();
    }
}