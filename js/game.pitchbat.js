BaseStar.ThePitch = {
    state: 0, // 0 = waiting on both players, 1 = ball is being pitched or hit
    batHandler: null, pitchHandler: null, freeMovement: true, 
    p1IsBatter: false, 
    ballData: {}, 
    Init: function(p1Handler, p2Handler) {
        this.p1IsBatter = p1Handler === BaseStar.Batting;
        this.batHandler = this.p1IsBatter ? p1Handler : p2Handler;
        this.pitchHandler = !this.p1IsBatter ? p1Handler : p2Handler;
        this.state = 0;
        this.batHandler.Init(this.p1IsBatter ? controls : controls2, this.p1IsBatter ? BaseStar.p1Team : BaseStar.p2Team);
        this.pitchHandler.Init(!this.p1IsBatter ? controls : controls2, !this.p1IsBatter ? BaseStar.p1Team : BaseStar.p2Team);
    },
    KeyPress: function(key) {
        this.batHandler.KeyPress(key);
        this.pitchHandler.KeyPress(key);
    },
    Update: function() {
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
            const p1Handler = this.p1IsBatter ? BaseStar.Running : BaseStar.Fielding;
            const p2Handler = !this.p1IsBatter ? BaseStar.Running : BaseStar.Fielding;
            this.parentHandler.SwitchTo(BaseStar.SpaceFly, p1Handler, p2Handler, false, this.ballData, "Aries");
        }
    },
    AnimUpdate: function() {
        this.pitchHandler.AnimUpdate();
        this.batHandler.AnimUpdate();
    }
};