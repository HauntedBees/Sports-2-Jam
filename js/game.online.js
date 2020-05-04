class OnlineHandler {
    connectionId = "";
    hasError = false; errorMsg = "";
    socket = null; gameID = -1;
    opponentName = ""; playerNum = 0;
    constructor() {
        const me = this;
        this.socket = io.connect("http://localhost:4200", { reconnectionAttempts: 5 });
        this.socket.on("connect", function() { me.hasError = false; me.connectionId = me.socket.id; console.log(me.connectionId); });
        this.socket.on("connect_error", function() { me.ErrorOccurred("connect_error"); });
        this.socket.on("connect_timeout", function() { me.ErrorOccurred("connect_timeout"); });
        this.socket.on("reconnect_attempt", function(attempt) { me.ErrorOccurred("reconnect_attempt", attempt); });
        this.socket.on("reconnecting", function(attempt) { me.ErrorOccurred("reconnecting", attempt); });
        this.socket.on("reconnect_error", function() { me.ErrorOccurred("reconnect_error"); });
        this.socket.on("reconnect_failed", function() { me.ErrorOccurred("reconnect_failed"); });
        this.socket.on("disconnect", function() { me.socket.disconnect(); me.ErrorOccurred("disconnect"); });
    }
    /** @param {string} errorType @param {number} [reconnectAttempt] */
    ErrorOccurred(errorType, reconnectAttempt) {
        this.hasError = true;
        switch(errorType) {
            case "disconnect":
                this.errorMsg = "The Basesol server is down. This isn't your fault. Try again later :(";
                break;
            case "reconnect_attempt":
                this.errorMsg = `Trying to Connect (Attempt ${reconnectAttempt})`;
                break;
           case "reconnecting":
               this.errorMsg = `Connecting (Attempt ${reconnectAttempt})`;
               break;
            default:
                this.errorMsg = "Please check your internet connection!";
                break;
        }
    }
}
class OnlineHostHandler extends OnlineHandler {
    playerFound = false;
    constructor() {
        super();
        this.playerNum = 1;
        const me = this;
        this.socket.on("playerFound", function(playerName, gameID) {
            me.playerFound = true;
            me.opponentName = playerName;
            me.gameID = gameID;
        });
    }
}
class OnlineJoinHandler extends OnlineHandler {
    constructor() {
        super();
        this.playerNum = 2;
    }
}
class OnlineMessage {
    complete = false; response = {};
    /** @param {OnlineHandler} handler @param {string} type @param {any} args */
    constructor(handler, type, ...args) {
        const me = this;
        const callback = function(response) { me.Response(response); };
        if(args === undefined) {
            args = [callback];
        } else {
            args.push(callback);
        }
        handler.socket.emit(type, ...args);
    }
    Response(response) {
        this.complete = true;
        this.response = response;
    }
}

class OnlineInputSender extends GameInput {
    /** @param {OnlineHandler} handler @param {GameInput} originalInput */
    constructor(handler, originalInput) {
        super(handler.playerNum, originalInput.currentControls);
        this.handler = handler;
    }
    KeyPress(keyEvent) {
        const keyPressed = this.GetKey(keyEvent);
        let keyMeaning = "";
        switch(keyPressed) {
            case this["cancel"]: keyMeaning = "cancel"; break;
            case this["confirm"]: keyMeaning = "confirm"; break;
            case this["pause"]: keyMeaning = "pause"; break;
            case this["up"]: keyMeaning = "up"; break;
            case this["down"]: keyMeaning = "down"; break;
            case this["left"]: keyMeaning = "left"; break;
            case this["right"]: keyMeaning = "right"; break;
        }
        if(keyMeaning !== "") { this.handler.socket.emit("keyPress", keyMeaning); }
        this.KeyPressFromKey(keyPressed);
    }
}
class OnlineInputReciever extends GameInput {
    /** @param {OnlineHandler} handler */
    constructor(handler) {
        super(handler.playerNum, { up: "up", down: "down", left: "left", right: "right", confirm: "confirm", cancel: "cancel", pause: "pause" });
        this.handler = handler;
        this.ignore = true;
        const me = this;
        this.handler.socket.on("receiveKey", function(key) {
            me.KeyPressFromKey(key);
        });
    }
}

