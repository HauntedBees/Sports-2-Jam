const controls = { up: "w", left: "a", down: "s", right: "d", confirm: " ", cancel: "q", pause: "Enter" };
const controls2 = { up: "ArrowUp", left: "ArrowLeft", down: "ArrowDown", right: "ArrowRight", confirm: "o", cancel: "u", pause: "p" };
const controlsArr = Object.keys(controls).map(k => controls[k]);
const controls2Arr = Object.keys(controls2).map(k => controls2[k]);
let input = {
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
    }
};