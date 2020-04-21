// TODO: make the CPU player not extremely bad at this
class CPUplayer {
    constructor() { }
    /** @type {BatHandler} */ batter = null;
    /** @type {PitchHandler} */ pitcher = null;
    /** @type {RunHandler} */ runner = null;
    /** @type {FieldHandler} */ fielder = null;

    /** @param {FieldPickHandler} fp */
    PickConstellationAndPlaceOutfielders(fp) {
        let counter = 5;
        let wub = setInterval(function() {
            if(fp.state === 0) {
                if(--counter > 0) { return; }
                counter = 10;
                const cs = fp.team.GetConstellations();
                let constsel = Math.floor(Math.random() * 3);
                while(cs[constsel] === "") {
                    constsel = (constsel + 1) % 3;
                }
                fp.constsel = constsel;
                fp.Confirm();
            } else if(fp.state === 1) {
                fp.Confirm();
            } else if(fp.state === 2) {
                if(--counter > 0) { return; }
                clearInterval(wub);
                fp.Confirm();
            }
        }, 300);
    }

    /** @param {BatHandler} bh @param {PitchHandler} ph
     *  @param {boolean} isBatterCPU @param {boolean} isPitcherCPU */
    InitPitchBat(bh, ph, isBatterCPU, isPitcherCPU) {
        this.batter = bh;
        this.pitcher = ph;
        if(isBatterCPU) { this.SetUpSwing(); }
        if(isPitcherCPU) { this.SetUpPitch(); }
    }
    ClearPitchBat() {
        this.batter = null;
        this.pitcher = null;
    }

    /** @param {RunHandler} rh @param {FieldHandler} fh
     *  @param {boolean} isRunnerCPU @param {boolean} isFielderCPU */
    InitFieldRun(rh, fh, isRunnerCPU, isFielderCPU) {
        this.runner = rh;
        this.fielder = fh;
        if(isRunnerCPU) { this.SetUpRun(); }
        if(isFielderCPU) { this.SetUpField(); }
    }
    ClearFieldRun() {
        this.runner = null;
        this.fielder = null;
    }

    // Running
    SetUpRun() { 
        this.someChance = 1;//0.0005;
    }
    HandleRun() {
        if(this.runner.runner.ball !== null) { // runner is on ball
            if(Math.random() < this.someChance) {
                this.runner.Confirm();
                this.someChance = 0.01;
            } else {
                this.someChance += 0.0005;
            }
        } else {
            if(this.runner.runner.atBase) {
                this.runner.Confirm();
            }
        }
    }

    // Fielding
    SetUpField() { }
    HandleField() {
        if(this.fielder.ballFielderIdx < 0) { return; }
        this.fielder.ballFielderIdx = 0;
        this.fielder.targetFielderIdx = 0;
        this.fielder.ThrowBall();
        /*this.fielder.TargetRunnerIncludeHolder();
        if(this.fielder.ballFielderIdx !== this.fielder.targetFielderIdx) {
            this.fielder.ThrowBall();
        } else if(this.fielder.ballFielderIdx === this.fielder.targetFielderIdx && this.fielder.fielders[this.fielder.ballFielderIdx].pitcher) {
            this.fielder.ThrowBall();
        }*/
    }

    // Pitching
    SetUpPitch() {
        this.pitcher.ready = true;
        this.pitcher.dx = -5 + 10 * Math.random();
        this.pitcher.throwStyle = Math.floor(Math.random() * 4);
    }

    // Batting
    SetUpSwing() {
        this.batter.ready = true;
        this.batter.dx = -5 + 10 * Math.random();
        this.batter.dir = 0;
        this.batter.power = 6 + Math.random() * 6;
        this.batter.state = 2;
        this.someChance = 0.0005;
    }
    TrySwing() {
        let doHit = false;
        if(this.pitcher.pitchAnimState < 3) { return; }
        if(this.pitcher.pitch.GetPercent() < 0.2) {
            doHit = Math.random() < 0.1;//0.0001;
        } else {
            doHit = Math.random() < this.someChance;
        }
        if(doHit) {
            this.batter.swingCounter = 0;
            this.batter.state = 4;
            this.batter.swingState = 1;
            return true;
        } else {
            this.someChance += 0.0005 * Math.random();
            return false;
        }
    }
};