const BaseStar = {
    /** @type GameData */ data: null, 
    /** @type CPUplayer */ cpu: null, 
    /** @type Camera[] */ cameras: [
        new Camera(null, [], true), // player 1 camera
        new Camera(null, [], true)  // player 2 camera
    ],
    paused: false, pausedBy: -1, 
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
    /** @type TransitionAnimation */ transitionAnim: null,
    Init: function(p1BatsFirst, skipTheBullshit) {
        if(outerGameData.gameType === "series") {
            this.data = new GameData(outerGameData.team1Idx, outerGameData.seriesLineup[outerGameData.seriesRound], false, p1BatsFirst);
        } else if(outerGameData.gameType === "2p_local") {
            this.data = new GameData(outerGameData.team1Idx, outerGameData.team2Idx, true, p1BatsFirst);
        } else if(outerGameData.gameType === "2p_online") {
            this.data = new GameData(outerGameData.team1Idx, outerGameData.team2Idx, true, p1BatsFirst);
            /*this.data.team1.showUI = (game.onlineHandler.playerNum === 1);
            this.data.team2.showUI = (game.onlineHandler.playerNum === 2);*/
        }
        this.SwitchView(false);
        this.particles = [];
        this.cpu = new CPUplayer();
        this.cameras[1].prefix = "p2";
        gfx.DrawMapCharacter(0, 0, { x: 0, y: 0 }, "background2", 640, 480, "background", 0, 0);
        gfx.DrawMapCharacter(0, 0, { x: 0, y: 0 }, "background2", 640, 480, "p2background", 0, 0);
        
        this.SwitchHandler(FieldPickHandler);
        //GetDebugFunkoPop(); this.SwitchHandler(AtBatHandler);
    },
    SwitchView: function(sideBySide) {
        const minifiedView = (document.getElementById("fullBoy") === null);
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
    KeyPress: function(key) {
        if(key === game.p1c["pause"]) {
            this.TogglePause(1);
        } else if(key === game.p2c["pause"]) {
            this.TogglePause(2);
        }
        this.subhandler.KeyPress(key);
    },
    TogglePause: function(player) {
        if(this.paused && player !== this.pausedBy) { return; }
        this.pausedBy = player;
        this.paused = !this.paused;
        if(this.paused) {
            document.getElementById("pauseDisplay").style["display"] = "block";
            Sounds.Pause();
        } else {
            document.getElementById("pauseDisplay").style["display"] = "none";
            Sounds.Unpause();
        }
    },
    Update: function() {
        if(this.paused) { return; }
        if(this.transitionAnim !== null && this.transitionAnim.active) { return; }
        this.subhandler.Update();
    },
    AnimUpdate: function() {
        if(this.subhandler === null) { return; }
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
        this.SwitchHandler(FieldPickHandler);
    },
    SwitchHandler: /** @param {any} handler @param {any[]} [args] */
    function(handler, args) {
        const me = this;
        this.transitionAnim = new TransitionAnimation("specialanim", 5, 5, function() {
            if(me.subhandler !== null) { me.subhandler.CleanUp(); }
            game.p1c.ClearAllKeys();
            game.p2c.ClearAllKeys();
            if(args === undefined) {
                me.subhandler = new handler();
            } else {
                me.subhandler = new handler(...args);
            }
            me.SwitchView(me.subhandler.showSplitScreenIn2P && outerGameData.gameType === "2p_local");
            game.p1c.freeMovement = me.subhandler.freeMovement;
            game.p2c.freeMovement = me.subhandler.freeMovement;
        }, function() { me.transitionAnim = null; });
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
class Loader {
    spritesheetLoadPercent = 0;
    soundLoadPercent = 0;
    musicLoadPercent = 0;
    areVoicesLoaded = false;
    done = false;
    loaderElem = document.getElementById("loaderInfo");
    constructor(callback) {
        this.callback = callback;
        const me = this;
        Sounds.Init(
            function(loadedPercent) { me.soundLoadPercent = loadedPercent; me.UpdateAndCheckIfLoaded(); },
            function() { me.soundLoadPercent = 1; me.UpdateAndCheckIfLoaded(); },
            function(loadedPercent) { me.musicLoadPercent = loadedPercent; me.UpdateAndCheckIfLoaded(); },
            function() { me.musicLoadPercent = 1; me.UpdateAndCheckIfLoaded(); }
        );
        SpeakHandler.InitSpeaker(function() {
            me.areVoicesLoaded = true;
            me.UpdateAndCheckIfLoaded();
        });
        gfx.LoadSpriteSheets("img", ["sprites", "title", "background", "background2", "helmets", "coin", "controller",
            "batmeter", "baseballers", "basehud", "teamlogos", "constellations", "logo",
            "worldmap", "worldcover", "bigsprites", "zennhalsey", "pitcher", "batter", "troph"], 
            function(loadedPercent) { me.spritesheetLoadPercent = loadedPercent; me.UpdateAndCheckIfLoaded(); },
            function() {
                me.spritesheetLoadPercent = 1;
                TeamInfo.forEach(t => { gfx.TintSheet("baseballers", t.color, t.name); });
                me.UpdateAndCheckIfLoaded();
            }
        );
    }
    UpdateAndCheckIfLoaded() {
        const loaderAmount = Math.round(100 * (this.spritesheetLoadPercent + this.musicLoadPercent + this.soundLoadPercent + (this.areVoicesLoaded ? 1 : 0)) / 4);
        this.loaderElem.textContent = loaderAmount + "%";
        if(!this.done && this.areVoicesLoaded && this.spritesheetLoadPercent === 1 && this.soundLoadPercent === 1 && this.musicLoadPercent === 1) {
            this.callback();
            this.done = true;
            document.getElementById("loader").remove();
        }
    }
}
class TransitionAnimation {
    active = true;
    state = 0; currentFrame = 0;
    /** @param {string} drawLayer @param {number} fadeFrames @param {number} holdFrames @param {() => void} midpointCallback @param {() => void} finishedCallback */
    constructor(drawLayer, fadeFrames, holdFrames, midpointCallback, finishedCallback) {
        this.drawLayer = drawLayer;
        this.fadeFrames = fadeFrames;
        this.holdFrames = holdFrames;
        this.midpointCallback = midpointCallback;
        this.finishedCallback = finishedCallback;
        const me = this;
        this.animIdx = setInterval(function() { me.Animate(); }, 10);
    }
    Animate() {
        if(!this.active) { return; }
        gfx.ClearLayer(this.drawLayer);
        if(this.state === 0) {
            if(++this.currentFrame >= this.fadeFrames) {
                this.state = 1;
                this.currentFrame = 0;
                this.midpointCallback();
                this.DrawHold(1);
            } else {
                this.DrawFadeIn(this.currentFrame / this.fadeFrames);
            }
        } else if(this.state === 1) {
            this.DrawHold(1);
            if(++this.currentFrame >= this.holdFrames) {
                this.state = 2;
                this.currentFrame = 0;
            }
        } else if(this.state === 2) {
            if(++this.currentFrame >= this.fadeFrames) {
                this.active = false;
                this.finishedCallback();
                clearInterval(this.animIdx);
            } else {
                this.DrawFadeOut(this.currentFrame / this.fadeFrames);
            }
        }
    }
    /** @param {number} percentage */
    DrawFadeIn(percentage) { gfx.DrawFullScreenRect(this.drawLayer, "#000000", percentage); }
    /** @param {number} percentage */
    DrawHold(percentage) { gfx.DrawFullScreenRect(this.drawLayer, "#000000", percentage); }
    /** @param {number} percentage */
    DrawFadeOut(percentage) { gfx.DrawFullScreenRect(this.drawLayer, "#000000", 1 - percentage); }
}
class Game {
    animIdx = 0; updateIdx = 0; transitionAnim = null;
    /** @type {BaseHandler} */ currentHandler = null;
    /** @type {InputHandler} */ inputHandler =  null; 
    /** @type {GameInput} */ p1c = null;
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
        this.currentHandler = LogoScreen;
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
        const loader = new Loader(function() {
            game.inputHandler = new InputHandler();
            game.p1c = game.inputHandler.controlSets[0];
            game.p2c = game.inputHandler.controlSets[1];
            game.animIdx = setInterval(function() { game.AnimUpdate(); }, fpsAnim);
            game.updateIdx = setInterval(function() { game.Update(); }, fpsUpdate);
            LogoScreen.Init();
        });
    }
    AnimUpdate() {
        if(this.currentHandler === null) { return; }
        gfx.ClearLayer("minimap");
        this.currentHandler.AnimUpdate();
    }
    Update() {
        if(helper.isVisible) { return; }
        if(this.currentHandler === null) { return; }
        if(this.transitionAnim !== null && this.transitionAnim.active) { return; }
        this.currentHandler.Update();
    }
    KeyPress(key) {
        if(this.transitionAnim !== null && this.transitionAnim.active) { return; }
        this.currentHandler.KeyPress(key);
    }
    SetFreeMovement(newVal) {
        game.p1c.freeMovement = newVal;
        game.p2c.freeMovement = newVal;
    }
    /* onlineHandler =  null;
    DoOnlineThing(target, ...params) {
        if(game.onlineHandler === null) { return; }
        game.onlineHandler.socket.emit(target, ...params);
    }*/
    Transition(newHandler, args) {
        const me = this;
        this.transitionAnim = new TransitionAnimation("specialanim", 10, 5, function() {
            Sounds.EndAll();
            SpeakHandler.Stop();
            game.p1c.ClearAllKeys();
            game.p2c.ClearAllKeys();
            const wasFast = me.currentHandler.fast || false;
            if(me.currentHandler.CleanUp !== undefined) { me.currentHandler.CleanUp(); }
            me.currentHandler = newHandler;
            game.SetFreeMovement(newHandler.freeMovement || false);
            gfx.ClearAll();
            if(wasFast && !newHandler.fast) {
                clearInterval(me.updateIdx);
                me.updateIdx = setInterval(function() { game.Update(); }, fpsUpdate);
            } else if(!wasFast && newHandler.fast) {
                clearInterval(me.updateIdx);
                me.updateIdx = setInterval(function() { game.Update(); }, fpsAnim);
            }
            if(newHandler === BaseStar || newHandler === SeriesIndicator || newHandler === VersusIndicator || newHandler === CoinToss) {
                Sounds.PlaySong("song_neospringcore");
            } else {
                Sounds.PlaySong("song_awake");
            }
            if(args === undefined) {
                me.currentHandler.Init();
            } else {
                me.currentHandler.Init(...args);
            }
        }, function() { me.transitionAnim = null; });
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
    /** @type Team */ team = null;
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