const OnlineSharedConnect = {
    Init: function() {
        this.isTryingToQuit = false;
    },
    /** @param {OnlineHandler} handler */
    MoveToTeamSelect(handler) {
        if(handler.gameID < 0) { return; }
        if(handler.playerNum === 1) {
            game.p1c = new OnlineInputSender(handler, game.p1c);
            game.p2c = new OnlineInputReciever(handler);
        } else {
            game.p2c = new OnlineInputSender(handler, game.p1c);
            game.p1c = new OnlineInputReciever(handler);
        }
        Math.random = aleaPRNG("goku " + handler.gameID);
        //game.onlineHandler = handler;
        game.inputHandler.controlSets = [ game.p1c, game.p2c ];
        game.Transition(TeamSelection, [2, true]);
    }
};

const OnlineHostGame = {
    /** @type {OnlineHostHandler} */ handler: null,
    /** @type {OnlineMessage} */ hostMsg: null,
    state: 0, 
    hostID: "", privateGame: false, 
    Init: function() {
        gfx.DrawMapCharacter(0, 0, { x: 0, y: 0 }, "background", 640, 480, "background", 0, 0);
        this.handler = new OnlineHostHandler();
        OnlineSharedConnect.Init();
        this.isPrivateGame = false;
        this.state = 0; // 0 = awaiting connection, 1 = awaiting user input, 2 = awaiting host, 3 = waiting for opponent
    },
    CleanUp: function() { this.elems = []; },
    KeyPress: function(key) {
        switch(key) {
            case game.p1c["cancel"]:
                OnlineSharedConnect.isTryingToQuit = !OnlineSharedConnect.isTryingToQuit; 
                break;
            case game.p1c["confirm"]:
                OnlineSharedConnect.MoveToTeamSelect(this.handler);
                break;
        }
    },
    Update: function() {
        // TODO: worry about all this shit after the game actually works
        /*if(this.state === 0) {
            if(this.handler.connectionId !== "") { 
                this.state = 1;
            }
        }*/
    },
    AnimUpdate: function() {
        gfx.ClearLayer("text");
        if(OnlineSharedConnect.isTryingToQuit) {
            gfx.WriteEchoOptionText("Stop Trying to Host?", 320, 200, "text", "#FFFFFF", "#00AAAA", 36);
            gfx.WriteEchoOptionText("This will return you to the title screen.", 320, 240, "text", "#FFFFFF", "#00AAAA", 18);
            gfx.DrawSprite("sprites", 11, 2, 250, 260, "text", 32, 1);
            gfx.WriteEchoOptionText("Stop Hosting", 354, 282, "text", "#FFFFFF", "#00AAAA", 16);
            gfx.DrawSprite("sprites", 12, 2, 250, 292, "text", 32, 1);
            gfx.WriteEchoOptionText("Stay Here", 354, 314, "text", "#FFFFFF", "#00AAAA", 16);
            // TODO: finish this after it works
            return;
        } else if(this.handler.hasError) {
            gfx.WriteEchoOptionText("An Error Occurred!", 320, 200, "text", "#FFFFFF", "#00AAAA", 36);
            gfx.WriteEchoOptionText(this.handler.errorMsg, 320, 240, "text", "#FFFFFF", "#00AAAA", 18);
        } else if(this.handler.gameID >= 0) {
            gfx.WriteEchoOptionText("Ready to Play!", 320, 180, "text", "#FFFFFF", "#00AAAA", 36);
            gfx.WriteEchoOptionText("Press any key or button to advance.", 320, 240, "text", "#FFFFFF", "#00AAAA", 18);
        } else if(this.hostMsg === null) {
            this.hostMsg = new OnlineMessage(this.handler, "hostGame");
        } else if(this.handler.connectionId === "" || !this.hostMsg.complete) { 
            gfx.WriteEchoOptionText("Trying to connect...", 320, 230, "text", "#FFFFFF", "#00AAAA", 36);
        } else if(this.handler.playerFound) {
            gfx.WriteEchoOptionText("Someone has joined your match!", 320, 180, "text", "#FFFFFF", "#00AAAA", 24);
        } else {
            gfx.WriteEchoOptionText("Your Host ID is", 320, 180, "text", "#FFFFFF", "#00AAAA", 24);
            gfx.WriteEchoOptionText(this.hostMsg.response.hostID, 320, 240, "text", "#FFFFFF", "#00AAAA", 48);
            gfx.WriteEchoOptionText("Share this Host ID with your opponent.", 320, 290, "text", "#FFFFFF", "#00AAAA", 24);
        }
        gfx.DrawSprite("sprites", 12, 2, 0, 448, "text", 32, 1);
        gfx.WriteEchoOptionText("Cancel", 64, 470, "text", "#FFFFFF", "#00AAAA", 16);
    }
};
const OnlineJoinGame = {
    /** @type {OnlineJoinHandler} */ handler: null,
    /** @type {OnlineMessage} */ hostMsg: null,
    hostID: "", animIter: 0, showUnderscore: true,
    ready: false,
    Init: function() {
        gfx.DrawMapCharacter(0, 0, { x: 0, y: 0 }, "background", 640, 480, "background", 0, 0);
        this.handler = new OnlineJoinHandler();
        OnlineSharedConnect.Init();
        this.hostID = "";
        this.lockInput = false;
        this.ready = false;
        game.inputHandler.forceCleanKeyPress = true;
    },
    CleanUp: function() { this.elems = []; },
    KeyPress: function(key) {
        if(this.lockInput) {
            switch(key) {
                case game.p1c["confirm"]:
                    OnlineSharedConnect.MoveToTeamSelect(this.handler);
                    break;
            }
        } else {
            if(key === "Backspace") {
                if(this.hostID !== "") {
                    this.hostID = this.hostID.substring(0, this.hostID.length - 1);
                } else {
                    game.Transition(Title, [1]);
                }
            } else if(key === "Enter") {
                this.hostMsg = new OnlineMessage(this.handler, "joinGame", this.hostID);
                this.lockInput = true;
                game.inputHandler.forceCleanKeyPress = false;
            } else if(key.length === 1) {
                this.hostID += key;
            }
        }
    },
    Update: function() {
        if(++this.animIter > 5) {
            this.animIter = 0;
            this.showUnderscore = !this.showUnderscore;
        }
        if(this.hostMsg !== null && this.hostMsg.complete && this.hostMsg.response.success) {
            this.handler.opponentName = this.hostID;
            this.handler.gameID = this.hostMsg.response.gameID;
        }
    },
    AnimUpdate: function() {
        gfx.ClearLayer("text");
        if(this.handler.hasError) {
            gfx.WriteEchoOptionText("An Error Occurred!", 320, 180, "text", "#FFFFFF", "#00AAAA", 36);
            gfx.WriteEchoOptionText(this.handler.errorMsg, 320, 240, "text", "#FFFFFF", "#00AAAA", 18);
        } else if(this.handler.gameID >= 0) {
            gfx.WriteEchoOptionText("Ready to Play!", 320, 180, "text", "#FFFFFF", "#00AAAA", 36);
            gfx.WriteEchoOptionText("Press any key or button to advance.", 320, 240, "text", "#FFFFFF", "#00AAAA", 18);
        } else if(this.handler.connectionId === "") {
            gfx.WriteEchoOptionText("Trying to connect...", 320, 230, "text", "#FFFFFF", "#00AAAA", 36);
        } else if(this.hostMsg === null) {
            gfx.WriteEchoOptionText("Please enter your opponent's Host ID:", 320, 180, "text", "#FFFFFF", "#00AAAA", 18);
            gfx.WriteEchoPlayerText(this.hostID + (this.showUnderscore ? "_" : ""), 140, 240, 590, "text", "#FFFFFF", "#00AAAA", 48, "left");
        } else if(this.hostMsg.complete) {
            if(this.hostMsg.response.success) {
                gfx.WriteEchoOptionText("Connected!", 320, 230, "text", "#FFFFFF", "#00AAAA", 36);
            } else {
                gfx.WriteEchoOptionText("Could not find that Host. :(", 320, 230, "text", "#FFFFFF", "#00AAAA", 36);
            }
        } else {
            gfx.WriteEchoOptionText("Trying to join game...", 320, 230, "text", "#FFFFFF", "#00AAAA", 36);
        }
    }
};