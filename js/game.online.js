class OnlineHandler {
    peerId = -1;
    hasError = false; errorMsg = "";
    connection = null;
    constructor() {
        const me = this;
        this.peer = new Peer();
        this.peer.on("open", function(id) {
            me.peerId = id;
        });
        this.peer.on("connection", function(conn) {
            me.connection = conn;
        });
        this.peer.on("error", function(err) {
            me.hasError = true;
            switch(err.type) {
                case "browser-incompatible": me.errorMsg = "Your browser does not support this feature."; break;
                case "disconnected": me.errorMsg = "You've already disconnected from the peer."; break;
                case "invalid-id": me.errorMsg = "Invalid Host ID."; break;
                case "invalid-key": me.errorMsg = "Invalid API Key."; break;
                case "invalid-key": me.errorMsg = "Invalid API Key."; break;
                case "network": me.errorMsg = "Network Connection lost."; break;
                case "peer-unavailable": me.errorMsg = "Host with provided Host ID not found."; break;
                case "ssl-unavailable": me.errorMsg = "Secure Connection unavailable."; break;
                case "server-error": me.errorMsg = "Unable to reach server."; break;
                case "socket-error": me.errorMsg = "A socket error occurred."; break;
                case "socket-closed": me.errorMsg = "The socket closed unexpectedly."; break;
                case "unavailable-id": me.errorMsg = "This Host ID is already taken."; break;
                case "webrtc": me.errorMsg = "WebRTC Error."; break;
                default: me.errorMsg = "Unknown Error: " + err.type; break;
            }
        });
    }
    Connect(hostID) {
        this.connection = this.peer.connect(hostID, { serialization: "json" });
    }
}
const OnlineHostGame = {
    /** @type {OnlineHandler} */ peer: null,
    Init: function() {
        gfx.DrawMapCharacter(0, 0, { x: 0, y: 0 }, "background", 640, 480, "background", 0, 0);
        this.peer = new OnlineHandler();
    },
    CleanUp: function() { this.elems = []; },
    KeyPress: function(key) {
        switch(key) {
            case game.p1c["pause"]: 
            case game.p1c["confirm"]:
                break;
            case game.p1c["down"]: break;
            case game.p1c["up"]: break;
        }
    },
    Update: function() {

    },
    AnimUpdate: function() {
        gfx.ClearLayer("text");
        if(this.peer.peerId < 0) { 
            gfx.WriteEchoOptionText("Trying to connect...", 320, 230, "text", "#FFFFFF", "#00AAAA", 36);
        } else {
            gfx.WriteEchoOptionText("Your Host ID is", 320, 180, "text", "#FFFFFF", "#00AAAA", 24);
            gfx.WriteEchoOptionText(this.peer.peerId.toString(), 320, 240, "text", "#FFFFFF", "#00AAAA", 48);
            gfx.WriteEchoOptionText("Share this Host ID with your opponent.", 320, 290, "text", "#FFFFFF", "#00AAAA", 24);
            gfx.WriteEchoOptionText("It is recommended you both use the same browser.", 320, 320, "text", "#FFFFFF", "#00AAAA", 18);
        }
    }
};
const OnlineJoinGame = {
    /** @type {OnlineHandler} */ peer: null,
    hostID: "", animIter: 0, showUnderscore: true,
    Init: function() {
        gfx.DrawMapCharacter(0, 0, { x: 0, y: 0 }, "background", 640, 480, "background", 0, 0);
        this.peer = new OnlineHandler();
        this.hostID = "";
        this.lockInput = false;
        game.inputHandler.forceCleanKeyPress = true;
    },
    CleanUp: function() { this.elems = []; },
    KeyPress: function(key) {
        if(this.lockInput) {

        } else {
            if(key === "Backspace") {
                if(this.hostID !== "") {
                    this.connectId = this.hostID.substring(0, this.hostID.length - 1);
                } else {
                    game.Transition(Title, [1]);
                }
            } else if(key === "Enter") {
                this.peer.Connect(this.hostID);
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
    },
    AnimUpdate: function() {
        gfx.ClearLayer("text");
        if(this.peer.hasError) {
            gfx.WriteEchoOptionText("An Error Occurred!", 320, 180, "text", "#FFFFFF", "#00AAAA", 36);
            gfx.WriteEchoOptionText(this.peer.errorMsg, 320, 240, "text", "#FFFFFF", "#00AAAA", 18);
            gfx.WriteEchoOptionText("You can probably try again or something.", 320, 290, "text", "#FFFFFF", "#00AAAA", 24);
        } else if(this.peer.connection !== null) {
            gfx.WriteEchoOptionText("Connected! Awaiting response from Host.", 320, 230, "text", "#FFFFFF", "#00AAAA", 36);
        } else if(this.peer.peerId < 0) { 
            gfx.WriteEchoOptionText("Trying to connect...", 320, 230, "text", "#FFFFFF", "#00AAAA", 36);
        } else {
            gfx.WriteEchoOptionText("Please enter your opponent's Host ID:", 320, 180, "text", "#FFFFFF", "#00AAAA", 18);
            gfx.WriteEchoPlayerText(this.hostID + (this.showUnderscore ? "_" : ""), 50, 240, 590, "text", "#FFFFFF", "#00AAAA", 48, "left");
        }
    }
};