function GetNumberNotInList(length, ...list) {
	let attempts = 5;
	while(attempts-- > 0) {
		const rand = Math.floor(Math.random() * length);
		if(list.indexOf(rand) < 0) { return rand; }
	}
	for(let i = 0; i < length; i++) { // randomness didn't work, just iterate through
		if(list.indexOf(i) < 0) { return i; }
	}
	return -1;
}
class Debug {
    started = false;
    keyChain = [];
    allowCheats = true;
    constructor() {
        const me = this;
        document.addEventListener("keypress", function(e) { me.KeyPress(e); });
        const testConstellation = "";
        // @ts-ignore
        if(testConstellation !== "") {
            TeamInfo.forEach(e => {
                e.constellations = [testConstellation, testConstellation, testConstellation];
            });
        }
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
            outerGameData.seriesLineup = [];
            for(let i = 0; i < 3; i++) {
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