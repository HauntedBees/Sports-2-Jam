const Title = {
    pressedStart: false, elems: [], selection: 0, 
    Init: function() {
        this.pressedStart = false;
        this.selection = 0;
        this.elems = [new TextOption("Press Start", 5, 11.5, true)];
        gfx.DrawMapCharacter(0, 0, { x: 0, y: 0 }, "title", 640, 480, "background", 0, 0);
    },
    KeyPress: function(key) {
        switch(key) {
            case controls.pause: 
            case controls.confirm:
                if(this.pressedStart) {
                    this.ConfirmSelection();
                } else {
                    //meSpeak.speak("Let's play some Base Star!", { variant: "croak", pitch: 15 });
                    this.ShowChoices();
                }
                break;
            case controls.down: this.ToggleSelection(1); break;
            case controls.up: this.ToggleSelection(-1); break;
        }
    },
    ShowChoices: function() {
        game.Transition(BaseStar, []);
        return;
        // TODO: probably some fucking animation
        this.pressedStart = true;
        this.elems = [
            new TextOption("Single-Player", 5, 10.5),
            new TextOption("Online Multiplayer", 5, 11.5),
            new TextOption("Local Multiplayer", 5, 12.5)
        ];
        this.elems[0].Select();

    },
    ConfirmSelection: function() {
        if(this.selection !== 0) { return; }
        game.Transition(TeamSelection, [1, false]);
        //game.Transition(CoinToss, [1, false]);
    },
    ToggleSelection: function(dir) {
        if(!this.pressedStart) { return; }
        if(dir < 0 && this.selection === 0) { return; }
        if(dir > 0 && this.selection === 2) { return; }
        this.elems[this.selection].Deselect();
        this.selection += dir;
        this.elems[this.selection].Select();
    },
    Update: function() {
        this.elems.forEach(e => e.Update());
    },
    AnimUpdate: function() {
        gfx.ClearSome(["interface", "text"]);
        this.elems.forEach(e => e.Draw());
    }
};
const TeamSelection = {
    elems: [], selection: 0, 
    Init: function(numPlayers, isOnline) {
        gfx.DrawMapCharacter(0, 0, { x: 0, y: 0 }, "background", 640, 480, "background", 0, 0);
        gfx.WriteOptionText("Choose your Team", 320, 32, "background", "#FFFFFF", 24);
        this.selection = 0;
        this.elems = [];
        for(let i = 0; i < TeamInfo.length; i++) {
            const team = TeamInfo[i];
            this.elems.push(new TextOption(team.name, 9.5, 9 + i, i === 0));
        }
        gfx.DrawSprite("helmets", 3, 3, 240, 80, "interface", 160);
        gfx.DrawSprite("helmets", 0, 0, 0, 0, "interface", 160);
    },
    KeyPress: function(key) {
        switch(key) {
            case controls.pause: 
            case controls.confirm:
                meSpeak.speak(TeamInfo[this.selection].name, { variant: "croak", pitch: 15 });
                game.Transition(CoinToss, [this.selection, Math.abs(this.selection - 1)]);
                break;
            case controls.down: this.ToggleSelection(1); break;
            case controls.up: this.ToggleSelection(-1); break;
        }
    },
    ToggleSelection: function(dir) {
        if(dir < 0 && this.selection === 0) { return; }
        if(dir > 0 && this.selection === (TeamInfo.length - 1)) { return; }
        this.elems[this.selection].Deselect();
        this.selection += dir;
        this.elems[this.selection].Select();
    },
    Update: function() {
        this.elems.forEach(e => e.Update());
    },
    AnimUpdate: function() {
        gfx.ClearSome(["interface", "text"]);
        this.elems.forEach(e => e.Draw());
        const team = TeamInfo[this.selection];
        gfx.DrawSprite("helmets", 3, 3, 240, 80, "interface", 160);
        gfx.DrawSprite("helmets", team.hx, team.hy, 240, 80, "interface", 160);
    }
};
const CoinToss = {
    elems: [], 
    coinFrame: 0, state: 0, 
    calledHeads: false, callingTeam: 0, opposingTeam: 0, 
    Init: function(callingTeam, opposingTeam) {
        this.coinFrame = 0;
        this.state = 0;
        this.calledHeads = false;
        this.callingTeam = callingTeam;
        this.opposingTeam = opposingTeam;
        gfx.DrawMapCharacter(0, 0, { x: 0, y: 0 }, "background2", 640, 480, "background", 0, 0);
        gfx.WriteEchoOptionText(TeamInfo[callingTeam].name, 320, 100, "text", "#FFFFFF", "#BA66FF", 24);
        gfx.WriteEchoOptionText("Captain - Call the Coin Toss!", 320, 150, "text", "#FFFFFF", "#BA66FF", 24);

        gfx.WriteEchoOptionText("Player One", 320, 340, "text", "#FFFFFF", "#BA66FF", 24);
        gfx.WriteEchoOptionText("A. Heads", 223, 400, "text", "#FFFFFF", "#BA66FF", 24);
        gfx.WriteEchoOptionText("B. Tails", 417, 400, "text", "#FFFFFF", "#BA66FF", 24);
    },
    KeyPress: function(key) {
        switch(key) {
            case controls.confirm: this.Flip(true); break;
            case controls.cancel: this.Flip(false); break;
        }
    },
    Flip: function(calledHeads) {
        if(this.state === 1) { return; }
        if(this.state === 2) {
            game.Transition(BaseStar, [this.callingTeam]);
            return;
        }
        this.calledHeads = calledHeads;
        this.state = 1;
        gfx.ClearLayer("text");
        gfx.WriteEchoOptionText(TeamInfo[this.callingTeam].name, 320, 100, "text", "#FFFFFF", "#BA66FF", 24);
        gfx.WriteEchoOptionText(`Called ${calledHeads ? "Heads" : "Tails"}!`, 320, 150, "text", "#FFFFFF", "#BA66FF", 24);
        const spinTime = 1500 + Math.ceil(Math.random() * 1500);
        setTimeout(function() { CoinToss.Landed(); }, spinTime);
    },
    Landed: function() {
        this.state = 2;
        const landedHeads = this.coinFrame % 2 === 0;
        gfx.ClearLayer("text");
        gfx.WriteEchoOptionText(TeamInfo[this.callingTeam].name, 320, 100, "text", "#FFFFFF", "#BA66FF", 24);
        gfx.WriteEchoOptionText(`Landed ${landedHeads ? "Heads" : "Tails"}!`, 320, 150, "text", "#FFFFFF", "#BA66FF", 24);
        gfx.WriteEchoOptionText(`${((this.calledHeads && landedHeads) || (!this.calledHeads && !landedHeads)) ? TeamInfo[this.callingTeam].name : TeamInfo[this.opposingTeam].name} bat first!`, 320, 340, "text", "#FFFFFF", "#BA66FF", 24);
    },
    Update: function() { },
    AnimUpdate: function() {
        gfx.ClearLayer("interface");
        gfx.DrawSprite("coin", this.coinFrame % 5, Math.floor(this.coinFrame / 5), 288, 208, "interface", 64);
        if(this.state === 1 && ++this.coinFrame >= 25) { this.coinFrame = 0; }
    }
};

