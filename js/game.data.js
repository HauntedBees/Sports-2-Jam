class GameData {
    /** @param {number} team1idx @param {number} team2idx @param {boolean} isTeam2PlayerControlled */
    constructor(team1idx, team2idx, isTeam2PlayerControlled, p1BatsFirst) {
        this.team1 = new Team(1, team1idx, true, false);
        this.team2 = new Team(2, team2idx, isTeam2PlayerControlled, team1idx === team2idx);
        this.team1.isUp = p1BatsFirst;
        this.team2.isUp = !p1BatsFirst;
        this.constellation = "Cygnus";
        this.inning = new InningData();
    }
    SetConstellation(c) { this.constellation = c; }
    GetFieldTeam() { return this.team1.isUp ? this.team2 : this.team1; }
    SwitchTeams() {
        const score = this.inning.playersOnBase.length;
        if(this.team1.isUp) { this.team1.score += score; }
        else { this.team2.score += score; }
        this.team1.isUp = !this.team1.isUp;
        this.team2.isUp = !this.team2.isUp;
        this.inning.Update();
    }
    Touchdown() {
        const score = this.inning.playersOnBase.length;
        if(this.team1.isUp) { this.team1.score += score; }
        else { this.team2.score += score; }
        this.inning.playersOnBase = [];
    }
    WasLastInning() { return this.inning.inningNumber === 3 && this.inning.bothTeamsBatted; }
    WasEndOfInning() { return this.inning.bothTeamsBatted; }
}
function InningData() {
    this.inningNumber = 1;
    this.strikes = 0;
    this.outs = 0;
    this.atBatPlayerIdx = Math.floor(20 * Math.random());
    this.pitcherIdx = Math.floor(20 * Math.random());
    this.bothTeamsBatted = false;
    /** @type {RunnerShell[]} */this.playersOnBase = [];
    this.IncrementBatter = function() { this.atBatPlayerIdx = (this.atBatPlayerIdx + 1) % 20; };
    this.IncreaseOutsAndReturnIfSwitch = function() {
        this.strikes = 0;
        return ++this.outs === 3;
    };
    this.StruckOut = function() { return this.strikes === 2; }
    this.AddStrikeAndReturnIfOut = function() {
        this.strikes += 1;
        return this.StruckOut();
    };
    this.Update = function() {
        this.strikes = 0;
        this.outs = 0;
        this.atBatPlayerIdx = Math.floor(20 * Math.random());
        this.pitchIdx = Math.floor(20 * Math.random());
        this.playersOnBase = [];
        if(this.bothTeamsBatted) {
            this.bothTeamsBatted = false;
            this.inningNumber++;
        } else {
            this.bothTeamsBatted = true;
        }
    };
}
/** @param {number} player @param {number} idx @param {boolean} isPlayerControlled @param {boolean} darkTint */
function Team(player, idx, isPlayerControlled, darkTint) {
    const teamInfo = TeamInfo[idx];
    gfx.TintSheet("bigsprites", teamInfo.color, teamInfo.name + "_big");
    gfx.TintSheet("pitcher", teamInfo.color, teamInfo.name + "_pitcher");
    gfx.TintSheet("batter", teamInfo.color, teamInfo.name + "_batter");
    if(darkTint) {
        const tintColor = "#FFFFFF99";
        gfx.TintSheet(teamInfo.name, tintColor, teamInfo.name + "_dark");
        gfx.FlipSheet(teamInfo.name + "_dark");
        gfx.TintSheet(teamInfo.name + "_big", tintColor, teamInfo.name + "_dark_big");
        gfx.TintSheet(teamInfo.name + "_pitcher", tintColor, teamInfo.name + "_dark_pitcher");
        gfx.TintSheet(teamInfo.name + "_batter", tintColor, teamInfo.name + "_dark_batter");
        this.ballerSheet = teamInfo.name + "_dark";
        this.flipSheet = teamInfo.name + "_darkflip";
        this.bigSpriteSheet = teamInfo.name + "_dark_big";
        this.pitcherSheet = teamInfo.name + "_dark_pitcher";
        this.batterSheet = teamInfo.name + "_dark_batter";
    } else {
        gfx.FlipSheet(teamInfo.name);
        this.ballerSheet = teamInfo.name;
        this.flipSheet = teamInfo.name + "flip";
        this.bigSpriteSheet = teamInfo.name + "_big";
        this.pitcherSheet = teamInfo.name + "_pitcher";
        this.batterSheet = teamInfo.name + "_batter";
    }
    this.name = teamInfo.name;
    this.players = PlayerInfo.filter(e => e.team === idx);
    const splitName = teamInfo.name.split(" ");
    this.initial = splitName[splitName.length - 1][0];
    this.isPlayerControlled = isPlayerControlled;
    this.teamIdx = idx;
    this.isUp = false;
    this.score = 0;
    this.playerNum = player;
    this.showUI = isPlayerControlled;
    this.PluralName = function() { return this.name + (this.name[this.name.length - 1] === "s" ? "'" : "'s"); };
    this.LastName = function() { return splitName[splitName.length - 1]; }
    this.GetLayerPrefix = function() {
        if(player === 1) { return ""; }
        return isPlayerControlled ? "p2" : null;
    };
    this.GetControls = function() {
        if(player === 1) { return game.p1c; }
        return isPlayerControlled ? game.p2c : NPCInput;
    };
    this.GetConstellations = function() { return teamInfo.constellations; }
};
const TeamInfo = [ // NOTE: KEEP MAPX BETWEEN 225 AND 450
    { name: "Sisimiut Centaurs", hx: 3, hy: 1, color: "#78103066", mapx: 369, mapcy: 70, series: [1, 3, 7], constellations: ["Sagittarius", "Orion", "Lyra"] },                 // Greenland
    { name: "Bujumbura Bulls", hx: 0, hy: 0, color: "#0048B066", mapx: 324, mapcy: 34, series: [0, 4, 9], constellations: ["Hercules", "Taurus", "Monoceros"] },                // Burundi
    { name: "Sydney Scales", hx: 2, hy: 1, color: "#48005866", mapx: 247, mapcy: 12, series: [3, 7, 9], constellations: ["Cetus", "Perseus", "Libra"] },                        // Australia
    { name: "Makhachkala Rams", hx: 2, hy: 0, color: "#68D80066", mapx: 297, mapcy: 64, series: [2, 0, 5], constellations: ["Lepus", "Canis Major", "Aries"] },                 // Russia
    { name: "Seine Scorpions", hx: 1, hy: 0, color: "#D86C2066", mapx: 339, mapcy: 60, series: [10, 8, 6], constellations: ["Scorpius", "Aquila", "Lacerta"] },                 // France
    { name: "Tokyo Twins", hx: 3, hy: 0, color: "#90002066", mapx: 254, mapcy: 56, series: [3, 10, 8], constellations: ["Gemini", "Boötes", "Sculptor"] },                      // Japan
    { name: "Qusqu Goats", hx: 0, hy: 2, color: "#00246866", mapx: 390, mapcy: 30, series: [4, 11, 7], constellations: ["Pegasus", "Capricornus", "Auriga"] },                  // Peru
    { name: "San Diego Waterbearers", hx: 1, hy: 1, color: "#F8FC0066", mapx: 413, mapcy: 58, series: [0, 6, 2], constellations: ["Aquarius", "Corona Australis", "Felis"] },   // USA
    { name: "Atlantis Koi", hx: 0, hy: 1, color: "#00005866", mapx: 363, mapcy: 54, series: [11, 5, 6], constellations: ["Pisces", "Cygnus", "Delphinus"] },                    // Atlantis
    { name: "Seoul Snow Crabs", hx: 3, hy: 2, color: "#00FCD866", mapx: 248, mapcy: 60, series: [2, 1, 11], constellations: ["Centaurus", "Ursa Minor", "Cancer"] },            // Korea
    { name: "Cúcuta Maidens", hx: 1, hy: 2, color: "#2048F866", mapx: 387, mapcy: 36, series: [4, 5, 9], constellations: ["Virjo", "Lynx", "Andromeda"] },                      // Colombia
    { name: "Lilongwe Lions", hx: 2, hy: 2, color: "#B0484866", mapx: 321, mapcy: 22, series: [10, 1, 8], constellations: ["Ursa Major", "Leo", "Corvus"] }                     // Malawi
];
const PlayerInfo = [
    { team: 0, name: "Etharalie Tarobon", stat1: 476, stat2: 0.584, stat3: 6.3, stat4: 72 },
    { team: 0, name: "Cindrene Meunsby", stat1: 524, stat2: 0.599, stat3: 1.21, stat4: 88 },
    { team: 0, name: "Kirelia Thi", stat1: 611, stat2: 0.486, stat3: 2.71, stat4: 76 },
    { team: 0, name: "Sily Bringhrino", stat1: 578, stat2: 0.089, stat3: 4.55, stat4: 82 },
    { team: 0, name: "Riters Shuk", stat1: 627, stat2: 0.591, stat3: 1.15, stat4: 73 },
    { team: 0, name: "Rodristin Jesters", stat1: 512, stat2: 0.927, stat3: 4.8, stat4: 79 },
    { team: 0, name: "Abberthel Li", stat1: 630, stat2: 0.655, stat3: 4.3, stat4: 84 },
    { team: 0, name: "Jeffer Waghan", stat1: 488, stat2: 0.238, stat3: 4.77, stat4: 69 },
    { team: 0, name: "Giorry Loghulzah", stat1: 455, stat2: 0.182, stat3: 1.97, stat4: 82 },
    { team: 0, name: "Cornadel Spon", stat1: 664, stat2: 0.296, stat3: 1.109, stat4: 86 },
    { team: 0, name: "Eugielsey Morey", stat1: 655, stat2: 0.567, stat3: 5.88, stat4: 72 },
    { team: 0, name: "Reni Hey", stat1: 649, stat2: 0.73, stat3: 2.25, stat4: 77 },
    { team: 0, name: "Wilf Boisenees", stat1: 443, stat2: 0.306, stat3: 4.43, stat4: 75 },
    { team: 0, name: "Scolo Fyfever", stat1: 660, stat2: 0.443, stat3: 10.79, stat4: 80 },
    { team: 0, name: "Tram Sperzchne", stat1: 632, stat2: 0.178, stat3: 1.41, stat4: 75 },
    { team: 0, name: "Thanderem Khez", stat1: 643, stat2: 0.647, stat3: 2.09, stat4: 85 },
    { team: 0, name: "Frielbe Fris", stat1: 440, stat2: 0.105, stat3: 1.26, stat4: 76 },
    { team: 0, name: "Jimmadle Kirnagat", stat1: 574, stat2: 0.592, stat3: 9.05, stat4: 88 },
    { team: 0, name: "Fiotte Grich", stat1: 470, stat2: 0.709, stat3: 10.14, stat4: 79 },
    { team: 0, name: "Reesteph Escourg", stat1: 481, stat2: 0.337, stat3: 1.45, stat4: 79 },
    { team: 1, name: "Geonharge Faubark", stat1: 421, stat2: 0.075, stat3: 3.46, stat4: 75 },
    { team: 1, name: "Damaletta Pattercham", stat1: 468, stat2: 0.276, stat3: 9.36, stat4: 75 },
    { team: 1, name: "Bro Ravioli", stat1: 579, stat2: 0.229, stat3: 10.370000000000001, stat4: 72 },
    { team: 1, name: "Zelminonsun Grimentond", stat1: 602, stat2: 0.812, stat3: 9.42, stat4: 72 },
    { team: 1, name: "Bepis Mainardeed", stat1: 648, stat2: 0.98, stat3: 8.4, stat4: 85 },
    { team: 1, name: "Leorgie Duple", stat1: 534, stat2: 0.095, stat3: 9.4, stat4: 79 },
    { team: 1, name: "Clebalton Sodacan", stat1: 663, stat2: 0.85, stat3: 1.99, stat4: 86 },
    { team: 1, name: "Jenjah Moelfriza", stat1: 661, stat2: 0.508, stat3: 10.3, stat4: 85 },
    { team: 1, name: "Olwira Hari", stat1: 482, stat2: 0.029, stat3: 9.1, stat4: 77 },
    { team: 1, name: "Tadwin Haveki", stat1: 567, stat2: 0.762, stat3: 10.86, stat4: 86 },
    { team: 1, name: "Creil Kosse", stat1: 629, stat2: 0.432, stat3: 2.51, stat4: 71 },
    { team: 1, name: "Aprilda Bery", stat1: 505, stat2: 0.513, stat3: 5.185, stat4: 75 },
    { team: 1, name: "Larglie Meanther", stat1: 493, stat2: 0.284, stat3: 1, stat4: 81 },
    { team: 1, name: "Die Lady", stat1: 611, stat2: 0.838, stat3: 9.7, stat4: 75 },
    { team: 1, name: "Torice Cosraver", stat1: 484, stat2: 0.922, stat3: 8.46, stat4: 86 },
    { team: 1, name: "Chanuel Assa", stat1: 660, stat2: 0.129, stat3: 6.17, stat4: 76 },
    { team: 1, name: "Philinsel Bran", stat1: 547, stat2: 0.595, stat3: 7.8, stat4: 69 },
    { team: 1, name: "Wilbergel Sanielki", stat1: 425, stat2: 0.551, stat3: 7.28, stat4: 69 },
    { team: 1, name: "Sandert Trucenti", stat1: 524, stat2: 0.904, stat3: 10.45, stat4: 70 },
    { team: 1, name: "Quincen Buda", stat1: 522, stat2: 0.576, stat3: 1.69, stat4: 85 },
    { team: 2, name: "Smitrico Shapch", stat1: 472, stat2: 0.037, stat3: 5.56, stat4: 83 },
    { team: 2, name: "Daronicia Stureen", stat1: 600, stat2: 0.623, stat3: 5.69, stat4: 76 },
    { team: 2, name: "Jonarv Chon", stat1: 456, stat2: 0.436, stat3: 6.1, stat4: 88 },
    { team: 2, name: "Cliastian Hacz", stat1: 444, stat2: 0.838, stat3: 9.32, stat4: 87 },
    { team: 2, name: "Prisa Bogden", stat1: 553, stat2: 0.848, stat3: 8.36, stat4: 81 },
    { team: 2, name: "Thorsteb Devliciuk", stat1: 625, stat2: 0.078, stat3: 2.64, stat4: 78 },
    { team: 2, name: "Swellynard St. Marking", stat1: 572, stat2: 0.594, stat3: 8.18, stat4: 88 },
    { team: 2, name: "Havina Caudelman", stat1: 455, stat2: 0.297, stat3: 2.83, stat4: 85 },
    { team: 2, name: "Reesteph Kingel", stat1: 571, stat2: 0.404, stat3: 10.65, stat4: 80 },
    { team: 2, name: "Tram Not", stat1: 481, stat2: 0.9, stat3: 3.06, stat4: 73 },
    { team: 2, name: "Aylmot Kowicker", stat1: 635, stat2: 0.209, stat3: 3.17, stat4: 89 },
    { team: 2, name: "Tovisel Pfefers", stat1: 573, stat2: 0.818, stat3: 3.02, stat4: 74 },
    { team: 2, name: "Joichody Randoni", stat1: 622, stat2: 0.64, stat3: 1.18, stat4: 84 },
    { team: 2, name: "Laurank Kiro", stat1: 562, stat2: 0.907, stat3: 9.23, stat4: 84 },
    { team: 2, name: "Regorty Brathian", stat1: 547, stat2: 0.599, stat3: 2.03, stat4: 89 },
    { team: 2, name: "Marcevy Maleerg", stat1: 537, stat2: 0.254, stat3: 8.19, stat4: 82 },
    { team: 2, name: "Naten Simhaguer", stat1: 631, stat2: 0.212, stat3: 7.53, stat4: 84 },
    { team: 2, name: "Iantia Fleugdon", stat1: 657, stat2: 0.516, stat3: 9.58, stat4: 71 },
    { team: 2, name: "Tadwin Narovsky", stat1: 562, stat2: 0.227, stat3: 8.04, stat4: 83 },
    { team: 2, name: "Brily Varingharren", stat1: 465, stat2: 0.033, stat3: 9.89, stat4: 81 },
    { team: 3, name: "Cla Liess", stat1: 646, stat2: 0.464, stat3: 4.21, stat4: 88 },
    { team: 3, name: "Giorry Blad", stat1: 645, stat2: 0.951, stat3: 5.685, stat4: 81 },
    { team: 3, name: "Todwin Hindl", stat1: 644, stat2: 0.619, stat3: 10.31, stat4: 74 },
    { team: 3, name: "Wiltonie Shamervar", stat1: 632, stat2: 0.088, stat3: 8.42, stat4: 81 },
    { team: 3, name: "Murdt Shunstis", stat1: 616, stat2: 0.794, stat3: 2.85, stat4: 73 },
    { team: 3, name: "Eugielsey Sominger", stat1: 535, stat2: 0.365, stat3: 8.46, stat4: 77 },
    { team: 3, name: "Cobiter Vivasson", stat1: 648, stat2: 0.683, stat3: 4.16, stat4: 72 },
    { team: 3, name: "Claunise Phama", stat1: 488, stat2: 0.723, stat3: 3.09, stat4: 87 },
    { team: 3, name: "Rogdard Ubero", stat1: 526, stat2: 0.85, stat3: 7.43, stat4: 81 },
    { team: 3, name: "Parrold Zare", stat1: 581, stat2: 0.78, stat3: 7.975, stat4: 83 },
    { team: 3, name: "Brick Ozmourgan", stat1: 609, stat2: 0.303, stat3: 4.81, stat4: 76 },
    { team: 3, name: "Geonharge Coustias", stat1: 482, stat2: 0.255, stat3: 4.64, stat4: 77 },
    { team: 3, name: "Orleadore Keld", stat1: 451, stat2: 0.294, stat3: 8.02, stat4: 88 },
    { team: 3, name: "Aprilda Person", stat1: 437, stat2: 0.617, stat3: 3.907, stat4: 76 },
    { team: 3, name: "Renacin Cirkburwar", stat1: 610, stat2: 0.678, stat3: 1.32, stat4: 85 },
    { team: 3, name: "Udalimon Wytens", stat1: 559, stat2: 0.791, stat3: 4.44, stat4: 83 },
    { team: 3, name: "Tobby Conson", stat1: 660, stat2: 0.704, stat3: 6.19, stat4: 81 },
    { team: 3, name: "Saliver Vanciussell", stat1: 644, stat2: 0.238, stat3: 10.5, stat4: 76 },
    { team: 3, name: "Marylahal Borossi", stat1: 518, stat2: 0.623, stat3: 2.87, stat4: 88 },
    { team: 3, name: "Per Chhauson", stat1: 462, stat2: 0.066, stat3: 4.52, stat4: 83 },
    { team: 4, name: "Giffe Newporti", stat1: 444, stat2: 0.542, stat3: 3.64, stat4: 71 },
    { team: 4, name: "Sandert Iu", stat1: 439, stat2: 0.046, stat3: 1.68, stat4: 88 },
    { team: 4, name: "Edelodee Neel", stat1: 547, stat2: 0.73, stat3: 7.26, stat4: 89 },
    { team: 4, name: "Wadclail Kuler", stat1: 433, stat2: 0.699, stat3: 1.65, stat4: 76 },
    { team: 4, name: "Noab Horwak", stat1: 535, stat2: 0.231, stat3: 5.5, stat4: 75 },
    { team: 4, name: "Jeancy ToDonkelardt", stat1: 623, stat2: 0.443, stat3: 4.36, stat4: 82 },
    { team: 4, name: "Ingunna Kikise", stat1: 482, stat2: 0.193, stat3: 1.69, stat4: 82 },
    { team: 4, name: "Philinsel Man", stat1: 592, stat2: 0.076, stat3: 7.185, stat4: 69 },
    { team: 4, name: "Bepis du Bessinkus", stat1: 441, stat2: 0.17, stat3: 4.84, stat4: 83 },
    { team: 4, name: "Sibley Wadice", stat1: 508, stat2: 0.252, stat3: 2.36, stat4: 69 },
    { team: 4, name: "Damaletta McClen", stat1: 435, stat2: 0.506, stat3: 8.39, stat4: 87 },
    { team: 4, name: "Sily Castrez", stat1: 496, stat2: 0.846, stat3: 10.45, stat4: 80 },
    { team: 4, name: "Zelminonsun Frobin", stat1: 608, stat2: 0.002, stat3: 3.75, stat4: 74 },
    { team: 4, name: "Elin Gold", stat1: 648, stat2: 0.236, stat3: 3.427, stat4: 76 },
    { team: 4, name: "Faylene Obedem", stat1: 561, stat2: 0.661, stat3: 2.738, stat4: 69 },
    { team: 4, name: "Torice Briceki", stat1: 560, stat2: 0.644, stat3: 7.35, stat4: 86 },
    { team: 4, name: "Trid Sanji", stat1: 556, stat2: 0.056, stat3: 9.84, stat4: 82 },
    { team: 4, name: "Die Johnstroger", stat1: 514, stat2: 0.531, stat3: 9.86, stat4: 87 },
    { team: 4, name: "Corn Tsa", stat1: 642, stat2: 0.713, stat3: 10.85, stat4: 86 },
    { team: 4, name: "Crein Sili", stat1: 547, stat2: 0.086, stat3: 10.26, stat4: 78 },
    { team: 5, name: "Fiotte Lightows", stat1: 647, stat2: 0.539, stat3: 1.01, stat4: 81 },
    { team: 5, name: "Johnna Bnrlan", stat1: 513, stat2: 0.669, stat3: 8.940000000000001, stat4: 88 },
    { team: 5, name: "Wilf Brockle", stat1: 580, stat2: 0.441, stat3: 3.19, stat4: 70 },
    { team: 5, name: "Lizianet Schnire", stat1: 524, stat2: 0.64, stat3: 9.72, stat4: 84 },
    { team: 5, name: "Wilfo Abergeorgos", stat1: 638, stat2: 0.477, stat3: 10.82, stat4: 84 },
    { team: 5, name: "Riters Marker", stat1: 494, stat2: 0.821, stat3: 8.12, stat4: 78 },
    { team: 5, name: "Dmiandy Miorf", stat1: 654, stat2: 0.029, stat3: 6.140000000000001, stat4: 81 },
    { team: 5, name: "Ulbernold Zoppord", stat1: 637, stat2: 0.8, stat3: 10.54, stat4: 87 },
    { team: 5, name: "Consola Hubb", stat1: 577, stat2: 0.676, stat3: 7.21, stat4: 75 },
    { team: 5, name: "Osmunce Colvo", stat1: 434, stat2: 0.809, stat3: 9, stat4: 81 },
    { team: 5, name: "Scolo Cong", stat1: 569, stat2: 0.598, stat3: 2.65, stat4: 83 },
    { team: 5, name: "Ephris Wu", stat1: 481, stat2: 0.283, stat3: 6.57, stat4: 88 },
    { team: 5, name: "Raphen McDung", stat1: 562, stat2: 0.474, stat3: 10.9, stat4: 88 },
    { team: 5, name: "Crin Woodford", stat1: 630, stat2: 0.753, stat3: 4.8, stat4: 85 },
    { team: 5, name: "Cornadel Barn", stat1: 473, stat2: 0.346, stat3: 10.97, stat4: 85 },
    { team: 5, name: "Westord Moreya", stat1: 441, stat2: 0.458, stat3: 4.25, stat4: 82 },
    { team: 5, name: "Manie Lowlandolka", stat1: 508, stat2: 0.335, stat3: 2.15, stat4: 82 },
    { team: 5, name: "Bro Belch", stat1: 430, stat2: 0.124, stat3: 10.84, stat4: 72 },
    { team: 5, name: "Jimmadle Hennell", stat1: 490, stat2: 0.099, stat3: 3.92, stat4: 71 },
    { team: 5, name: "Frielbe Joslower", stat1: 453, stat2: 0.774, stat3: 8.27, stat4: 86 },
    { team: 6, name: "Gogu Jeffer", stat1: 649, stat2: 0.421, stat3: 10.8, stat4: 80 },
    { team: 6, name: "Jenjah McGonard", stat1: 516, stat2: 0.567, stat3: 9.82, stat4: 85 },
    { team: 6, name: "Wilbergel Kov", stat1: 534, stat2: 0.988, stat3: 8.51, stat4: 88 },
    { team: 6, name: "Kirelia DeBers", stat1: 594, stat2: 0.921, stat3: 10.78, stat4: 84 },
    { team: 6, name: "Olwira Quan", stat1: 633, stat2: 0.607, stat3: 5.99, stat4: 85 },
    { team: 6, name: "Lial Wasch", stat1: 612, stat2: 0.379, stat3: 8.51, stat4: 69 },
    { team: 6, name: "Pathailly Bersky", stat1: 426, stat2: 0.465, stat3: 8.48, stat4: 85 },
    { team: 6, name: "Rodristin South", stat1: 513, stat2: 0.405, stat3: 10.21, stat4: 73 },
    { team: 6, name: "Jeffer Galamannan", stat1: 528, stat2: 0.724, stat3: 7.66, stat4: 73 },
    { team: 6, name: "Emerodeo Whettino", stat1: 586, stat2: 0.749, stat3: 2.96, stat4: 83 },
    { team: 6, name: "Mirace Maruet", stat1: 639, stat2: 0.172, stat3: 5.74, stat4: 87 },
    { team: 6, name: "Estinona Ganek", stat1: 532, stat2: 0.495, stat3: 10.13, stat4: 89 },
    { team: 6, name: "Elganah Studger", stat1: 643, stat2: 0.76, stat3: 9.12, stat4: 71 },
    { team: 6, name: "Paoldor Mullines", stat1: 581, stat2: 0.358, stat3: 3.31, stat4: 85 },
    { team: 6, name: "Creil Podle", stat1: 501, stat2: 0.433, stat3: 1.41, stat4: 70 },
    { team: 6, name: "Menauddie Groombera", stat1: 618, stat2: 0.825, stat3: 7.42, stat4: 73 },
    { team: 6, name: "Carlocha Cicchi", stat1: 631, stat2: 0.301, stat3: 5.225, stat4: 87 },
    { team: 6, name: "Thanderem Squin", stat1: 455, stat2: 0.639, stat3: 5.13, stat4: 83 },
    { team: 6, name: "Brop Hato", stat1: 441, stat2: 0.655, stat3: 4.36, stat4: 71 },
    { team: 6, name: "Jonan Varas", stat1: 482, stat2: 0.814, stat3: 5.98, stat4: 77 },
    { team: 7, name: "Leorgie Guan", stat1: 447, stat2: 0.122, stat3: 5.77, stat4: 83 },
    { team: 7, name: "Mord Chan", stat1: 475, stat2: 0.494, stat3: 7.41, stat4: 89 },
    { team: 7, name: "Joey Loggs", stat1: 584, stat2: 0.677, stat3: 3.48, stat4: 78 },
    { team: 7, name: "Flipertond Biewsky", stat1: 610, stat2: 0.32, stat3: 9.74, stat4: 89 },
    { team: 7, name: "Then Mizer", stat1: 488, stat2: 0.979, stat3: 4.85, stat4: 72 },
    { team: 7, name: "Wood Allweric", stat1: 651, stat2: 0.578, stat3: 5.81, stat4: 70 },
    { team: 7, name: "Cindrene Bibiak", stat1: 663, stat2: 0.239, stat3: 1.35, stat4: 71 },
    { team: 7, name: "Benrie Dagobichner", stat1: 584, stat2: 0.952, stat3: 1.03, stat4: 82 },
    { team: 7, name: "Chanuel Gure", stat1: 612, stat2: 0.044, stat3: 9.98, stat4: 70 },
    { team: 7, name: "Sabrica Mad", stat1: 503, stat2: 0.793, stat3: 4.26, stat4: 86 },
    { team: 7, name: "Etharalie Eckhampfer", stat1: 645, stat2: 0.17, stat3: 4.02, stat4: 81 },
    { team: 7, name: "Abberthel Glemans", stat1: 423, stat2: 0.354, stat3: 4.83, stat4: 79 },
    { team: 7, name: "Larglie Manga", stat1: 540, stat2: 0.964, stat3: 7.52, stat4: 88 },
    { team: 7, name: "Jonard Desing", stat1: 579, stat2: 0.627, stat3: 8.44, stat4: 85 },
    { team: 7, name: "Roge Scant", stat1: 618, stat2: 0.206, stat3: 10.02, stat4: 76 },
    { team: 7, name: "Reni Pendi", stat1: 572, stat2: 0.874, stat3: 5.01, stat4: 88 },
    { team: 7, name: "Zacheilio Weatealyk", stat1: 457, stat2: 0.547, stat3: 3.27, stat4: 85 },
    { team: 7, name: "Merward Daabansboel", stat1: 446, stat2: 0.635, stat3: 3.65, stat4: 89 },
    { team: 7, name: "Mischerly Goudetsen", stat1: 477, stat2: 0.124, stat3: 1.1, stat4: 77 },
    { team: 7, name: "Tyssey Tutvia", stat1: 641, stat2: 0.898, stat3: 1.97, stat4: 79 },
    { team: 8, name: "Chrik Moorgily", stat1: 431, stat2: 0.76, stat3: 4.21, stat4: 81 },
    { team: 8, name: "Ludvigo Gubali", stat1: 609, stat2: 0.788, stat3: 5.96, stat4: 69 },
    { team: 8, name: "Adrus Pownfiz", stat1: 642, stat2: 0.201, stat3: 10.73, stat4: 74 },
    { team: 8, name: "Trellman Thitway", stat1: 529, stat2: 0.013, stat3: 6.56, stat4: 88 },
    { team: 8, name: "Gred Mon", stat1: 556, stat2: 0.745, stat3: 10.08, stat4: 74 },
    { team: 8, name: "Barnonzo Guebini", stat1: 466, stat2: 0.233, stat3: 3.846, stat4: 76 },
    { team: 8, name: "Mance Weiman", stat1: 552, stat2: 0.589, stat3: 10.71, stat4: 72 },
    { team: 8, name: "Norgie Deminger", stat1: 426, stat2: 0.911, stat3: 1.89, stat4: 75 },
    { team: 8, name: "Clebalton Wiglaie", stat1: 655, stat2: 0.643, stat3: 8.52, stat4: 87 },
    { team: 8, name: "Cornadel Lady", stat1: 619, stat2: 0.373, stat3: 9.81, stat4: 82 },
    { team: 8, name: "Trid Trucenti", stat1: 599, stat2: 0.652, stat3: 3.78, stat4: 89 },
    { team: 8, name: "Corn Khez", stat1: 644, stat2: 0.972, stat3: 7.37, stat4: 71 },
    { team: 8, name: "Elganah Meunsby", stat1: 449, stat2: 0.245, stat3: 7.22, stat4: 82 },
    { team: 8, name: "Orleadore Sodacan", stat1: 591, stat2: 0.977, stat3: 10.85, stat4: 72 },
    { team: 8, name: "Creil Haveki", stat1: 544, stat2: 0.652, stat3: 6.17, stat4: 69 },
    { team: 8, name: "Sibley Pattercham", stat1: 422, stat2: 0.1, stat3: 6.21, stat4: 76 },
    { team: 8, name: "Adrus Jesters", stat1: 428, stat2: 0.737, stat3: 4.32, stat4: 70 },
    { team: 8, name: "Regorty Grimentond", stat1: 655, stat2: 0.721, stat3: 7.52, stat4: 82 },
    { team: 8, name: "Jeffer Loghulzah", stat1: 522, stat2: 0.838, stat3: 8.4, stat4: 72 },
    { team: 8, name: "Lizianet Fris", stat1: 485, stat2: 0.091, stat3: 9.45, stat4: 89 },
    { team: 9, name: "Olwira Kirnagat", stat1: 589, stat2: 0.998, stat3: 7.72, stat4: 80 },
    { team: 9, name: "Ingunna Assa", stat1: 483, stat2: 0.392, stat3: 9.37, stat4: 88 },
    { team: 9, name: "Clebalton Morey", stat1: 624, stat2: 0.555, stat3: 2.97, stat4: 77 },
    { team: 9, name: "Crin Meanther", stat1: 544, stat2: 0.645, stat3: 7.4, stat4: 69 },
    { team: 9, name: "Wilf Spon", stat1: 648, stat2: 0.302, stat3: 1.35, stat4: 83 },
    { team: 9, name: "Prisa Hey", stat1: 646, stat2: 0.61, stat3: 6.24, stat4: 82 },
    { team: 9, name: "Norgie Shuk", stat1: 570, stat2: 0.688, stat3: 5.85, stat4: 77 },
    { team: 9, name: "Ulbernold Li", stat1: 502, stat2: 0.195, stat3: 5.03, stat4: 83 },
    { team: 9, name: "Rogdard Waghan", stat1: 533, stat2: 0.635, stat3: 2.39, stat4: 81 },
    { team: 9, name: "Mord Ravioli", stat1: 524, stat2: 0.894, stat3: 8.79, stat4: 87 },
    { team: 9, name: "Noab Bran", stat1: 556, stat2: 0.605, stat3: 3.32, stat4: 74 },
    { team: 9, name: "Zacheilio Grich", stat1: 604, stat2: 0.925, stat3: 8.57, stat4: 86 },
    { team: 9, name: "Wood Hari", stat1: 492, stat2: 0.974, stat3: 6.89, stat4: 77 },
    { team: 9, name: "Brop Escourg", stat1: 531, stat2: 0.984, stat3: 7.16, stat4: 81 },
    { team: 9, name: "Daronicia Mainardeed", stat1: 482, stat2: 0.578, stat3: 6.8, stat4: 82 },
    { team: 9, name: "Pathailly Duple", stat1: 518, stat2: 0.171, stat3: 3.63, stat4: 79 },
    { team: 9, name: "Cla Fyfever", stat1: 598, stat2: 0.166, stat3: 8.56, stat4: 78 },
    { team: 9, name: "Laurank Sanielki", stat1: 501, stat2: 0.344, stat3: 1.38, stat4: 82 },
    { team: 9, name: "Thorsteb Boisenees", stat1: 555, stat2: 0.808, stat3: 2.57, stat4: 69 },
    { team: 9, name: "Emerodeo Thi", stat1: 658, stat2: 0.171, stat3: 9.18, stat4: 76 },
    { team: 10, name: "Allint Studa", stat1: 570, stat2: 0.799, stat3: 10.08, stat4: 82 },
    { team: 10, name: "Tordan Pows", stat1: 423, stat2: 0.084, stat3: 1.33, stat4: 87 },
    { team: 10, name: "Ephristy Lighan", stat1: 483, stat2: 0.515, stat3: 9.33, stat4: 89 },
    { team: 10, name: "Sank Horf", stat1: 598, stat2: 0.461, stat3: 9.04, stat4: 69 },
    { team: 10, name: "Hermai Sture", stat1: 484, stat2: 0.57, stat3: 10.2, stat4: 73 },
    { team: 10, name: "Ajah Fyfer", stat1: 431, stat2: 0.821, stat3: 3.9, stat4: 87 },
    { team: 10, name: "Obergel Budger", stat1: 633, stat2: 0.304, stat3: 1.01, stat4: 80 },
    { team: 10, name: "Bubbott Podle", stat1: 526, stat2: 0.641, stat3: 5.98, stat4: 86 },
    { team: 10, name: "Konrique Moreya", stat1: 597, stat2: 0.305, stat3: 3.48, stat4: 89 },
    { team: 10, name: "Tampson Belki", stat1: 574, stat2: 0.314, stat3: 4.67, stat4: 72 },
    { team: 10, name: "Frewett Wealy", stat1: 454, stat2: 0.017, stat3: 10.97, stat4: 77 },
    { team: 10, name: "Morichorne Sodle", stat1: 500, stat2: 0.228, stat3: 7.07, stat4: 74 },
    { team: 10, name: "Benarny Hingeortis", stat1: 504, stat2: 0.241, stat3: 7.37, stat4: 81 },
    { team: 10, name: "Quiggs Cosravers", stat1: 459, stat2: 0.939, stat3: 7.01, stat4: 81 },
    { team: 10, name: "Dillmain Jestis", stat1: 621, stat2: 0.402, stat3: 4.029, stat4: 86 },
    { team: 10, name: "Boriggie Kov", stat1: 492, stat2: 0.107, stat3: 4.27, stat4: 77 },
    { team: 10, name: "Vlaw Mainghar", stat1: 544, stat2: 0.53, stat3: 1.46, stat4: 83 },
    { team: 10, name: "Mendon Brizah", stat1: 530, stat2: 0.892, stat3: 2.07, stat4: 88 },
    { team: 10, name: "Bent Kikise", stat1: 488, stat2: 0.527, stat3: 7.62, stat4: 79 },
    { team: 10, name: "Wilby Allinark", stat1: 441, stat2: 0.297, stat3: 9.28, stat4: 88 },
    { team: 11, name: "Sherney Pendonson", stat1: 620, stat2: 0.2, stat3: 9.32, stat4: 79 },
    { team: 11, name: "Hannie Simharren", stat1: 552, stat2: 0.415, stat3: 10.95, stat4: 73 },
    { team: 11, name: "Barie Chhaubali", stat1: 438, stat2: 0.24, stat3: 9.23, stat4: 88 },
    { team: 11, name: "Ev Woodacz", stat1: 529, stat2: 0.558, stat3: 2.15, stat4: 73 },
    { team: 11, name: "Terwig Guan", stat1: 507, stat2: 0.086, stat3: 3.71, stat4: 72 },
    { team: 11, name: "Demet Escourgili", stat1: 551, stat2: 0.933, stat3: 5.43, stat4: 82 },
    { team: 11, name: "Walen Gubard", stat1: 642, stat2: 0.783, stat3: 9.66, stat4: 80 },
    { team: 11, name: "Alairgi Scant", stat1: 522, stat2: 0.078, stat3: 8.45, stat4: 84 },
    { team: 11, name: "Geo Waghtondi", stat1: 558, stat2: 0.742, stat3: 6.05, stat4: 75 },
    { team: 11, name: "Buce Couson", stat1: 453, stat2: 0.295, stat3: 3.44, stat4: 83 },
    { team: 11, name: "Then Faubb", stat1: 615, stat2: 0.117, stat3: 1.46, stat4: 77 },
    { team: 11, name: "Orio Colvo", stat1: 643, stat2: 0.662, stat3: 5.03, stat4: 83 },
    { team: 11, name: "Antonrongel Somino", stat1: 625, stat2: 0.576, stat3: 1.21, stat4: 84 },
    { team: 11, name: "Zacie Whet", stat1: 469, stat2: 0.199, stat3: 10.62, stat4: 79 },
    { team: 11, name: "Ske Weiman", stat1: 488, stat2: 0.456, stat3: 4.13, stat4: 85 },
    { team: 11, name: "Edmang Khez", stat1: 544, stat2: 0.503, stat3: 10.07, stat4: 89 },
    { team: 11, name: "Tedie St. Marre", stat1: 636, stat2: 0.12, stat3: 1.63, stat4: 76 },
    { team: 11, name: "Euglis Bringer", stat1: 625, stat2: 0.292, stat3: 10.379, stat4: 69 },
    { team: 11, name: "Dry Shuk", stat1: 632, stat2: 0.48, stat3: 7.54, stat4: 86 },
    { team: 11, name: "Yaakee McGon", stat1: 630, stat2: 0.906, stat3: 5.12, stat4: 85 }
];
/** @type {{batter: string, pitcher: string}[]} */
const starPlayers = [];
for(let i = 0; i < TeamInfo.length; i++) {
    const teamPlayers = PlayerInfo.filter(e => e.team === i);
    const bestBatter = teamPlayers.reduce((a, b) => (a.stat1 > b.stat1 ? a : b)).name;
    const bestPitcher = teamPlayers.reduce((a, b) => (a.stat4 > b.stat4 ? a : b)).name;
    starPlayers.push({ batter: bestBatter, pitcher: bestPitcher });
}
const PitchNames = ["Wave", "Direct", "Unity", "Deceit"];