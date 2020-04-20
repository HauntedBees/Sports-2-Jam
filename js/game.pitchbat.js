class AtBatHandler extends Handler {
    state = 0; // 0 = waiting on both players, 1 = ball is being pitched or hit
    ballData = {};
    constructor() {
        super();
        this.freeMovement = true;
        const p1IsBatter = BaseStar.data.team1.isUp;
        const battingTeam = p1IsBatter ? BaseStar.data.team1 : BaseStar.data.team2;
        const pitchingTeam = p1IsBatter ? BaseStar.data.team2 : BaseStar.data.team1;
        BaseStar.data.inning.IncrementBatter(); // TODO: this is wrong it'll increment even during strikes
        this.batHandler = new BatHandler(battingTeam);
        this.pitchHandler = new PitchHandler(pitchingTeam, this);
        BaseStar.cpu.InitPitchBat(this.batHandler, this.pitchHandler, !battingTeam.isPlayerControlled, !pitchingTeam.isPlayerControlled);
        this.DrawPlayerInfo();
    }
    CleanUp() {
        gfx.ClearLayer("background2");
        gfx.ClearLayer("p2background2");
        BaseStar.cpu.ClearPitchBat();
    }
    StrikeOut() {
        if(BaseStar.data.inning.StruckOut()) {
            if(BaseStar.data.inning.IncreaseOutsAndReturnIfSwitch()) {
                AnimationHelpers.StartScrollText("CHANGE PLACES!", function() { BaseStar.ChangePlaces(); });
            } else {
                BaseStar.SwitchHandler(AtBatHandler);
            }
        } else {
            BaseStar.SwitchHandler(AtBatHandler);
        }
    }
    KeyPress(key) {
        this.batHandler.KeyPress(key);
        this.pitchHandler.KeyPress(key);
    }
    Update() {
        if(AnimationHelpers.IsAnimating()) { return; }
        this.batHandler.Update();
        this.pitchHandler.Update();
        if(this.state === 0) {
            if(this.batHandler.ready && this.pitchHandler.ready) {
                this.state = 1;
                this.pitchHandler.ThrowBall();
                this.batHandler.AwaitBall();
            }
        } else if(this.state === 1) {
            if(this.batHandler.swingState === 4) {
                this.state = 2;
                const d = this.pitchHandler.GetBallDetails();
                const dx = d.idealx - d.ballx, dy = d.idealy - d.bally;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const dir = (d.idealy < d.bally) ? -1 : 1; // too soon is right, too late is left
                let offset = 0;
                console.log(distance);
                if(distance <= 1) { // perfect shot
                    offset = 0;
                } else if(distance <= 3) { // close enough
                    offset = 0.25;
                } else if(distance <= 25) { // ehh
                    offset = Math.log(distance);
                } else {
                    offset = Math.log(distance); //offset = -1;
                }
                if(offset >= 0) {
                    this.ballData = {
                        pos: this.batHandler.dx, swingType: 1, 
                        dir: this.batHandler.dir, offset: offset * dir,
                        power: this.batHandler.power
                    };
                    this.pitchHandler.BallHit(d.ballx, d.bally, 2 * this.batHandler.dir + offset * dir, this.batHandler.power);
                } else {
                    this.batHandler.missed = true;
                    console.log("you missed dipshit");
                }
            }
        } else if(this.state === 2 && this.pitchHandler.throwState === 2) {
            this.state = 3;
            BaseStar.SwitchHandlerWithArgs(FieldRunHandler, this.ballData, BaseStar.data.constellation);
        }
    }
    AnimUpdate() {
        this.pitchHandler.AnimUpdate();
        this.batHandler.AnimUpdate();
    }
    DrawPlayerInfo() {
        gfx.DrawSpriteToCameras("UI", "basehud", 0, 0, 0, 320, "background2", 640);
        gfx.WriteEchoOptionText("SPEED", 39, 356, "background2", "#FFFFFF", "#BA66FF", 12);
        gfx.WriteEchoOptionText("km/s", 55, 373, "background2", "#FFFFFF", "#BA66FF", 11);
        gfx.WriteEchoOptionText("OUTS: " + BaseStar.data.inning.outs, 38, 392, "background2", "#FFFFFF", "#BA66FF", 12);
        if(BaseStar.data.inning.strikes === 1) {
            gfx.WriteEchoOptionText("STRUCK", 38, 410, "background2", "#FFFFFF", "#BA66FF", 12);
        }

        gfx.WriteEchoOptionText("INNING " + BaseStar.data.inning.inningNumber, 585, 392, "background2", "#FFFFFF", "#BA66FF", 12);
        const scoreX = 585, scoreY = 408, dx = 30;
        gfx.WriteEchoOptionText(BaseStar.data.team1.initial, scoreX - dx, scoreY, "background2", "#FFFFFF", "#BA66FF", 12);
        gfx.WriteEchoOptionText(`${BaseStar.data.team1.score}-${BaseStar.data.team2.score}`, scoreX, scoreY, "background2", "#FFFFFF", "#BA66FF", 12);
        gfx.WriteEchoOptionText(BaseStar.data.team2.initial, scoreX + dx, scoreY, "background2", "#FFFFFF", "#BA66FF", 12);
        const underlineMult = BaseStar.data.team1.isUp ? -1 : 1;
        gfx.WriteOptionText("-", scoreX + underlineMult * dx, scoreY + 15, "background2", "#FFADCD", 30);

        const playerInfoY = 435, batX = 10, pitchX = 525, dy = 17, statDx = 100;
        const battingPlayer = this.batHandler.team.players[BaseStar.data.inning.atBatPlayerIdx];
        gfx.WriteEchoPlayerText(battingPlayer.name, batX, playerInfoY, 110, "background2", "#FFFFFF", "#BA66FF", 12, "left");
        gfx.WriteEchoPlayerText("WQ.", batX, playerInfoY + dy, 110, "background2", "#FFFFFF", "#BA66FF", 12, "left");
        gfx.WriteEchoPlayerText("PF.", batX, playerInfoY + 2 * dy, 110, "background2", "#FFFFFF", "#BA66FF", 12, "left");
        gfx.WriteEchoPlayerText(battingPlayer.stat1.toString(), batX + statDx, playerInfoY + dy, 110, "background2", "#FFFFFF", "#BA66FF", 12, "right");
        gfx.WriteEchoPlayerText(battingPlayer.stat2.toFixed(3), batX + statDx, playerInfoY + 2 * dy, 110, "background2", "#FFFFFF", "#BA66FF", 12, "right");

        const pitchingPlayer = this.pitchHandler.team.players[BaseStar.data.inning.pitcherIdx];
        gfx.WriteEchoPlayerText(pitchingPlayer.name, pitchX, playerInfoY, 110, "background2", "#FFFFFF", "#BA66FF", 12, "left");
        gfx.WriteEchoPlayerText("ZIG", pitchX, playerInfoY + dy, 110, "background2", "#FFFFFF", "#BA66FF", 12, "left");
        gfx.WriteEchoPlayerText("KZ.", pitchX, playerInfoY + 2 * dy, 110, "background2", "#FFFFFF", "#BA66FF", 12, "left");
        gfx.WriteEchoPlayerText(pitchingPlayer.stat3.toFixed(2), pitchX + statDx, playerInfoY + dy, 110, "background2", "#FFFFFF", "#BA66FF", 12, "right");
        gfx.WriteEchoPlayerText(pitchingPlayer.stat4.toString(), pitchX + statDx, playerInfoY + 2 * dy, 110, "background2", "#FFFFFF", "#BA66FF", 12, "right");
    }
}