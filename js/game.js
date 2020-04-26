const BaseStar = {
    /** @type GameData */ data: null, 
    /** @type CPUplayer */ cpu: null, 
    /** @type Camera[] */ cameras: [
        new Camera(null, [], true), // player 1 camera
        new Camera(null, [], true)  // player 2 camera
    ],
    isSideBySide: false, 
    fast: true, fullMult: 3, 
    /** @type Handler */ subhandler: null,
    /** @type {{ x: number; y: number}[]} */
    outfielders: [],
    /** @type {{ x: number; y: number; frame: number; timer: number; }[]} */
    particles: [],
    /** @type {{ x: number; y: number, w: number; h: number}} */
    fieldBounds: null,
    freeMovement: true, 
    /** @type b2Helpers */ b2Helper: null,
    Init: function(p1BatsFirst, skipTheBullshit) {
        if(outerGameData.gameType === "series") {
            this.data = new GameData(outerGameData.team1Idx, outerGameData.seriesLineup[outerGameData.seriesRound], false, p1BatsFirst);
        } else if(outerGameData.gameType === "2p_local") {
            this.data = new GameData(outerGameData.team1Idx, outerGameData.team2Idx, true, p1BatsFirst);
        }
        this.SwitchView(false);
        this.cpu = new CPUplayer();
        this.cameras[1].prefix = "p2";
        gfx.DrawMapCharacter(0, 0, { x: 0, y: 0 }, "background2", 640, 480, "background", 0, 0);
        gfx.DrawMapCharacter(0, 0, { x: 0, y: 0 }, "background2", 640, 480, "p2background", 0, 0);
        
        this.SwitchHandler(FieldPickHandler);
        //GetDebugFunkoPop(); this.SwitchHandler(AtBatHandler);
    },
    SwitchView: function(sideBySide) {
        const minifiedView = (document.getElementById("fullBoy") === null);
        console.log("tiny: " + minifiedView);
        if(sideBySide) {
            if(this.isSideBySide) { return; }
            this.isSideBySide = true;
            document.getElementById("p2canvs").style["display"] = "block";
            const canvies = document.getElementById("p1canvs").children;
            for(let i = 0; i < canvies.length; i++) {
                if(minifiedView) {
                    // @ts-ignore
                    canvies[i].style["width"] = "320px";
                    // @ts-ignore
                    canvies[i].style["height"] = "480px";
                    // @ts-ignore
                    canvies[i].style["left"] = "-320px";
                } else {
                    console.log("BEEG");
                    // @ts-ignore
                    canvies[i].style["left"] = "-640px";
                }
                // @ts-ignore
                canvies[i].style["border"] = "1px solid white";
            }
            document.getElementById("minimap").style["left"] = "0px";
        } else {
            if(!this.isSideBySide) { return; }
            this.isSideBySide = false;
            document.getElementById("p2canvs").style["display"] = "none";
            const canvies = document.getElementById("p1canvs").children;
            for(let i = 0; i < canvies.length; i++) {
                // @ts-ignore
                canvies[i].style["width"] = "640px";
                // @ts-ignore
                canvies[i].style["height"] = "480px";
                // @ts-ignore
                canvies[i].style["left"] = "0px";
                // @ts-ignore
                canvies[i].style["border"] = "1px solid white";
            }
            document.getElementById("minimap").style["left"] = "-476px";
        }
    },
    TeamSwitchHandler() {
        if(BaseStar.data.WasLastInning()) {
            AnimationHelpers.StartScrollText("GAME SET!", function() { BaseStar.EndGame(); });
        } else if(BaseStar.data.WasEndOfInning()) {
            let msg = "NEXT INNING!";
            console.log(BaseStar.data.inning.inningNumber);
            switch(BaseStar.data.inning.inningNumber) {
                case 1: msg = "SECOND INNING!"; break;
                case 2: msg = "FINAL INNING!"; break;
                default: msg = "ZONGO BONGO, SOMETHING IS WRONGO!"; break;
            }
            AnimationHelpers.StartScrollText(msg, function() { BaseStar.ChangePlaces(); });
        } else {
            AnimationHelpers.StartScrollText("CHANGE PLACES!", function() { BaseStar.ChangePlaces(); });
        }
    },
    KeyPress: function(key) { this.subhandler.KeyPress(key); },
    //Update: function() { this.subhandler.Update(); },
    Update: function() { if(!debuggo.fuckTheRules) { this.subhandler.Update(); } },
    AnimUpdate: function() {
        gfx.ClearSome(["interface", "overlay", "p2interface", "p2overlay", "text", "p2text"]);
        this.subhandler.AnimUpdate();
    },
    EndGame: function() {
        this.data.SwitchTeams();
        this.subhandler.CleanUp();
        this.subhandler = null;
        game.Transition(WinScreen);
    },
    ChangePlaces: function() {
        this.data.SwitchTeams();
        this.SwitchHandler(AtBatHandler);
    },
    SwitchHandler: /** @param {new () => any} handler */
    function(handler) {
        if(this.subhandler !== null) { this.subhandler.CleanUp(); }
        this.subhandler = new handler();
        if(this.subhandler.showSplitScreenIn2P && outerGameData.gameType === "2p_local") {
            this.SwitchView(true);
        } else { this.SwitchView(false); }
        this.freeMovement = this.subhandler.freeMovement;
        this.freeMovement2 = this.subhandler.freeMovement2;
    },
    SwitchHandlerWithArgs: function(handler, ...args) {
        if(this.subhandler !== null) { this.subhandler.CleanUp(); }
        this.subhandler = new handler(...args);
        if(this.subhandler.showSplitScreenIn2P && outerGameData.gameType === "2p_local") {
            this.SwitchView(true);
        } else { this.SwitchView(false); }
        this.freeMovement = this.subhandler.freeMovement;
        this.freeMovement2 = this.subhandler.freeMovement2;
    },
    FieldSetupComplete: function(constellation, outfielders, fieldBoundaries) {
        this.data.SetConstellation(constellation);
        this.outfielders = outfielders;
        this.fieldBounds = fieldBoundaries;
        this.SwitchHandler(AtBatHandler);
    }
};
const outerGameData = {
    team1Idx: 0, team2Idx: 0,
    gameType: "series",
    seriesLineup: [], seriesRound: 0
};
class Game {
    paused = false;
    animIdx = 0; updateIdx = 0;
    /** @type {BaseHandler} */ currentHandler = null;
    /** @type {InputHandler} */ inputHandler =  null;
    /** @type {GameInput} */ p1c =  null;
    /** @type {GameInput} */ p2c = null;
    Initialize(addAwaiter) {
        if(addAwaiter) {
            const me = this;
            const aw = document.getElementById("awaiter");
            aw.style["display"] = "block";
            aw.addEventListener("click", function() {
                aw.style["display"] = "none";
                me.Initialize();
            });
            return;
        } 
        this.currentHandler = Title;
        const canvasLayers = ["background", "background2", "debug", "interface", "overlay", "text", "specialanim", "minimap", 
                              "p2background", "p2background2", "p2debug", "p2interface", "p2overlay", "p2text"];
        /** @type {{[key:string] : HTMLCanvasElement }} */ 
        const canvasObj = {};
        for(let i = 0; i < canvasLayers.length; i++) {
            const name = canvasLayers[i];
            canvasObj[name] = /** @type {HTMLCanvasElement} */ (document.getElementById(name));
        }
        /** @type {{[key:string] : CanvasRenderingContext2D }} */ 
        const contextObj = {};
        for(const key in canvasObj) {
            contextObj[key] = canvasObj[key].getContext("2d");
        }
        gfx.canvas = canvasObj; gfx.ctx = contextObj;
        const game = this;
        gfx.LoadSpriteSheets("img", ["sprites", "title", "background", "background2", "helmets", "coin", "controller",
                                     "batmeter", "baseballers", "basehud", "teamselect", "teamlogos", "constellations",
                                     "worldmap", "worldcover", "bigsprites", "zennhalsey", "pitcher", "batter", "troph"], function() {
            game.inputHandler = new InputHandler();
            game.p1c = game.inputHandler.controlSets[0];
            game.p2c = game.inputHandler.controlSets[1];
            game.animIdx = setInterval(function() { game.AnimUpdate(); }, fpsAnim);
            game.updateIdx = setInterval(function() { game.Update(); }, fpsUpdate);
            Title.Init();
        });
    }
    AnimUpdate() {
        if(this.currentHandler === null) { return; }
        gfx.ClearLayer("minimap");
        this.currentHandler.AnimUpdate();
    }
    Update() {
        if(this.currentHandler === null) { return; }
        this.currentHandler.Update();
    }
    Transition(newHandler, args) {
        Sounds.EndAll();
        const wasFast = this.currentHandler.fast || false;
        if(this.currentHandler.CleanUp !== undefined) { this.currentHandler.CleanUp(); }
        this.currentHandler = newHandler;
        gfx.ClearAll();
        if(wasFast && !newHandler.fast) {
            clearInterval(this.updateIdx);
            this.updateIdx = setInterval(function() { game.Update(); }, fpsUpdate);
        } else if(!wasFast && newHandler.fast) {
            clearInterval(this.updateIdx);
            this.updateIdx = setInterval(function() { game.Update(); }, fpsAnim);
        }
        if(args === undefined) {
            this.currentHandler.Init();
        } else {
            this.currentHandler.Init(...args);
        }
    }
}
const game = new Game();

const BaseHandler = {
    Init: function(...args) {},
    KeyPress: function(key) {},
    Update: function() {},
    AnimUpdate: function() {}
};  
class Handler {
    freeMovement = false;
    freeMovement2 = false;
    showSplitScreenIn2P = false;
    constructor() {}
    KeyPress(key) {}
    Update() {}
    AnimUpdate() {}
    CleanUp() {}
}
class SecondaryHandler extends Handler {
    /** @type {GameInput} */ myControls = null;
    /** @type {Team} */ team = null;
    /** @param {Team} team */
    constructor(team) {
        super();
        this.team = team;
        this.myControls = team.GetControls();
    }
}