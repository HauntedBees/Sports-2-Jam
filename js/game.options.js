const playerOptions = {
    "sound": { displayName: "Sound", value: true },
    "music": { displayName: "Music", value: true },
    "voice": { displayName: "Voices", value: true },
    "captions": { displayName: "Voice Captions", value: true },
    "gameplay": { displayName: "Gameplay", value: false },
    "slowdown": { displayName: "Slowdown Mode", value: false },
    "particles": { displayName: "Particle Effects", value: true }
};
function SpeedMult() { return playerOptions["slowdown"].value ? 0.5 : 1; }
const OptionsScreen = {
    elems: [], selection: 0, controlWidth: 0, saveWidth: 0,
    GetY: i => 80 + i * 45,
    Init: function(fromControls) {
        gfx.DrawMapCharacter(0, 0, { x: 0, y: 0 }, "background", 640, 480, "background", 0, 0);
        gfx.WriteEchoOptionText("Options", 320, 32, "background", "#FFFFFF", "#BA66FF", 24);
        const options = Object.keys(playerOptions);
        this.elems = options.map((key, i) => {
            const obj = playerOptions[key];
            const y = this.GetY(i);
            const len = gfx.WriteEchoPlayerText(obj.displayName, 320, y, 300, "background", "#FFFFFF", "#0000AA", 22, "right");
            return { len: len, y: y, key: key, value: obj.value };
        });
        this.controlWidth = gfx.WriteEchoOptionText("Change Controls", 320, this.GetY(options.length), "background", "#FFFFFF", "#0000AA", 24);
        this.saveWidth = gfx.WriteEchoOptionText("Save and Quit", 320, this.GetY(options.length + 1.5), "background", "#FFFFFF", "#0000AA", 24);
        this.selection = fromControls === true ? this.elems.length : 0;
    },
    CleanUp: function() { this.elems = []; },
    KeyPress: function(key) {
        switch(key) {
            case game.p1c["pause"]: 
            case game.p1c["cancel"]:
                this.selection = this.elems.length + 1;
                break;
            case game.p1c["confirm"]: return this.ToggleOption();
            case game.p1c["left"]: return this.ToggleOption(false);
            case game.p1c["right"]: return this.ToggleOption(true);
            case game.p1c["down"]: return this.NavigateOptions(1);
            case game.p1c["up"]: return this.NavigateOptions(-1);
        }
    },
    ToggleOption: function(forcedVal) {
        if(this.selection < this.elems.length) {
            const sel = this.elems[this.selection];
            if(sel.key === "gameplay") { return Sounds.PlaySound("cancel", true); }
            if(forcedVal !== undefined && forcedVal === sel.value) { return Sounds.PlaySound("cancel", true); }
            sel.value = !sel.value;
            if(sel.key === "music") {
                if(sel.value) {
                    Sounds.ResumeSong();
                } else {
                    Sounds.StopSong();
                }
            }
            playerOptions[sel.key].value = sel.value;
            Sounds.PlaySound("confirm", true);
            return;
        }
        if(forcedVal !== undefined) { return; }
        Sounds.PlaySound("confirm", true);
        if(this.selection > this.elems.length) { // save and quit
            game.Transition(Title, [2]);
        } else { // controls
            game.Transition(ControlsScreen);
        }
    },
    NavigateOptions: function(dx) {
        if(this.selection === 0 && dx < 0) { return; }
        if(this.selection === (this.elems.length + 1) && dx > 0) { return; }
        this.selection += dx;
    },
    Update: function() { },
    AnimUpdate: function() {
        gfx.ClearLayer("interface");
        this.elems.forEach(e => {
            gfx.DrawCenteredSprite("bigsprites", e.value ? 2 : 3, 1, 390, e.y - 6, "interface", 128, 1);
        });
        if(this.selection < this.elems.length) { // actual option
            const sel = this.elems[this.selection];
            gfx.DrawCenteredSprite("sprites", 2, 0, 300 - sel.len, sel.y - 8, "interface", 32, 0.75);
            gfx.DrawCenteredSprite("sprites", 2, 0, 450, sel.y - 8, "interface", 32, 0.75);
        } else if(this.selection === this.elems.length) { // controls
            const y = this.GetY(this.elems.length) - 8;
            gfx.DrawCenteredSprite("sprites", 2, 0, 305 - this.controlWidth / 2, y, "interface", 32, 0.75);
            gfx.DrawCenteredSprite("sprites", 2, 0, 335 + this.controlWidth / 2, y, "interface", 32, 0.75);
        } else if(this.selection > this.elems.length) { // save and quit
            const y = this.GetY(this.elems.length + 1.5) - 8;
            gfx.DrawCenteredSprite("sprites", 2, 0, 305 - this.saveWidth / 2, y, "interface", 32, 0.75);
            gfx.DrawCenteredSprite("sprites", 2, 0, 335 + this.saveWidth / 2, y, "interface", 32, 0.75);
        }
    }
};

