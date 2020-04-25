const playerOptions = {
    "sound": { displayName: "Sound", value: true },
    "music": { displayName: "Music", value: true },
    "voice": { displayName: "Voices", value: true },
    "gameplay": { displayName: "Gameplay", value: false },
    "particles": { displayName: "Particle Effects", value: true }
};
const OptionsScreen = {
    elems: [], selection: 0, controlWidth: 0, saveWidth: 0,
    GetY: i => 80 + i * 50,
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
        this.saveWidth = gfx.WriteEchoOptionText("Save and Quit", 320, this.GetY(options.length + 2.5), "background", "#FFFFFF", "#0000AA", 24);
        this.selection = fromControls === true ? this.elems.length : 0;
    },
    CleanUp: function() { this.elems = []; },
    KeyPress: function(key) {
        switch(key) {
            case controls.pause: 
            case controls.cancel:
                this.selection = this.elems.length + 1;
                break;
            case controls.confirm: return this.ToggleOption();
            case controls.left: return this.ToggleOption(false);
            case controls.right: return this.ToggleOption(true);
            case controls.down: return this.NavigateOptions(1);
            case controls.up: return this.NavigateOptions(-1);
        }
    },
    ToggleOption: function(forcedVal) {
        if(this.selection < this.elems.length) {
            const sel = this.elems[this.selection];
            if(sel.key === "gameplay") { return Sounds.PlaySound("cancel", true); }
            if(forcedVal !== undefined && forcedVal === sel.value) { return Sounds.PlaySound("cancel", true); }
            sel.value = !sel.value;
            playerOptions[sel.key].value = sel.value;
            Sounds.PlaySound("confirm", true);
            return;
        }
        if(forcedVal !== undefined) { return; }
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
            gfx.DrawCenteredSprite("bigsprites", e.value ? 0 : 1, 1, 390, e.y - 6, "interface", 128, 1);
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
            const y = this.GetY(this.elems.length + 2.5) - 8;
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
        const controlKeys = Object.keys(controls);
        gfx.WriteEchoOptionText("Player 1", this.x1, this.GetY(-0.9), "background", "#FFFFFF", "#BA66FF", this.optionFontSize);
        gfx.WriteEchoOptionText("Player 2", this.x2, this.GetY(-0.9), "background", "#FFFFFF", "#BA66FF", this.optionFontSize);
        controlKeys.forEach((key, i) => {
            const p1Control = controls[key], p2Control = controls2[key];
            gfx.WriteEchoPlayerText(key.toUpperCase(), this.x0, this.GetY(i), 300, "background", "#FFFFFF", "#0000AA", this.optionFontSize, "right");
            this.elems.push([key, p1Control, p2Control]);
        });
        gfx.DrawRectSprite("controller", 0, 0, 105, 240, "background", 300, 142, 0.65, true);
    },
    CleanUp: function() { this.elems = []; },
    KeyPress: function(key) {
        if(this.changing) { return this.ConfirmNewKey(key); }
        switch(key) {
            case controls.cancel: 
            case controls.pause: 
                this.sy = this.elems.length;
                break;
            case " ":
            case controls.confirm:
                Sounds.PlaySound("confirm", true);
                if(this.sy === this.elems.length) {
                    return game.Transition(OptionsScreen, [true]);
                } else {
                    input.forceCleanKeyPress = true;
                    this.changing = true;
                }
                break;
            case "ArrowDown":
            case controls.down: return this.MoveCursor(0, 1);
            case "ArrowUp":
            case controls.up: return this.MoveCursor(0, -1);
            case "ArrowLeft":
            case controls.left: return this.MoveCursor(-1, 0);
            case "ArrowRight":
            case controls.right: return this.MoveCursor(1, 0);
        }
    },
    ConfirmNewKey(key) {
        Sounds.PlaySound("confirm", false);
        input.forceCleanKeyPress = false;
        this.changing = false;
        const selection = this.elems[this.sy];
        const keyKey = selection[0];
        if(this.sx === 0) {
            controls[keyKey] = key;
            selection[1] = key;
        } else {
            controls2[keyKey] = key;
            selection[2] = key;
        }
        ResetControlsArrays();
        input.ignoreNextKeyPress = true;
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