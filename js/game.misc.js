const Title = {
    state: 0, elems: [], selection: 0, 
    animFrame: 0, animCounter: 0,
    Init: function(state) {
        gfx.FlipSheet("helmets");
        gfx.FlipSheet("baseballers");
        this.animFrame = 0;
        this.animCounter = 0;
        if(state !== undefined) {
            this.selection = state;
            this.ShowChoices();
        } else {
            this.elems = [new TextOption("Press Start", 5, 11.5, true)];
            this.selection = 0;
            this.state = 0;
        }
        gfx.DrawMapCharacter(0, 0, { x: 0, y: 0 }, "title", 640, 480, "background", 0, 0);
        gfx.WriteEchoPlayerText("Licensed by Haunted Bees Productions", 5, 455, 400, "background", "#FFFFFF", "#BA66FF", 14, "left");
        gfx.WriteEchoPlayerText("© 2992 Digital Artisinal", 5, 475, 400, "background", "#FFFFFF", "#BA66FF", 14, "left");
        Sounds.PlaySong("title");
    },
    CleanUp: function() { this.elems = []; },
    KeyPress: function(key) {
        switch(key) {
            case game.p1c["pause"]: 
            case game.p1c["confirm"]: return this.Confirm();
            case game.p1c["down"]: return this.ToggleSelection(1);
            case game.p1c["up"]: return this.ToggleSelection(-1);
            case game.p1c["cancel"]: return this.Cancel();
        }
    },
    Confirm: function() {
        Sounds.PlaySound("confirm", true);
        switch(this.state) {
            case 0: 
                SpeakHandler.Speak("Let's play some Base Sol!");
                return this.ShowChoices();
            case 1: return this.ConfirmSelection();
            case 2:
                switch(this.selection) {
                    case 0: return game.Transition(TeamSelection, [2]);
                    case 1: return console.log("online host");
                    case 2: return console.log("online join");
                }
        }
    },
    Cancel: function() {
        if(this.state === 2) {
            Sounds.PlaySound("cancel", true);
            this.selection = 1;
            this.ShowChoices();
        }
    },
    ShowChoices: function() {
        this.state = 1;
        this.elems = [
            new TextOption("1P Series", 5, 10.5),
            new TextOption("2P Match", 5, 11.5),
            new TextOption("Options", 5, 12.5)
        ];
        this.elems[this.selection].Select();
    },
    ShowMultiplayerChoices: function() {
        this.state = 2;
        this.selection = 0;
        this.elems = [
            new TextOption("Local Play", 5, 10.5),
            new TextOption("Host Match", 5, 11.5),
            new TextOption("Join Match", 5, 12.5)
        ];
        this.elems[this.selection].Select();
    },
    ConfirmSelection: function() {
        switch(this.selection) {
            case 0: return game.Transition(TeamSelection, [1]);
            case 1: return this.ShowMultiplayerChoices();
            case 2: return game.Transition(OptionsScreen, []);
        }
    },
    ToggleSelection: function(dir) {
        if(this.state === 0) { return; }
        if(dir < 0 && this.selection === 0) { return; }
        if(dir > 0 && this.selection === 2) { return; }
        this.elems[this.selection].Deselect();
        this.selection += dir;
        this.elems[this.selection].Select();
    },
    Update: function() {
        this.elems.forEach(e => e.Update());
        if(++this.animCounter >= 4) {
            this.animCounter = 0;
            this.animFrame++;
        }
    },
    AnimUpdate: function() {
        gfx.ClearSome(["interface", "text"]);
        this.elems.forEach(e => e.Draw());
        gfx.DrawRectSprite("zennhalsey", (this.animFrame % 3), 0, 330, 115, "interface", 235, 297, 1.25);
    }
};
const TeamSelection = {
    rowLength: 6, 
    /** @type {TeamOption[]} */ teams: [],
    sx: 0, sy: 0, confirmed: false,
    sx2: 1, sy2: 0, confirmed2: false,
    twoPlayer: false, 
    earthX: 0, earthY: 0,
    nextX: 0, nextY: 0,
    exDir: 0, eyDir: 0,
    Init: function(numPlayers) {
        gfx.DrawMapCharacter(0, 0, { x: 0, y: 0 }, "background", 640, 480, "background", 0, 0);
        this.earthX = TeamInfo[0].mapx;
        this.earthY = TeamInfo[0].mapcy;
        this.exDir = 0; this.eyDir = 0;
        this.twoPlayer = numPlayers === 2;
        if(this.twoPlayer) {
            this.sx = 0; this.sy = 0; this.confirmed = false;
            this.sx2 = 1; this.sy2 = 0; this.confirmed2 = false;
        } else {
            this.sx = 0; this.sy = 0; this.confirmed = false;
        }
        this.teams = [];
        for(let i = 0; i < TeamInfo.length; i++) {
            const team = TeamInfo[i];
            this.teams.push(new TeamOption(i, this.rowLength, 80 + 96 * (i % this.rowLength), 320 + 96 * Math.floor(i / this.rowLength), team.hx, team.hy));
        }
    },
    KeyPress: function(key) {
        switch(key) {
            case game.p1c["cancel"]: return this.Cancel(0);
            case game.p1c["pause"]: 
            case game.p1c["confirm"]: return this.Confirm();
            case game.p1c["down"]: this.MoveCursor(0, 0, 1); break;
            case game.p1c["up"]: this.MoveCursor(0, 0, -1); break;
            case game.p1c["left"]: this.MoveCursor(0, -1, 0); break;
            case game.p1c["right"]: this.MoveCursor(0, 1, 0); break;
            // TODO: the rest of p2 logic
            case game.p2c["cancel"]: return this.Cancel(1);
            case game.p2c["down"]: this.MoveCursor(1, 0, 1); break;
            case game.p2c["up"]: this.MoveCursor(1, 0, -1); break;
            case game.p2c["left"]: this.MoveCursor(1, -1, 0); break;
            case game.p2c["right"]: this.MoveCursor(1, 1, 0); break;
        }
    },
    Cancel: function(player) {
        if(player === 0) {
            if(this.confirmed) {
                this.confirmed = false;
            } else {
                game.Transition(Title, [this.twoPlayer ? 1 : 0]);
            }
        } else if(this.confirmed2) {
            this.confirmed2 = false;
        }
    },
    Confirm: function() {
        outerGameData.team1Idx = this.sy * this.rowLength + this.sx;
        if(this.confirmed) {
            if(this.twoPlayer) {
                // TODO: player 2
            } else {
                outerGameData.seriesRound = 0;
                outerGameData.seriesLineup = [3]; // [];
                for(let i = 0; i < 4; i++) { // 5
                    outerGameData.seriesLineup.push(GetNumberNotInList(TeamInfo.length, outerGameData.team1Idx, ...outerGameData.seriesLineup));
                }
                game.Transition(SeriesIndicator);
            }
        } else {
            SpeakHandler.Speak(TeamInfo[this.sy * this.rowLength + this.sx].name);
            this.confirmed = true;
        }
    },
    MoveCursor: function(player, dx, dy) {
        const newx = this.sx + dx, newy = this.sy + dy;
        if(newx < 0 || newx >= this.rowLength) { return; }
        if(newy < 0 || newy >= Math.ceil(TeamInfo.length / this.rowLength)) { return; }
        const targetTeam = newy * this.rowLength + newx;
        if(player === 0) {
            if(this.confirmed) { return; }
            this.sx = newx; this.sy = newy;
            this.UpdateMap(targetTeam);
        } else if(this.twoPlayer) {
            if(this.confirmed2) { return; }
            this.sx2 = newx; this.sy2 = newy;
            this.justChanged2 = true;
        }
    },
    UpdateMap: function(targetTeam) {
        if(this.earthX < 225) {
            this.earthX += 225;
        } else if(this.earthX >= 450) {
            this.earthX -= 225;
        }
        const newTeam = TeamInfo[targetTeam];
        let dx = newTeam.mapx - this.earthX;
        const dx2 = (dx > 0) ? (newTeam.mapx - 225 - this.earthX) : (newTeam.mapx + 225 - this.earthX);
        this.nextY = newTeam.mapcy;
        this.nextX = newTeam.mapx;
        console.log(`1: from ${this.earthX} to ${newTeam.mapx}: ${newTeam.mapx - this.earthX}`);
        console.log(`2: from ${this.earthX} to ${newTeam.mapx}: ${dx2}`);
        if(Math.abs(dx2) < Math.abs(dx)) {
            this.nextX += 225 * (dx < 0 ? 1 : -1);
            dx = dx2;
        }
        this.exDir = dx / 3;
        this.eyDir = (newTeam.mapcy - this.earthY) / 3;
    },
    Update: function() {
        if(this.twoPlayer) {

        } else if(this.exDir !== 0) {
            this.earthX += this.exDir;
            this.earthY += this.eyDir;
            if((this.exDir > 0 && this.earthX > this.nextX) || (this.exDir < 0 && this.earthX < this.nextX)) {
                this.exDir = 0;
                this.earthX = this.nextX;
                this.earthY = this.nextY;
                if(this.earthX < 225) {
                    this.earthX += 225;
                } else if(this.earthX >= 450) {
                    this.earthX -= 225;
                }
            }
        }
    },
    AnimUpdate: function() {
        gfx.ClearSome(["interface", "text"]);
        if(this.twoPlayer) {
            gfx.WriteOptionText("Choose your Teams", 320, 32, "text", "#FFFFFF", 24);
        } else if(this.confirmed) {
            gfx.WriteOptionText("Confirm Team Selection?", 320, 32, "text", "#FFFFFF", 24);
        } else {
            gfx.WriteOptionText("Choose your Team", 320, 32, "text", "#FFFFFF", 24);
        }
        if(this.twoPlayer) {
            this.teams.forEach(e => e.Draw(this.sx, this.sy, this.confirmed, this.sx2, this.sy2, this.confirmed2));
        } else {
            gfx.DrawEarth("interface", 215, 120, this.earthX, 0.5);
            gfx.DrawCenteredSpriteToCameras("UI", "sprites", 2, 1, 265, 120 + this.earthY, "interface", 32, 1);
            const teamIdx = this.sy * this.rowLength + this.sx;
            const team = TeamInfo[teamIdx], cx = 385;
            team.constellations.forEach((name, i) => {
                const c = ConstellationInfo[name];
                if(c === undefined) { return; }
                gfx.DrawCenteredSprite("constellations", c.hx, c.hy, cx + 96 * i, 144, "interface", 128, 0.66);
                gfx.WriteEchoOptionText(name, cx + 96 * i, 200, "text", "#FFFFFF", "#BA66FF", 12);
            });
            gfx.WriteEchoOptionText(team.name, cx + 96, 92, "text", "#FFFFFF", "#BA66FF", 18);
            gfx.DrawSprite("helmets", 3, 3, 30, 80, "interface", 160);
            gfx.DrawSprite("helmets", team.hx, team.hy, 30, 80, "interface", 160);
            this.teams.forEach(e => e.Draw(this.sx, this.sy, this.confirmed, -1, -1, false));
            gfx.WriteEchoPlayerText("Star Becomer: " + starPlayers[teamIdx].batter, cx - 25, 230, 500, "text", "#FFFFFF", "#AA6666", 12, "left");
            gfx.WriteEchoPlayerText("Star Pitcher: " + starPlayers[teamIdx].pitcher, cx - 25, 250, 500, "text", "#FFFFFF", "#6666AA", 12, "left");
        }
    }
};
const SeriesIndicator = {
    exDir: 0, eyDir: 0, 
    earthX: 0, earthY: 0,
    opponentTeam: null,
    Init: function() {
        gfx.TintSheet("helmetsflip", "#00000099")
        gfx.DrawMapCharacter(0, 0, { x: 0, y: 0 }, "background", 640, 480, "background", 0, 0);
        gfx.WriteOptionText(`Match ${outerGameData.seriesRound + 1}`, 320, 32, "background", "#FFFFFF", 24);
        
        const helmety = 200, bottomy = 340;
        const playerTeam = TeamInfo[outerGameData.team1Idx];
        const opponentTeam = TeamInfo[outerGameData.seriesLineup[outerGameData.seriesRound]];
        const lastTeam = outerGameData.seriesRound === 0 ? playerTeam : TeamInfo[outerGameData.seriesLineup[outerGameData.seriesRound - 1]];
        this.opponentTeam = opponentTeam;

        this.exDir = (opponentTeam.mapx - lastTeam.mapx) / 20;
        this.eyDir = (opponentTeam.mapcy - lastTeam.mapcy) / 20;
        this.earthX = lastTeam.mapx;
        this.earthY = lastTeam.mapcy;

        SpeakHandler.Speak(`Match ${outerGameData.seriesRound + 1}: ${playerTeam.name} versus ${opponentTeam.name}`);

        gfx.WriteOptionText(`${playerTeam.name} v. ${opponentTeam.name}`, 320, 64, "background", "#FFFFFF", 20);
        gfx.DrawCenteredSpriteToCameras("helmet", "helmets", 3, 3, 190, helmety, "interface", 160, 1);
        gfx.DrawCenteredSpriteToCameras("helmet", "helmets", playerTeam.hx, playerTeam.hy, 190, helmety, "interface", 160, 1);
        gfx.DrawCenteredSpriteToCameras("helmet", "helmetsflip", 0, 3, 450, helmety, "interface", 160, 1);
        gfx.DrawCenteredSpriteToCameras("helmet", "helmetsflip", 3 - opponentTeam.hx, opponentTeam.hy, 450, helmety, "interface", 160, 1);
        
        gfx.DrawLineToCameras(120, bottomy, 120 + 100 * (outerGameData.seriesLineup.length - 1), bottomy, "#FF0000", "interface");
        for(let i = 0; i < outerGameData.seriesLineup.length; i++) {
            const smallTeam = TeamInfo[outerGameData.seriesLineup[i]];
            const smallx = 120 + 100 * i;
            const sheet = i < outerGameData.seriesRound ? "helmetsfliptint" : "helmetsflip";
            let scale = i === outerGameData.seriesRound ? 0.6 : 0.5;
            gfx.DrawCenteredSpriteToCameras("helmet", "helmetsflip", 0, 3, smallx, bottomy, "interface", 160, scale);
            gfx.DrawCenteredSpriteToCameras("helmet", sheet, 3 - smallTeam.hx, smallTeam.hy, smallx, bottomy, "interface", 160, scale);
        }
        const playerHelmetX = 120 + 100 * outerGameData.seriesRound + 10;
        gfx.DrawCenteredSpriteToCameras("helmet", "helmets", 3, 3, playerHelmetX, bottomy + 90, "interface", 160, 0.4);
        gfx.DrawCenteredSpriteToCameras("helmet", "helmets", playerTeam.hx, playerTeam.hy, playerHelmetX, bottomy + 90, "interface", 160, 0.4);
    },
    CleanUp: function() { this.opponentTeam = null; },
    KeyPress: function(key) {
        switch(key) {
            case game.p1c["pause"]: 
            case game.p1c["confirm"]:
                SpeakHandler.Stop();
                game.Transition(CoinToss);
                break;
        }
    },
    Update: function() {
        if(this.exDir !== 0) {
            this.earthX += this.exDir;
            this.earthY += this.eyDir;
            const teamInfo = this.opponentTeam;
            const teamX = teamInfo.mapx;
            if((this.exDir > 0 && this.earthX > teamX) || (this.exDir < 0 && this.earthX < teamX)) {
                this.exDir = 0;
                this.earthX = teamX;
                this.earthY = teamInfo.mapcy;
            }
        }
    },
    AnimUpdate: function() {
        gfx.ClearLayer("overlay");
        gfx.DrawEarth("overlay", 270, 120, this.earthX, 0.5);
        gfx.DrawCenteredSpriteToCameras("UI", "sprites", 2, 1, 320, 120 + this.earthY, "overlay", 32, 1);
    }
};
const CoinToss = {
    coinFrame: 0, state: 0, p1BatsFirst: false,  
    calledHeads: false, callingTeam: 0, opposingTeam: 0, 
    Init: function() {
        this.coinFrame = 0;
        this.state = 0;
        this.calledHeads = false;
        this.callingTeam = outerGameData.team1Idx;
        this.opposingTeam = outerGameData.seriesLineup[outerGameData.seriesRound];
        gfx.DrawMapCharacter(0, 0, { x: 0, y: 0 }, "background2", 640, 480, "background", 0, 0);
        gfx.WriteEchoOptionText(TeamInfo[this.callingTeam].name, 320, 100, "text", "#FFFFFF", "#BA66FF", 24);
        gfx.WriteEchoOptionText("Captain - Call the Coin Toss!", 320, 150, "text", "#FFFFFF", "#BA66FF", 24);

        gfx.WriteEchoOptionText("Player One", 320, 340, "text", "#FFFFFF", "#BA66FF", 24);
        gfx.WriteEchoOptionText("A. Heads", 223, 400, "text", "#FFFFFF", "#BA66FF", 24);
        gfx.WriteEchoOptionText("B. Tails", 417, 400, "text", "#FFFFFF", "#BA66FF", 24);
    },
    KeyPress: function(key) {
        switch(key) {
            case game.p1c["confirm"]: this.Flip(true); break;
            case game.p1c["cancel"]: this.Flip(false); break;
        }
    },
    Flip: function(calledHeads) {
        if(this.state === 1) { return; }
        if(this.state === 2) {
            game.Transition(BaseStar, ["series", this.p1BatsFirst]); // TODO: what about when not series??
            return;
        }
        this.calledHeads = calledHeads;
        this.state = 1;
        gfx.ClearLayer("text");
        gfx.WriteEchoOptionText(TeamInfo[this.callingTeam].name, 320, 100, "text", "#FFFFFF", "#BA66FF", 24);
        gfx.WriteEchoOptionText(`Called ${calledHeads ? "Heads" : "Tails"}!`, 320, 150, "text", "#FFFFFF", "#BA66FF", 24);
        const spinTime = 5 + Math.ceil(Math.random() * 5);//1500 + Math.ceil(Math.random() * 1500);
        setTimeout(function() { CoinToss.Landed(); }, spinTime);
    },
    Landed: function() {
        this.state = 2;
        const landedHeads = this.coinFrame % 2 === 0;
        gfx.ClearLayer("text");
        gfx.WriteEchoOptionText(TeamInfo[this.callingTeam].name, 320, 100, "text", "#FFFFFF", "#BA66FF", 24);
        gfx.WriteEchoOptionText(`Landed ${landedHeads ? "Heads" : "Tails"}!`, 320, 150, "text", "#FFFFFF", "#BA66FF", 24);
        this.p1BatsFirst = (this.calledHeads && landedHeads) || (!this.calledHeads && !landedHeads);
        const battingTeam = this.p1BatsFirst ? this.callingTeam : this.opposingTeam;
        gfx.WriteEchoOptionText(`${TeamInfo[battingTeam].name} bat first!`, 320, 340, "text", "#FFFFFF", "#BA66FF", 24);
    },
    Update: function() { },
    AnimUpdate: function() {
        gfx.ClearLayer("interface");
        gfx.DrawSprite("coin", this.coinFrame % 5, Math.floor(this.coinFrame / 5), 288, 208, "interface", 64);
        if(this.state === 1 && ++this.coinFrame >= 25) { this.coinFrame = 0; }
    }
};
const WinScreen = {
    elems: [], fast: true, isDraw: false, p1Won: false, 
    Init: function() {
        gfx.DrawMapCharacter(0, 0, { x: 0, y: 0 }, "background2", 640, 480, "background", 0, 0);
        this.isDraw = BaseStar.data.team1.score === BaseStar.data.team2.score;
        if(this.isDraw) {
            this.p1Won = true;
            gfx.WriteEchoOptionText("DRAW!", 320, 100, "text", "#FFFFFF", "#BA66FF", 48);
            const dx = 32, cy = 220;
            for(let i = 0; i < 20; i++) {
                const div7 = Math.floor(i / 7);
                const scale = 0.15 * div7;
                const ix = -3.5 * dx + (i % 7) * dx + (div7 === 2 ? 16: 0);
                const iy = 20 * div7;
                gfx.DrawCenteredSprite(BaseStar.data.team1.name, 0, 8, 200 + ix, cy + iy, "background", 64, 0.75 + scale);
                gfx.DrawCenteredSprite("baseballers", 4, 8, 200 + ix, cy + iy, "background", 64, 0.75 + scale);
                
                gfx.DrawCenteredSprite(BaseStar.data.team2.name, 0, 8, 460 + ix, cy + iy, "background", 64, 0.75 + scale);
                gfx.DrawCenteredSprite("baseballers", 4, 8, 460 + ix, cy + iy, "background", 64, 0.75 + scale);
            }
        } else {
            this.p1Won = BaseStar.data.team1.score > BaseStar.data.team2.score;
            const winningTeam = this.p1Won ? BaseStar.data.team1 : BaseStar.data.team2;
            const losingTeam = this.p1Won ? BaseStar.data.team2 : BaseStar.data.team1;
            if(!BaseStar.data.team2.isPlayerControlled) {
                if(this.p1Won) {
                    gfx.WriteEchoOptionText("YOU WIN!", 320, 100, "text", "#FFFFFF", "#BA66FF", 48);
                } else {
                    gfx.WriteEchoOptionText("YOU LOSE!", 320, 100, "text", "#FFFFFF", "#BA66FF", 48);
                }
            } else {
                gfx.WriteEchoOptionText("THE WINNER IS...", 320, 80, "text", "#FFFFFF", "#BA66FF", 48);
                gfx.WriteEchoOptionText(winningTeam.name.toUpperCase(), 320, 120, "text", "#FFFFFF", "#BA66FF", 48);
            }
            const dx = 32, cy = 160;
            for(let i = 0; i < 20; i++) {
                const div7 = Math.floor(i / 7);
                const scale = 0.15 * div7;
                const ix = -3.5 * dx + (i % 7) * dx + (div7 === 2 ? 16: 0);
                const iy = 20 * div7;
                gfx.DrawCenteredSprite(losingTeam.name, 0, 8, 338 + ix, cy + iy, "background", 64, 0.75 + scale);
                gfx.DrawCenteredSprite("baseballers", 4, 8, 338 + ix, cy + iy, "background", 64, 0.75 + scale);
                const winnerY = RandRange(200, 360);
                this.elems.push({
                    team: winningTeam.name,
                    x: RandRange(-300, -150),
                    y: winnerY, scale: 0.8 + (winnerY - 200) / 200,
                    speed: RandFloat(2, 4),
                    animFrame: 0, animCounter: 0
                });
            }
            this.elems.sort((a, b) => a.y - b.y);
        }
        gfx.WriteEchoOptionText("Press any button to continue.", 320, 420, "text", "#FFFFFF", "#BA66FF", 26);
    },
    KeyPress: function(key) {
        switch(key) {
            case game.p1c["pause"]: 
            case game.p1c["confirm"]:
            case game.p1c["cancel"]:
                this.Continue();
                break;
        }
    },
    CleanUp: function() { this.elems = []; },
    Continue: function() {
        if(BaseStar.data.team2.isPlayerControlled) {
            // TODO: two player
        } else if(this.p1Won) {
            if(++outerGameData.seriesRound >= 5) {
                game.Transition(SeriesWinScreen);
            } else {
                game.Transition(SeriesIndicator);
            }
        } else {
            game.Transition(Title, [0]);
        }
    },
    Update: function() {
        this.elems.forEach(e => {
            if(++e.animCounter > 4) { 
                e.animCounter = 0;
                e.animFrame++;
            }
            e.x += e.speed;
        });
    },
    AnimUpdate: function() {
        gfx.ClearLayer("interface");
        this.elems.forEach(e => {
            gfx.DrawCenteredSprite(e.team, (e.animFrame % 4), 0, e.x, e.y, "interface", 64, e.scale);
            gfx.DrawCenteredSprite("baseballers", 4 + (e.animFrame % 4), 0, e.x, e.y, "interface", 64, e.scale);
        });
    }
};
const SeriesWinScreen = {
    Init: function() {
        gfx.DrawMapCharacter(0, 0, { x: 0, y: 0 }, "background2", 640, 480, "background", 0, 0);
        gfx.WriteEchoOptionText("OCNGRATULATION!", 320, 50, "text", "#FFFFFF", "#BA66FF", 48);
        gfx.WriteEchoOptionText("YOU WON THE WHIRLED SERIES!", 320, 80, "text", "#FFFFFF", "#BA66FF", 32);
        gfx.DrawRectSprite("troph", 0, 0, 320, 250, "background", 328, 382, 0.75, true);
        const suffix = BaseStar.data.team1.name[BaseStar.data.team1.name.length - 1] === "s" ? "'" : "'s";
        gfx.WriteEchoOptionText(`The epic highs and lows of the ${BaseStar.data.team1.name}${suffix}`, 320, 430, "text", "#FFFFFF", "#BA66FF", 18);
        gfx.WriteEchoOptionText(`Basesol career cannot be overstated.`, 320, 455, "text", "#FFFFFF", "#BA66FF", 18);
    },
    KeyPress: function(key) {
        switch(key) {
            case game.p1c["pause"]: 
            case game.p1c["confirm"]:
            case game.p1c["cancel"]:
                game.Transition(Title, [0]);
                break;
        }
    },
    Update: function() { },
    AnimUpdate: function() {

    }
};
const Credits = {
    elems: [], fast: true, freeMovement: true,  
    Init: function() {
        gfx.DrawMapCharacter(0, 0, { x: 0, y: 0 }, "background", 640, 480, "background", 0, 0);
        this.speedupCounter = 0;
        this.scroll = 0;
        this.elems = [];
        let dy = 500;
        const AddSomething = (t, size, addy) => {
            this.elems.push({ text: t, size: size, y: dy });
            dy += addy;
        };
        const AddHeading = t => AddSomething(t, 28, 40);
        const AddSubHeading = t => AddSomething(t, 22, 38);
        const AddText = t => AddSomething(t, 20, 36);
        const Whitespace = i => dy += 20 * (i || 1);

        AddHeading("Zenn Halsey Basesol '93");
        AddSubHeading("By Haunted Bees Productions");
        AddSubHeading("for the Sports 2 Game Jam");
        Whitespace(2);
        AddHeading("Programming");
        AddText("Sean Finch");
        Whitespace(1);
        AddHeading("Graphics");
        AddText("Sean Finch");
        Whitespace(1);
        AddHeading("Game Design");
        AddText("Sean Finch");
        AddText("Skyler Johnson");
        Whitespace(1);
        AddHeading("Additional Credits");
        
        AddText(`"3D Man Running Eight Directions"`);
        AddText(`by Randy Tayler (CC0 License)`);
        Whitespace(0.5);
        AddText(`"Trophy"`);
        AddText(`by Jeremy Woods (CC0 License)`);
        Whitespace(0.5);
        AddText(`"Another Space Backgrounds"`);
        AddText(`by Rawdanitsu (CC0 License)`);
        Whitespace(0.5);
        AddText(`"Cleveland Browns New Uniform Unveiling"`);
        AddText(`by Erik Drost (CC BY 2.0 License)`);
        Whitespace(0.5);
        AddText(`"Retro Gaming" Font`);
        AddText(`by Daymarius`);
        Whitespace(0.5);
        
        AddText(`"Awake! (Megawall-10)"`);
        AddText(`by Cynic Music (CC0 License)`);
        Whitespace(0.5);
        AddText(`"7 Assorted Sound Effects"`);
        AddText(`by Joth (CC0 License)`);
        Whitespace(0.5);
        AddText(`"Play Ball! v2.wav"`);
        AddText(`by CGEffex (CC BY 3.0 License)`);
        Whitespace(0.5);

        AddText(`meSpeak.js`);
        AddText(`by Norbert Landsteiner (GNU GPLv3 License)`);
        Whitespace(0.5);
        AddText(`Box2DWeb`);
        AddText(`by Erin Catto (zlib/MIT License)`);
        Whitespace(1);

        AddHeading("Special Thanks");
        AddText("CC Contreras");
        AddText("Skyler Johnson");
        AddText("Laura Billard");
        AddText("Sheila Pollard");
        AddText("Kelly Marine");
        AddText("Madison Stemm");
        AddText("Drishti Nand");
        AddText("Catrina Fuentes");
        AddText("Mental Grain");
        AddText("Fabien Chereau");
        AddText("Guillaume Chereau");
        AddText("Andrew W.K.");
        Whitespace(1);
        AddText("and YOU!");
        Whitespace(4);
        this.dontSkip = this.elems.length;
        this.topy = dy - 200;
        AddText("© 2020 Haunted Bees Productions");
        AddText("Proudly Free and Open Source Software");
        AddText("Sharing is Caring!");
        AddText("Find the game's source code on GitHub!");
    },
    CleanUp: function() { this.elems = []; },
    KeyPress: function(key) {
        switch(key) {
            case game.p1c["pause"]: return game.Transition(Title, [0]);
            case game.p1c["confirm"]:
                if(this.scroll < 2000) {
                    this.speedupCounter = (this.speedupCounter > 50) ? 0 : 660;
                } else {
                    game.Transition(Title, [0]);
                }
                break;
            case game.p1c["cancel"]:
            case game.p1c["down"]:
                this.speedupCounter = 5;
                break;
        }
    },
    Update: function() {
        this.scroll += (this.speedupCounter-- > 0) ? 4 : 1;
    },
    AnimUpdate: function() {
        gfx.ClearLayer("text");
        const dy = this.scroll;
        this.elems.forEach((e, i) => {
            let y = e.y - dy;
            if(dy > this.topy && i >= this.dontSkip) { y = e.y - this.topy; }
            if(y < -20 || y > 500) { return; }
            gfx.WriteEchoOptionText(e.text, 320, y, "text", "#FFFFFF", "#0000FF", e.size);
        });
    }
};

