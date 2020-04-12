class AtBatHandler extends Handler {
    state = 0; // 0 = waiting on both players, 1 = ball is being pitched or hit
    ballData = {};
    constructor() {
        super();
        this.freeMovement = true;
        const p1IsBatter = BaseStar.data.team1.isUp;
        const battingTeam = p1IsBatter ? BaseStar.data.team1 : BaseStar.data.team2;
        const pitchingTeam = p1IsBatter ? BaseStar.data.team2 : BaseStar.data.team1;
        this.batHandler = new BatHandler(battingTeam);
        this.pitchHandler = new PitchHandler(pitchingTeam);
        BaseStar.cpu.InitPitchBat(this.batHandler, this.pitchHandler, !battingTeam.isPlayerControlled, !pitchingTeam.isPlayerControlled);
    }
    CleanUp() {
        BaseStar.cpu.ClearPitchBat();
    }
    KeyPress(key) {
        this.batHandler.KeyPress(key);
        this.pitchHandler.KeyPress(key);
    }
    Update() {
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
}