const ControlsScreen = {
    elems: [], sx: 0, sy: 0, changing: false, 
    x0: 310, x1: 390, x2: 540, 
    optionFontSize: 18, 
    GetY: i => 120 + i * 40,
    Init: function() {
        gfx.DrawMapCharacter(0, 0, { x: 0, y: 0 }, "background", 640, 480, "background", 0, 0);
        gfx.WriteEchoOptionText("Controls", 320, 32, "background", "#FFFFFF", "#BA66FF", 24);
        const controlKeys = Object.keys(game.p1c.currentControls);
        gfx.WriteEchoOptionText("Player 1", this.x1, this.GetY(-0.9), "background", "#FFFFFF", "#BA66FF", this.optionFontSize);
        gfx.WriteEchoOptionText("Player 2", this.x2, this.GetY(-0.9), "background", "#FFFFFF", "#BA66FF", this.optionFontSize);
        controlKeys.forEach((key, i) => {
            const p1Control = game.p1c.currentControls[key], p2Control = game.p2c.currentControls[key];
            gfx.WriteEchoPlayerText(key.toUpperCase(), this.x0, this.GetY(i), 300, "background", "#FFFFFF", "#0000AA", this.optionFontSize, "right");
            this.elems.push([key, p1Control, p2Control]);
        });
        gfx.DrawRectSprite("controller", 0, 0, 105, 240, "background", 300, 142, 0.65, true);
    },
    CleanUp: function() { this.elems = []; },
    KeyPress: function(key) {
        if(this.changing) { return this.ConfirmNewKey(key); }
        switch(key) {
            case game.p1c["cancel"]: 
            case game.p1c["pause"]: 
                this.sy = this.elems.length;
                break;
            case " ":
            case game.p1c["confirm"]:
                Sounds.PlaySound("confirm", true);
                if(this.sy === this.elems.length) {
                    return game.Transition(OptionsScreen, [true]);
                } else {
                    game.inputHandler.forceCleanKeyPress = true;
                    this.changing = true;
                }
                break;
            case "ArrowDown":
            case game.p1c["down"]: return this.MoveCursor(0, 1);
            case "ArrowUp":
            case game.p1c["up"]: return this.MoveCursor(0, -1);
            case "ArrowLeft":
            case game.p1c["left"]: return this.MoveCursor(-1, 0);
            case "ArrowRight":
            case game.p1c["right"]: return this.MoveCursor(1, 0);
        }
    },
    ConfirmNewKey(key) {
        Sounds.PlaySound("confirm", false);
        game.inputHandler.forceCleanKeyPress = false;
        this.changing = false;
        const selection = this.elems[this.sy];
        const keyKey = selection[0];
        if(this.sx === 0) {
            game.p1c.ChangeInputBinding(keyKey, key);
            selection[1] = key;
        } else {
            game.p2c.ChangeInputBinding(keyKey, key);
            selection[2] = key;
        }
        game.inputHandler.ignoreNextKeyPress = true;
    },
    MoveCursor(dx, dy) {
        if(this.changing) { return; }
        if(dx < 0 && this.sx === 0) { return; }
        if(dx > 0 && this.sx === 1) { return; }
        if(dy < 0 && this.sy === 0) { return; }
        if(dy > 0 && this.sy === this.elems.length) { return; }
        this.sx += dx;
        this.sy += dy;
    },
    Update: function() { },
    GetDisplayName: function(key, sx, sy) {
        if(sx === this.sx && sy === this.sy && this.changing) { return ">PRESS KEY<"; }
        if(key === " ") { return "Space"; }
        if(key.indexOf("Arrow") === 0) { return key.replace("Arrow", "") + " Arrow"; }
        if(key.indexOf("Gamepad") === 0) {
            switch(key) {
                case "Gamepad12": return "Dir Up";
                case "Gamepad13": return "Dir Down";
                case "Gamepad14": return "Dir Left";
                case "Gamepad15": return "Dir Right";
                case "Gamepad0": return "A Btn";
                case "Gamepad1": return "B Btn";
                case "Gamepad2": return "X Btn";
                case "Gamepad3": return "Y Btn";
                case "Gamepad4": return "L Btn";
                case "Gamepad5": return "R Btn";
                case "Gamepad6": return "L2 Btn";
                case "Gamepad7": return "R2 Btn";
                case "Gamepad8": return "Back Btn";
                case "Gamepad9": return "Start Btn";
                case "Gamepad10": return "L3 Btn";
                case "Gamepad11": return "R3 Btn";
                case "GamepadA0": return "L-Stick Left";
                case "GamepadA1": return "L-Stick Up";
                case "GamepadA2": return "R-Stick Left";
                case "GamepadA3": return "R-Stick Up";
                case "GamepadA4": return "L-Stick Right";
                case "GamepadA5": return "L-Stick Down";
                case "GamepadA6": return "R-Stick Right";
                case "GamepadA7": return "R-Stick Down";
            }
        }
        return key;
    },
    AnimUpdate: function() {
        gfx.ClearLayer("interface");
        this.elems.forEach((e, i) => {
            const sel1 = (this.sx === 0 && this.sy === i), sel2 = (this.sx === 1 && this.sy === i);
            gfx.WriteEchoOptionText(this.GetDisplayName(e[1], 0, i), this.x1, this.GetY(i), "interface", (sel1 ? "#FFFF00" : "#FFFFFF"), "#0000AA", this.optionFontSize + (sel1 ? 8 : 0));
            gfx.WriteEchoOptionText(this.GetDisplayName(e[2], 1, i), this.x2, this.GetY(i), "interface", (sel2 ? "#FFFF00" : "#FFFFFF"), "#0000AA", this.optionFontSize + (sel2 ? 8 : 0));
        });
        const selLast = this.sy === this.elems.length;
        gfx.WriteEchoOptionText("Save and Quit", 320, this.GetY(this.elems.length + 1), "interface", (selLast ? "#FFFF00" : "#FFFFFF"), "#0000AA", this.optionFontSize + (selLast ? 8 : 0));
        if(!selLast) {
            gfx.DrawRectSprite("controller", (this.sy + 1) % 2, Math.floor((this.sy + 1) / 2), 105, 240, "interface", 300, 142, 0.65, true);
        }
    }
};