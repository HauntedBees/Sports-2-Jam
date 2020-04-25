/*const gpVals = { triggerMin: 0.5, deadZones: [0.25, 0.25, 0.25, 0.25] };
const controlSet = {
    p1UsingGamepad: false, p2UsingGamepad: false, 
    p1Controls: { up: "w", left: "a", down: "s", right: "d", confirm: " ", cancel: "q", pause: "Enter" },
    p2Controls: { up: "ArrowUp", left: "ArrowLeft", down: "ArrowDown", right: "ArrowRight", confirm: "o", cancel: "u", pause: "p" },
    p1ControlsGamepad: { up: "1Gamepad12", left: "1Gamepad14", down: "1Gamepad13", right: "1Gamepad15", confirm: "1Gamepad0", cancel: "1Gamepad1", pause: "1Gamepad9" },
    p2ControlsGamepad: { up: "2Gamepad12", left: "2Gamepad14", down: "2Gamepad13", right: "2Gamepad15", confirm: "2Gamepad0", cancel: "2Gamepad1", pause: "2Gamepad9" },
    ResetControlsArrays: function() { // TODO: this for like gamepads
        this.p1Arr = Object.keys(controls).map(k => this.p1Controls[k]);
        this.p2Arr = Object.keys(controls2).map(k => this.p2Controls[k]);
    }
};*/
let controls = { up: "w", left: "a", down: "s", right: "d", confirm: " ", cancel: "q", pause: "Enter" };
let controls2 = { up: "ArrowUp", left: "ArrowLeft", down: "ArrowDown", right: "ArrowRight", confirm: "o", cancel: "u", pause: "p" };
let controlsArr = Object.keys(controls).map(k => controls[k]);
let controls2Arr = Object.keys(controls2).map(k => controls2[k]);
function ResetControlsArrays() {
    controlsArr = Object.keys(controls).map(k => controls[k]);
    controls2Arr = Object.keys(controls2).map(k => controls2[k]);
}
const input = {
    forceCleanKeyPress: false, ignoreNextKeyPress: false, 
    justPressed: {}, keys: {}, mainKey: undefined, mainKey2: undefined, 
    IsFreshPauseOrConfirmPress: () => (input.justPressed[controls.pause] === 0) || (input.justPressed[controls.confirm] === 0),
    setMainKey: function(key) {
        if(key === undefined) {
            if(input.keys[controls.up] !== undefined) { input.mainKey = 0; }
            else if(input.keys[controls.left] !== undefined) { input.mainKey = 1; }
            else if(input.keys[controls.down] !== undefined) { input.mainKey = 2; }
            else if(input.keys[controls.right] !== undefined) { input.mainKey = 3; }
            else { input.mainKey = undefined; }
        } else if(input.mainKey === undefined) {
            input.mainKey = [controls.up, controls.left, controls.down, controls.right].indexOf(key);
        }
    },
    setMainKey2: function(key) {
        if(key === undefined) {
            if(input.keys[controls2.up] !== undefined) { input.mainKey2 = 0; }
            else if(input.keys[controls2.left] !== undefined) { input.mainKey2 = 1; }
            else if(input.keys[controls2.down] !== undefined) { input.mainKey2 = 2; }
            else if(input.keys[controls2.right] !== undefined) { input.mainKey2 = 3; }
            else { input.mainKey2 = undefined; }
        } else if(input.mainKey2 === undefined) {
            input.mainKey2 = [controls2.up, controls2.left, controls2.down, controls2.right].indexOf(key);
        }
    },
    ClearAllKeys: function() {
        input.mainKey = undefined;
        for(const key in input.keys) {
            clearInterval(input.keys[key]);
            input.keys[key] = undefined;
        }
    },
    IsIgnoredByKeyPress(key) {
        if(key.indexOf("Arrow") === 0) { return true; }
        if(key[0] === "F" && key.length > 1) { return true; }
        return ["Alt", "Shift", "Control", "CapsLock", "Tab", "Escape", "Backspace", "NumLock",
                "Delete", "End", "PageDown", "PageUp", "Home", "Insert", "ScrollLock", "Pause"].indexOf(key) >= 0;
    },
    GetKey: e => e.key.length === 1 ? e.key.toLowerCase() : e.key,
    keyDown: function(e) {
        if(input.forceCleanKeyPress) {
            game.currentHandler.KeyPress(e.key);
            return;
        }
        const key = input.GetKey(e);
        input.justPressed[key] = input.justPressed[key] === undefined ? 0 : input.justPressed[key] + 1;
        let controlSet = null, freeMovement = false, playerNum = 0;
        if(controlsArr.indexOf(key) >= 0) {
            controlSet = controls;
            freeMovement = game.currentHandler.freeMovement || false;
            playerNum = 1;
        } else if(controls2Arr.indexOf(key) >= 0) {
            controlSet = controls2;
            freeMovement = game.currentHandler.freeMovement2 || (game.currentHandler.freeMovement === undefined ? false : game.currentHandler.freeMovement);
            playerNum = 2;
        }
        if(controlSet === null) { return; }
        input.keyDown2(key, controlSet, freeMovement, playerNum);
    },
    keyDown2: function(key, keySet, freeMovement, playerNum) {
        if([keySet.up, keySet.left, keySet.down, keySet.right].indexOf(key) >= 0 && freeMovement) {
            if(playerNum === 1) { input.setMainKey(key); }
            else { input.setMainKey2(key); }

            if(input.keys[key] !== undefined) { return; }
            input.keys[key] = setInterval(function() {
                game.currentHandler.KeyPress(key);
            }, 50);
        } else if(input.IsIgnoredByKeyPress(key)) { game.currentHandler.KeyPress(key); }
    },
    keyUp: function(e) {
        const key = input.GetKey(e);
        input.justPressed[key] = -1;
        let controlSet = null, freeMovement = false, playerNum = 0;
        if(controlsArr.indexOf(key) >= 0) {
            controlSet = controls;
            freeMovement = game.currentHandler.freeMovement || false;
            playerNum = 1;
        } else if(controls2Arr.indexOf(key) >= 0) {
            controlSet = controls2;
            freeMovement = game.currentHandler.freeMovement2 || (game.currentHandler.freeMovement === undefined ? false : game.currentHandler.freeMovement);
            playerNum = 2;
        }
        if(controlSet === null) { return; }
        input.keyUp2(key, controlSet, freeMovement, playerNum);
    },
    keyUp2: function(key, keySet, freeMovement, playerNum) {
        if([keySet.up, keySet.left, keySet.down, keySet.right].indexOf(key) >= 0 && freeMovement) {
            clearInterval(input.keys[key]);
            input.keys[key] = undefined;
            if(playerNum === 1) { input.setMainKey(); }
            else { input.setMainKey2(); }
        }
    },
    keyPress: function(e) {
        if(input.forceCleanKeyPress) { return; }
        if(input.ignoreNextKeyPress) { // is this a hack? yes. does it work? also yes.
            input.ignoreNextKeyPress = false;
            return;
        }
        const key = input.GetKey(e);
        let controlSet = null, freeMovement = false;
        if(controlsArr.indexOf(key) >= 0) {
            controlSet = controls;
            freeMovement = game.currentHandler.freeMovement || false;
        } else if(controls2Arr.indexOf(key) >= 0) {
            controlSet = controls2;
            freeMovement = game.currentHandler.freeMovement2 || (game.currentHandler.freeMovement === undefined ? false : game.currentHandler.freeMovement);
        }
        if(controlSet === null) { return; }
        if([controlSet.up, controlSet.left, controlSet.down, controlSet.right].indexOf(key) >= 0 && freeMovement) {
            return;
        }
        game.currentHandler.KeyPress(key);
        input.justPressed[key]++;
    },/*
    gamepads: {}, gamepadQueryIdx: -1,
    gamepadButtons: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // buttons 0 - 15
        0, 0, 0, 0, // negative axes Lx Ly Rx Ry
        0, 0, 0, 0], // positive axes Lx Ly Rx Ry
    gamepadConnected: function(e) {
        input.gamepads[e.gamepad.index] = e.gamepad;
        console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.", e.gamepad.index, e.gamepad.id, e.gamepad.buttons.length, e.gamepad.axes.length);
        //input.SwitchControlType(1);
        input.gamepadQueryIdx = setInterval(input.QueryGamepads, 10);
    },
    gamepadDisconnected: function(e) {
        delete input.gamepads[e.gamepad.index];
        let hasKeys = false;
        for(const key in input.gamepads) { hasKeys = true; break; }
        if(!hasKeys) {
            console.log("no controllers left!");
            clearInterval(input.gamepadQueryIdx);
            input.gamepadQueryIdx = -1;
            //input.SwitchControlType(0);
        }
    },
    QueryGamepads: function() {
        const gamepads = navigator.getGamepads();
        if(gamepads === undefined || gamepads === null || !document.hasFocus()) { return; }
        const buttonsDown = [];
        let forceDeadzone = gpVals.deadZones[0];
        switch(forceDeadzone) {
            case 1: forceDeadzone = 0.3333; break;
            case 2: forceDeadzone = 0.5; break;
            case 3: forceDeadzone = 0.6666; break;
            case 4: forceDeadzone = 0.75; break;
        }
        for(const gp in gamepads) {
            if(gamepads[gp] === null || gamepads[gp].id === undefined) { continue; }
            gamepads[gp].buttons.forEach((e, i) => {
                if(e.pressed && e.value >= gpVals.triggerMin && i < 16) { buttonsDown.push(i); }
            });
            gamepads[gp].axes.forEach((e, i) => {
                if(e <= -(forceDeadzone || gpVals.deadZones[i])) {
                    buttonsDown.push(16 + i);
                } else if(e >= (forceDeadzone || gpVals.deadZones[i])) {
                    buttonsDown.push(20 + i);
                }
            });
        }
        //if(buttonsDown.length > 0 && options.controltype === 0) { input.SwitchControlType(1); } // oh wait it was already ruiend lol
        for(let i = 0; i < input.gamepadButtons.length; i++) {
            const prevState = input.gamepadButtons[i];
            const btn = (i < 16) ? ("Gamepad" + i) : ("GamepadA" + (i - 16));
            const movements = [controls.up, controls.left, controls.down, controls.right];
            const altMovements = [controls.up2, controls.left2, controls.down2, controls.right2];
            if(buttonsDown.indexOf(i) < 0 && buttonsDown.indexOf(-i) < 0) { // not pressed
                if(prevState > 0) { // just released
                    input.gamepadButtons[i] = -1;
                    input.justPressed[btn] = -1;
                    let currMovements = movements;
                    if(altMovements.indexOf(btn) >= 0) {
                        currMovements = altMovements;
                        //input.SwapPrimaryAndSecondaryGamepadControls();
                    }
                    if(currMovements.indexOf(btn) >= 0 && game.currentInputHandler.freeMovement) {
                        clearInterval(input.keys[btn]);
                        input.keys[btn] = undefined;
                        input.setMainKey();
                    }
                } else { input.gamepadButtons[i] = 0; } // not pressed
            } else { // pressed
                input.gamepadButtons[i]++;
                const btnVal = input.gamepadButtons[i];
                if(btnVal === 1 || (btnVal >= 45 && btnVal % 15 === 0)) {
                    input.justPressed[btn] = input.justPressed[btn] === undefined ? 0 : input.justPressed[btn] + 1;
                    let currMovements = movements;
                    if(altMovements.indexOf(btn) >= 0) {
                        currMovements = altMovements;
                        input.SwapPrimaryAndSecondaryGamepadControls();
                    }
                    if(currMovements.indexOf(btn) >= 0 && game.currentInputHandler.freeMovement) {
                        input.setMainKey(btn);
                        if(input.keys[btn] !== undefined) { return; }
                        input.keys[btn] = setInterval(function() {
                            game.currentInputHandler.keyPress(btn);
                        }, input.BUTTONDELAY);
                    } else { game.currentInputHandler.keyPress(btn); }
                }
            }
        }
    }*/
};