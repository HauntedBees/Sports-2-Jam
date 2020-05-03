class GameInput {
    justPressed = {}; keys = {};
    /** @type {number} */ mainDirectionKey = undefined; 
    usingGamepad = false; gamepadIndex = 0;
    freeMovement = false; ignore = false;
    triggerMin = 0.5; deadZones = [0.25, 0.25, 0.25, 0.25]; buttonDelay = 10;
    gamepadButtons = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // buttons 0 - 15
        0, 0, 0, 0, // negative axes Lx Ly Rx Ry
        0, 0, 0, 0]; // positive axes Lx Ly Rx Ry
    /** @type {string[]} */ controlArray = [];
    /** @param {{ up: string; left: string; down: string; right: string; confirm: string; cancel: string; pause: string; }} keyboardDefaults */
    constructor(playerNum, keyboardDefaults) {
        this.playerNum = playerNum;
        this.keyboardControls = keyboardDefaults;
        this.gamepadControls = { up: "Gamepad12", left: "Gamepad14", down: "Gamepad13", right: "Gamepad15", confirm: "Gamepad0", cancel: "Gamepad1", pause: "Gamepad9" };
        this.currentControls = this.keyboardControls;
        this.ResetControlArray();
        return new Proxy(this, {
            get: (obj, key) => {
                if(typeof(key) === "string" && obj.currentControls[key] !== undefined) {
                    return obj.Key(key);
                } else {
                    return obj[key];
                }
            }
        });
    }
    /** @param {string} key */
    Key(key) {
        if(this.usingGamepad) {
            return this.gamepadIndex.toString() + this.currentControls[key];
        } else {
            return this.currentControls[key];
        }
    }
    /** @param {string} key @param {string} value */
    ChangeInputBinding(key, value) {
        (this.usingGamepad ? this.gamepadControls : this.keyboardControls)[key] = value;
        this.ResetControlArray();
    }
    ResetControlArray() {
        if(this.usingGamepad) { this.controlArray = Object.keys(this.gamepadControls).map(k => this.gamepadControls[k]); }
        else { this.controlArray = Object.keys(this.keyboardControls).map(k => this.keyboardControls[k]); }
    }
    /** @param {number} idx */
    SetGamepad(idx) {
        this.usingGamepad = true;
        this.gamepadIndex = idx;
        this.currentControls = this.gamepadControls;
    }
    /** @param {boolean} isGamepad */
    ToggleControlType(isGamepad) {
        this.usingGamepad = isGamepad;
        this.currentControls = isGamepad ? this.gamepadControls : this.keyboardControls;
    }
    IsFreshPauseOrConfirmPress() {
        return this.justPressed[this.currentControls.pause] === 0 || this.justPressed[this.currentControls.confirm] === 0;
    }
    /** @param {string} [key] */
    SetMainKey(key) {
        if(key === undefined) {
            if(this.keys[this.currentControls.up] !== undefined) { this.mainDirectionKey = 0; }
            else if(this.keys[this.currentControls.left] !== undefined) { this.mainDirectionKey = 1; }
            else if(this.keys[this.currentControls.down] !== undefined) { this.mainDirectionKey = 2; }
            else if(this.keys[this.currentControls.right] !== undefined) { this.mainDirectionKey = 3; }
            else { this.mainDirectionKey = undefined; }
        } else if(this.mainDirectionKey === undefined) {
            this.mainDirectionKey = [this.currentControls.up, this.currentControls.left, this.currentControls.down, this.currentControls.right].indexOf(key);
        }
    }
    ClearAllKeys() {
        this.mainDirectionKey = undefined;
        for(const key in this.keys) {
            clearInterval(this.keys[key]);
            this.keys[key] = undefined;
        }
    }
    /** @param {string} key */
    IsIgnoredByKeyPress(key) {
        if(key.indexOf("Arrow") === 0) { return true; }
        if(key[0] === "F" && key.length > 1) { return true; }
        return ["Alt", "Shift", "Control", "CapsLock", "Tab", "Escape", "Backspace", "NumLock",
                "Delete", "End", "PageDown", "PageUp", "Home", "Insert", "ScrollLock", "Pause"].indexOf(key) >= 0;
    }
    /** @param {KeyboardEvent} e */
    GetKey(e) { return e.key.length === 1 ? e.key.toLowerCase() : e.key; }

    /** @param {KeyboardEvent} e */
    KeyDown(e) {
        if(helper.isVisible) { return; }
        const key = this.GetKey(e);
        if(this.controlArray.indexOf(key) < 0) { return; }
        this.ToggleControlType(false);
        this.justPressed[key] = this.justPressed[key] === undefined ? 0 : (this.justPressed[key] + 1);
        if([this.currentControls.up, this.currentControls.left, this.currentControls.down, this.currentControls.right].indexOf(key) >= 0 && this.freeMovement) {
            this.SetMainKey(key);
            if(this.keys[key] !== undefined) { return; }
            this.keys[key] = setInterval(function() {
                game.KeyPress(key);
            }, 50);
        } else if(this.IsIgnoredByKeyPress(key)) { game.KeyPress(key); }        
    }
    /** @param {KeyboardEvent} e */
    KeyUp(e) {
        if(helper.isVisible) { return; }
        const key = this.GetKey(e);
        if(this.controlArray.indexOf(key) < 0) { return; }
        this.justPressed[key] = -1;
        if([this.currentControls.up, this.currentControls.left, this.currentControls.down, this.currentControls.right].indexOf(key) >= 0 && this.freeMovement) {
            clearInterval(this.keys[key]);
            this.keys[key] = undefined;
            this.SetMainKey();
        }
    }
    /** @param {KeyboardEvent} e */
    KeyPress(e) {
        const key = this.GetKey(e);
        this.KeyPressFromKey(key);
    }
    /** @param {string} key */
    KeyPressFromKey(key) {
        if(key === "h") { return helper.GetHelpInformation(this.playerNum, true); }
        if(helper.isVisible) { return; }
        if(this.controlArray.indexOf(key) < 0) { return; }
        if([this.currentControls.up, this.currentControls.left, this.currentControls.down, this.currentControls.right].indexOf(key) >= 0 && this.freeMovement) {
            return;
        }
        game.KeyPress(key);
        this.justPressed[key]++;
    }
    /** @param {Gamepad} gp */
    ParseGamepad(gp) {
        if(gp === null || gp.index !== this.gamepadIndex) { return; }
        const buttonsDown = [];
        gp.buttons.forEach((e, i) => {
            if(e.pressed && e.value >= this.triggerMin && i < 16) { buttonsDown.push(i); }
        });
        gp.axes.forEach((e, i) => {
            if(e <= -this.deadZones[i]) {
                buttonsDown.push(16 + i);
            } else if(e >= this.deadZones[i]) {
                buttonsDown.push(20 + i);
            }
        });
        if(buttonsDown.length > 0) { this.ToggleControlType(true); }
        this.gamepadButtons.forEach((prevState, i) => {
            const btn = (i < 16) ? ("Gamepad" + i) : ("GamepadA" + (i - 16));
            const movements = [this.currentControls.up, this.currentControls.left, this.currentControls.down, this.currentControls.right];
            if(buttonsDown.indexOf(i) < 0 && buttonsDown.indexOf(-i) < 0) { // not pressed
                if(prevState > 0) { // just released
                    this.gamepadButtons[i] = -1;
                    this.justPressed[btn] = -1;
                    if(movements.indexOf(btn) >= 0 && this.freeMovement) {
                        clearInterval(this.keys[btn]);
                        this.keys[btn] = undefined;
                        this.SetMainKey();
                    }
                } else { this.gamepadButtons[i] = 0; } // not pressed
            } else { // pressed
                this.gamepadButtons[i]++;
                const btnVal = this.gamepadButtons[i];
                if(btnVal === 1 || (btnVal >= 45 && btnVal % 15 === 0)) {
                    this.justPressed[btn] = this.justPressed[btn] === undefined ? 0 : (this.justPressed[btn] + 1);
                    if(movements.indexOf(btn) >= 0 && this.freeMovement) {
                        if(helper.isVisible) { return; }
                        this.SetMainKey(btn);
                        if(this.keys[btn] !== undefined) { return; }
                        const me = this;
                        this.keys[btn] = setInterval(function() {
                            game.KeyPress(me.gamepadIndex.toString() + btn);
                        }, this.buttonDelay);
                    } else {
                        if(btn === "Gamepad8") { return helper.GetHelpInformation(this.playerNum, false); }
                        if(helper.isVisible) { return; }
                        game.KeyPress(this.gamepadIndex.toString() + btn);
                    }
                }
            }
        });
    }
}
class ShellGameInput extends GameInput {
    constructor() {
        super(0, { up: "", left: "", down: "", right: "", confirm: "", cancel: "", pause: "" });
        this.ignore = true;
    }
    Key(key) { return ""; }
    ChangeInputBinding(key, value) {}
    ResetControlArray() {}
    SetGamepad(idx) {}
    ToggleControlType(isGamepad) {}
    IsFreshPauseOrConfirmPress() { return false; }
    SetMainKey(key) {}
    ClearAllKeys() {}
    IsIgnoredByKeyPress(){ return false; }
    GetKey() { return ""; }
    KeyDown(e) {}
    KeyUp(e) {}
    KeyPress(e) {}
    ParseGamepad(gp) {}
}
const NPCInput = new ShellGameInput();
class InputHandler {
    forceCleanKeyPress = false; ignoreNextKeyPress = false;
    gamepads = {}; gamepadQueryIdx = -1;
    controlSets = [
        new GameInput(1, { up: "w", left: "a", down: "s", right: "d", confirm: " ", cancel: "q", pause: "Enter" }),
        new GameInput(2, { up: "ArrowUp", left: "ArrowLeft", down: "ArrowDown", right: "ArrowRight", confirm: "o", cancel: "u", pause: "p" })
    ];
    constructor() {
        const me = this;
        // @ts-ignore
        window.addEventListener("gamepadconnected", function(e) { me.GamepadConnected(e); });
        // @ts-ignore
        window.addEventListener("gamepaddisconnected", function(e) { me.GamepadDisconnected(e); });
        // @ts-ignore
        document.addEventListener("keypress", function(e) { me.KeyPress(e); });
        // @ts-ignore
        document.addEventListener("keydown", function(e) { me.KeyDown(e); });
        // @ts-ignore
        document.addEventListener("keyup", function(e) { me.KeyUp(e); });
    }
    /** @param {GamepadEvent} e */
    GamepadConnected(e) {
        this.gamepads[e.gamepad.index] = e.gamepad;
        console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.", e.gamepad.index, e.gamepad.id, e.gamepad.buttons.length, e.gamepad.axes.length);
        if(e.gamepad.index === 0) {
            this.controlSets[0].SetGamepad(0);
        } else if(e.gamepad.index === 1) {
            this.controlSets[1].SetGamepad(1);
        }
        if(this.gamepadQueryIdx < 0) {
            const me = this;
            this.gamepadQueryIdx = setInterval(function() { me.QueryGamepads(); }, 10);
        }
    }
    /** @param {GamepadEvent} e */
    GamepadDisconnected(e) {
        delete this.gamepads[e.gamepad.index];
        if(Object.keys(this.gamepads).length === 0) {
            console.log("no gamepads left!");
            clearInterval(this.gamepadQueryIdx);
            this.gamepadQueryIdx = -1;
        }
    }
    QueryGamepads() {
        const gamepads = navigator.getGamepads();
        if(gamepads === undefined || gamepads === null || !document.hasFocus()) { return; }
        const numGamepads = gamepads.length;
        for(let i = 0; i < numGamepads; i++) {
            this.controlSets.forEach(c => { if(!c.ignore) { c.ParseGamepad(gamepads[i]); }});
        }
    }
    /** @param {KeyboardEvent} e */
    KeyPress(e) {
        if(this.forceCleanKeyPress) { return; }
        if(this.ignoreNextKeyPress) { // is this a hack? yes. does it work? also yes.
            this.ignoreNextKeyPress = false;
            return;
        }
        this.controlSets.forEach(c => { if(!c.ignore) { c.KeyPress(e); }});
    }
    /** @param {KeyboardEvent} e */
    KeyDown(e) {
        if(this.forceCleanKeyPress) { game.KeyPress(e.key); return; }
        this.controlSets.forEach(c => { if(!c.ignore) { c.KeyDown(e); }});
    }
    /** @param {KeyboardEvent} e */
    KeyUp(e) { this.controlSets.forEach(c => { if(!c.ignore) { c.KeyUp(e); }}); }
};