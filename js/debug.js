class Debug {
    started = false; fuckTheRules = false;
    keyChain = []; allowCheats = true;
    constructor() {
        const me = this;
        document.addEventListener("keypress", function(e) { me.KeyPress(e); });
    }
    /** @param {KeyboardEvent} e */
    KeyPress(e) {
        this.keyChain.push(e.key);
        if(e.key === "`") {
            console.log("resetting cheat code chain!");
            this.keyChain = [];
            return;
        }
        if(this.keyChain.length > 5) { this.keyChain.shift(); }
        if(this.CheckCode(this.keyChain.join("").replace(/ /g, ""))) {
            console.log("CHEAT USED");
            this.keyChain = [];
        }

        if(game.currentHandler === BaseStar) {

            const doX = x => BaseStar.cameras[0].offsetx += (10 * x);
            const doY = y => BaseStar.cameras[0].offsety += (10 * y);

            if(e.key === "p") { game.paused = !game.paused; }
            if(e.key === "-") { BaseStar.cameras[0].zoom -= 0.1; }
            if(e.key === "=" || e.key === "+") { BaseStar.cameras[0].zoom += 0.1; }
            if(e.key === "4") { doX(1); }
            if(e.key === "6") { doX(-1); }
            if(e.key === "8") { doY(10); }
            if(e.key === "2") { doY(-10); }
            if(e.key === ".") {
                game.paused = false;
                BaseStar.Update();
                game.paused = true;
            }
            return;
        }


        if(e.key === " ") { return; }
        if(game.currentHandler.earthX !== undefined) { // Team Selection
            //const idx = game.currentHandler.sy * game.currentHandler.rowLength + game.currentHandler.sx;
            if(e.key === "4") { game.currentHandler.earthX -= 1; }
            if(e.key === "6") { game.currentHandler.earthX += 1; }
            if(e.key === "8") { game.currentHandler.earthY -= 2; }
            if(e.key === "2") { game.currentHandler.earthY += 2; }
            console.clear();
            console.log(game.currentHandler.earthX + ", " + game.currentHandler.earthY);
        }
        if(game.currentHandler.subhandler !== undefined && game.currentHandler.subhandler.constructor.name === "FieldPickHandler") {
            if(e.key === "-") { game.currentHandler.subhandler.scale -= 0.005; }
            if(e.key === "=" || e.key === "+") { game.currentHandler.subhandler.scale += 0.005; }
            if(e.key === "5") { console.log(game.currentHandler.subhandler.maxY); }
        }*/
    }
    CheckCode(fullChain) {
        if(fullChain === "goku") {
            this.allowCheats = !this.allowCheats;
            return true;
        }
        if(!this.allowCheats) { return false; }
        if(fullChain === "SS" || fullChain === "Ss") {
            outerGameData.team1Idx = 0;
            outerGameData.gameType = "series";
            outerGameData.seriesRound = 0;
            outerGameData.seriesLineup = [3];
            for(let i = 0; i < 4; i++) {
                outerGameData.seriesLineup.push(GetNumberNotInList(TeamInfo.length, outerGameData.team1Idx, ...outerGameData.seriesLineup));
            }
            game.Transition(BaseStar, [fullChain[1] === "s"]);
            return true;
        }
        if(fullChain.indexOf("S") === 0 && fullChain.length === 2) {
            outerGameData.team1Idx = parseInt(fullChain[1]);
            outerGameData.team2Idx = 1;
            outerGameData.gameType = "2p_local";
            game.Transition(BaseStar, [false]);
            return true;
        }
        if(fullChain === "E") {
            BaseStar.data.inning.inningNumber = 3;
            BaseStar.data.inning.bothTeamsBatted = true;
            BaseStar.data.inning.outs = 2;
            BaseStar.data.inning.strikes = 1;
            return true;
        }
        if(fullChain === "P") {
            BaseStar.data.team1.score += 1;
            return true;
        }
    }
}
const debuggo = new Debug();