class TeamOption {
    constructor(teamIdx, rowLen, x, y, sx, sy) {
        this.scale = 0.75;
        this.teamIdx = teamIdx;
        this.ix = teamIdx % rowLen;
        this.iy = Math.floor(teamIdx / rowLen);
        this.sx = sx; this.sy = sy;
        this.x = x; this.y = y;
    }
    Draw(p1SelX, p1SelY, p1Confirmed, p2SelX, p2SelY, p2Confirmed) {
        gfx.DrawCenteredSprite("teamlogos", this.sx, this.sy, this.x, this.y, "interface", 128, this.scale);
        if(p1SelX === this.ix && p1SelY === this.iy) {
            if(p1Confirmed) {
                gfx.DrawCenteredSprite("teamselect", 0, 0, this.x, this.y, "interface", 128, this.scale);
            } else {
                gfx.DrawCenteredSprite("teamselect", 1, 0, this.x, this.y, "interface", 128, this.scale);
            }
        }
        if(p2SelX === this.ix && p2SelY === this.iy) {
            if(p2Confirmed) {
                gfx.DrawCenteredSprite("teamselect", 0, 0, this.x, this.y, "interface", 128, this.scale);
            } else {
                gfx.DrawCenteredSprite("teamselect", 1, 0, this.x, this.y, "interface", 128, this.scale);
            }
        }
    }
}
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
    ChangeText(text) {
        this.text = text;
        this.numTiles = Math.ceil(gfx.WriteOptionText(this.text, -30, -30, "text", "#FFFFFF", 12) / 32);
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
            gfx.DrawCenteredSprite("sprites", 2, 0, leftX - 8, ry + 15, "interface", 32, 0.5);
            gfx.DrawCenteredSprite("sprites", 2, 0, leftX + (this.numTiles - 1) * 32 + 40, ry + 15, "interface", 32, 0.5);
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
    CleanUp: function() { this.elems = []; },
    KeyPress: function(key) {
        switch(key) {
            case game.p1c["pause"]: 
            case game.p1c["confirm"]:
                break;
            case game.p1c["down"]: this.ToggleSelection(1); break;
            case game.p1c["up"]: this.ToggleSelection(-1); break;
        }
    },
    Update: function() {

    },
    AnimUpdate: function() {

    }
};
*/