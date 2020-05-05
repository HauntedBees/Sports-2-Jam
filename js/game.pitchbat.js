class AtBatHandler extends Handler {
    constructor() {
        super();
        this.state = 0; // 0 = waiting on both players, 1 = ball is being pitched or hit
        this.ballData = {};
        this.animFrame = 0;
        this.freeMovement = true;
        this.ohWowState = 0;
        this.ohWowFrame = 0;
        const p1IsBatter = BaseStar.data.team1.isUp;
        const battingTeam = p1IsBatter ? BaseStar.data.team1 : BaseStar.data.team2;
        const pitchingTeam = p1IsBatter ? BaseStar.data.team2 : BaseStar.data.team1;
        this.batHandler = new BatHandler(battingTeam);
        this.pitchHandler = new PitchHandler(pitchingTeam, this);
        BaseStar.cpu.InitPitchBat(this.batHandler, this.pitchHandler, !battingTeam.isPlayerControlled, !pitchingTeam.isPlayerControlled);
        this.DrawPlayerInfo();
        this.constellation = ConstellationInfo[BaseStar.data.constellation];
        let x0 = 9999, x1 = 0, y0 = 9999, y1 = 0;
        this.constellation.stars.forEach(s => {
            if(s.x < x0) { x0 = s.x; }
            if(s.x > x1) { x1 = s.x; }
            if(s.y < y0) { y0 = s.y; }
            if(s.y > y1) { y1 = s.y; }
        });
        this.centerX = x0 + (x1 - x0) / 2;
        this.centerY = y0 + (y1 - y0) / 2;
        if(BaseStar.data.inning.outs === 0 && BaseStar.data.inning.playersOnBase.length === 0 && BaseStar.data.inning.strikes === 0) {
            Sounds.PlaySound("playBall", false);
        } else if(BaseStar.data.inning.strikes === 0) {
            if(Math.random() < 0.1) { // comments about the player's team
                SpeakHandler.SpeakRandomTeamComment(BaseStar.data.team1.teamIdx, BaseStar.data.team2.teamIdx);
            } else if(Math.random() < 0.45) { // comments that don't use the player's name
                SpeakHandler.SpeakMiscFiller(10, 13, battingTeam.players[BaseStar.data.inning.atBatPlayerIdx].name);
            } else { // comments that use the player's name
                SpeakHandler.SpeakFromKey(`spk_random${RandRange(0, 26)}`);
            }
        }
    }
    CleanUp() {
        gfx.ClearLayer("background2");
        gfx.ClearLayer("p2background2");
        BaseStar.cpu.ClearPitchBat();
    }
    StrikeOut() {
        if(BaseStar.data.inning.StruckOut()) {
            BaseStar.data.inning.IncrementBatter();
            if(BaseStar.data.inning.IncreaseOutsAndReturnIfSwitch()) {
                BaseStar.TeamSwitchHandler();
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
        if(AnimationHelpers.IsAnimating()) { return; }
        this.animFrame += 0.005;
        if(this.ohWowState > 0) { 
            if(++this.ohWowState > 4) {
                this.ohWowState = 1;
                this.ohWowFrame = this.ohWowFrame === 0 ? 1 : 0;
            }
        }
        if(this.state === 0) {
            if(this.batHandler.ready && this.pitchHandler.ready) {
                this.state = 1;
                this.pitchHandler.ThrowBall();
                this.batHandler.AwaitBall();
            }
        } else if(this.state === 1) {
            if(this.batHandler.swingState === 4) {
                this.state = 2;
                let distance = this.pitchHandler.pitch.GetPercent() - 0.5; // negative is too soon
                const dir = (distance < 0) ? -1 : 1; // too soon is right, too late is left
                distance = Math.abs(distance);
                let offset = 0;
                if(distance <= 0.08) { // perfect shot
                    this.ohWowState = 1;
                    offset = 0;
                } else if(distance <= 0.1) { // close enough
                    offset = 0.25;
                } else if(distance <= 0.15) { // ehh
                    offset = Math.log(100 * distance);
                } else {
                    offset = -1;
                }
                if(offset >= 0) {
                    this.ballData = {
                        pos: this.batHandler.dx, dir: this.batHandler.dir,
                        offset: offset * dir, power: this.batHandler.power
                    };
                    this.pitchHandler.BallHit(2 * this.batHandler.dir + offset * dir, this.batHandler.power, offset);
                    //game.DoOnlineThing("hitBall", false, this.pitchHandler.pitch.ballPos, 2 * this.batHandler.dir + offset * dir, this.batHandler.power, offset, this.ballData);
                } else {
                    this.batHandler.missed = true;
                    //game.DoOnlineThing("hitBall", true);
                }
            }
        } else if(this.state === 2 && this.pitchHandler.throwState === 2) {
            this.state = 3;
            BaseStar.SwitchHandler(FieldRunHandler, [this.ballData, this.pitchHandler.dx, BaseStar.data.constellation]);
        }
    }
    AnimUpdate() {
        const cx = this.centerX, cy = this.centerY, a = this.animFrame;
        const ax = 80 * angleToRadians;
        const Transform = s => {
            const tx = s.x - cx, ty = s.y - cy;
            // Step 1: rotate along Z axis to angle
            let x = tx * Math.cos(a) - ty * Math.sin(a);
            const y1 = ty * Math.cos(a) + tx * Math.sin(a);
            // Step 2: rotate along X axis
            let y = y1 * Math.cos(ax);
            const z = y1 * Math.sin(ax);
            // Step 3: transform
            let scale = 0.5;
            const z2 = (z + 600) / 400;
            y *= z2;
            scale *= z2;
            // Step 4: center on screen
            x += 320; y += 180;
            return { x: x, y: y, scale: scale };
        };

        this.constellation.connections.forEach(c => {
            const s1 = this.constellation.stars[c[0]];
            const s2 = this.constellation.stars[c[1]];
            const p1 = Transform(s1), p2 = Transform(s2);
            gfx.DrawLine(p1.x, p1.y, p2.x, p2.y, "#0000FF88", "interface");
        });
        this.constellation.stars.forEach(star => {
            const p = Transform(star);
            let layer = "interface";
            if(p.x <= 380 || p.y > 240) {
                if(p.scale > 1) { layer = "text"; }
            } else {
                if(p.scale > 0.4) { layer = "text"; }
            }
            gfx.DrawCenteredSprite("sprites", star.power, 0, p.x, p.y, layer, 32, p.scale);
        });

        this.pitchHandler.AnimUpdate();
        this.batHandler.AnimUpdate();
        if(this.ohWowState > 0) {
            gfx.DrawSprite("bigsprites", 4, this.ohWowFrame, this.pitchHandler.pitch.idealX, this.pitchHandler.pitch.idealY - 118, "text", 128, 1);
        }
        if(this.pitchHandler.pitch === null) {
            gfx.WriteEchoPlayerText("0", 35, 373, 300, "text", "#FFFFFF", "#BA66FF", 11, "right");
        } else {
            gfx.WriteEchoPlayerText(this.pitchHandler.pitch.speed, 35, 373, 300, "text", "#FFFFFF", "#BA66FF", 11, "right");
        }
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
        const infoDir = BaseStar.data.team1.isUp ? -1 : 1;
        gfx.WriteOptionText("-", scoreX + infoDir * dx, scoreY + 15, "background2", "#FFADCD", 30);
        gfx.WriteOptionText(this.GetRomanNumeral(BaseStar.data.inning.playersOnBase.length), scoreX + infoDir * 8, scoreY + 8, "background2", "#FFFFFF", 8);
      
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
    GetRomanNumeral(i) {
        if(i >= 20) { return "XX"; } // shouldn't ever actually happen; no constellation has 20+ stars
        let numeral = "";
        if(i >= 10) {
            i -= 10;
            numeral = "X";
        }
        if(i === 9) {
            i -= 9;
            numeral += "IX";
        }
        if(i >= 5) {
            i -= 5;
            numeral += "V";
        }
        switch(i) {
            case 1: numeral += "I"; break;
            case 2: numeral += "II"; break;
            case 3: numeral += "III"; break;
            case 4: numeral += "IV"; break;
        }
        return numeral;
    }
}