class TextOption {
    constructor(text, x, y, selected) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.bounceState = -1;
        this.shinePanel = -1;
        this.isSelected = selected || false;
        this.numTiles = Math.ceil(gfx.WriteOptionText(this.text, -30, -30, "text", "#FFFFFF", 12) / 32);
        console.log(this.text + ": " + this.numTiles);
    }
    Deselect() {
        this.bounceState = -1;
        this.shinePanel = -1;
        this.isSelected = false;
    }
    Select() {
        this.bounceState = 0;
        this.shinePanel = 0;
        this.isSelected = true;
    }
    GetFrames(i, numTiles) {
        if(i === 0) {
            if(this.shinePanel === 0) { return [0, 5]; }
            if(this.shinePanel === 1) { return [1, 5]; }
            return [0, 4];
        } else if(i === numTiles) {
            if(this.shinePanel === (numTiles - 1)) { return [2, 6]; }
            if(this.shinePanel === numTiles) { return [0, 7]; }
            return [2, 4];
        } else {
            if(this.shinePanel === i) { return [2, 5]; }
            if(this.shinePanel === (i + 1)) { return [1, 6]; }
            return [1, 4];
        }
    }
    Draw() {
        const rx = this.x * 32, ry = this.y * 32;
        gfx.WriteEchoOptionText(this.text, rx + 16, ry + 20, "text", "#FFFFFF", "#BA66FF", 12);
        const leftX = this.numTiles % 2 === 0 ? (rx + 16 - 32 * (this.numTiles / 2)) : (rx - 32 * (this.numTiles - 1) / 2);
        gfx.DrawSpriteFromPoint("sprites", this.GetFrames(0, this.numTiles), leftX, ry, "interface");
        for(let i = 1; i < (this.numTiles - 1); i++) {
            gfx.DrawSpriteFromPoint("sprites", this.GetFrames(i, this.numTiles), leftX + i * 32, ry, "interface");
        }
        gfx.DrawSpriteFromPoint("sprites", this.GetFrames(this.numTiles, this.numTiles), leftX + (this.numTiles - 1) * 32, ry, "interface");
        if(this.isSelected) {
            gfx.DrawSprite("sprites", 2, 0, leftX - 24, ry, "interface");
            gfx.DrawSprite("sprites", 2, 0, leftX + (this.numTiles - 1) * 32 + 24, ry, "interface");
        }
    }
    Update() {
        if(this.shinePanel >= 0) {
            this.shinePanel++;
            if(this.shinePanel > this.numTiles) { this.shinePanel = -1; }
        }
    }
}


/*
const Shell = {
    elems: [], selection: 0, 
    Init: function(s) {

    },
    KeyPress: function(key) {
        switch(key) {
            case controls.pause: 
            case controls.confirm:
                break;
            case controls.down: this.ToggleSelection(1); break;
            case controls.up: this.ToggleSelection(-1); break;
        }
    },
    Update: function() {

    },
    AnimUpdate: function() {

    }
};
*/