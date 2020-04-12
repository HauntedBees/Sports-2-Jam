/**
 * @param {number} team1idx
 * @param {number} team2idx
 * @param {boolean} isTeam2PlayerControlled
 */
function GameData(team1idx, team2idx, isTeam2PlayerControlled) {
    this.team1 = new Team(1, team1idx, true);
    this.team1.isUp = false;//true;
    this.team2 = new Team(2, team2idx, isTeam2PlayerControlled);
    this.team2.isUp = true;//false;
    this.constellation = "Aries";
    this.inning = new InningData();
    this.SwitchTeams = function() {
        this.team1.isUp = !this.team1.isUp;
        this.team2.isUp = !this.team2.isUp;
        this.inning.Update();
    };
};
function InningData() {
    this.inningNumber = 0;
    this.outs = 0;
    this.bothTeamsBatted = false;
    /** @type {RunnerShell[]} */this.playersOnBase = [];
    this.Update = function() {
        this.outs = 0;
        this.playersOnBase = [];
        if(this.bothTeamsBatted) {
            this.bothTeamsBatted = false;
            this.inningNumber++;
        } else {
            this.bothTeamsBatted = true;
        }
    };
}
/**
 * @param {number} player
 * @param {number} idx
 * @param {boolean} isPlayerControlled
 */
function Team(player, idx, isPlayerControlled) {
    const teamInfo = TeamInfo[idx];
    gfx.CreateTeamSheet(teamInfo.name, teamInfo.color);
    this.name = teamInfo.name;
    this.isPlayerControlled = isPlayerControlled;
    this.isUp = false;
    let score = 0;
    this.GetControls = function() {
        if(player === 1) { return controls; }
        return isPlayerControlled ? controls2 : {};
    };
};
const TeamInfo = [
    { name: "New York Bulls", hx: 0, hy: 0, color: "#FF000066" },
    { name: "San Jose Scorpions", hx: 1, hy: 0, color: "#0000FF66" },
    { name: "Raleigh Twins", hx: 3, hy: 0, color: "#00FF0066" },
    { name: "San Diego Waterbearers", hx: 1, hy: 1, color: "#FF00FF66" }
];
const PitchNames = [
    "Fastball",
    "Standard Pitch",
    "Curveball L",
    "Curveball R"
];