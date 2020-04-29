class CPUplayer {
    constructor() { }
    /** @type {BatHandler} */ batter = null;
    /** @type {PitchHandler} */ pitcher = null;
    /** @type {RunHandler} */ runner = null;
    /** @type {FieldHandler} */ fielder = null;

    /** @param {FieldPickHandler} fp @param {boolean} debug */
    PickConstellationAndPlaceOutfielders(fp, debug) {
        let counter = 10;
        if(debug) {
            if(--counter > 0) { return; }
            counter = 10;
            const cs = fp.team.GetConstellations();
            let constsel = Math.floor(Math.random() * 3);
            while(cs[constsel] === "") {
                constsel = (constsel + 1) % 3;
            }
            fp.constsel = constsel;
            fp.Confirm();
            while(fp.state === 1) {
                fp.Confirm();
            }
            fp.Confirm();
            console.log("fuck you");
            return;
        }
        let wub = setInterval(function() {
            if(fp.state === 0) {
                if(--counter > 0) { return; }
                counter = 20;
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
        }, 100);
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

    /** @param {RunHandler} rh @param {FieldHandler} fh @param {boolean} isRunnerCPU @param {boolean} isFielderCPU @param {{ x: any; y: any; }} runnerPos @param {any} linearVelocity */
    InitFieldRun(rh, fh, isRunnerCPU, isFielderCPU, runnerPos, linearVelocity) {
        this.runner = rh;
        this.fielder = fh;

        // this.PredictBallPath(outerGameData.seriesRound * 2.5, outerGameData.seriesRound * 3, runnerPos, linearVelocity);
        if(isRunnerCPU) { this.SetUpRun(); }
        if(isFielderCPU) { this.SetUpField(outerGameData.seriesRound * 2.5, outerGameData.seriesRound * 3, runnerPos, linearVelocity); }
    }
    ClearFieldRun() {
        this.runner = null;
        this.fielder = null;
    }

    // Running
    SetUpRun() { 
        this.someChance = 0.0005;
        this.checkAgainTimer = 10;
        this.didThingCooldown = 0;
    }
    HandleRun() {
        if(this.runner.runner.ball !== null) { // runner is on ball
            if(--this.checkAgainTimer <= 0) { // every few moments, try jumping off when near a star
                this.checkAgainTimer = 10;
                let closestDistance = 9999;
                const myPos = vecp2m({ x: this.runner.runner.x, y: this.runner.runner.y }); // easier than converting all the stars FROM box2d
                const occupiedBases = this.runner.onBaseRunners.map(r => r.baseNumber);
                this.fielder.fullHandler.stars.forEach((star, i) => {
                    if(occupiedBases.indexOf(i) >= 0) { return; }
                    const pos = star.GetWorldCenter();
                    const d = Dist(pos.x, pos.y, myPos.x, myPos.y);
                    if(d < closestDistance) {
                        closestDistance = d;
                    }
                });
                if(closestDistance < 30) {
                    this.runner.Confirm();
                    return;
                } else if(closestDistance < 100) {
                    this.someChance += 0.05;
                }
            } else if(Math.random() < this.someChance) { // otherwise just jump off
                this.runner.Confirm();
                this.someChance = 0.01;
            } else { // or increase the odds
                this.someChance += 0.0005;
            }
        } else {
            const targetFielder = this.fielder.fielders[this.runner.runner.targetStar];
            if(targetFielder.ball !== null) { // target has ball, run somewhere else!
                let closestDistance = 9999;
                const myPos = vecp2m({ x: this.runner.runner.x, y: this.runner.runner.y }); // easier than converting all the stars FROM box2d
                const occupiedBases = this.runner.onBaseRunners.map(r => r.baseNumber);
                this.fielder.fullHandler.stars.forEach((star, i) => {
                    if(occupiedBases.indexOf(i) >= 0 || i === this.runner.runner.targetStar) { return; }
                    const pos = star.GetWorldCenter();
                    const d = Dist(pos.x, pos.y, myPos.x, myPos.y);
                    if(d < closestDistance) {
                        closestDistance = d;
                        this.runner.runner.targetStar = i;
                    }
                });
            }
            if(this.runner.runner.onBase) { // i'm on base!
                this.runner.Confirm();
            } else { // target does not have ball
                if(--this.didThingCooldown > 0) { return; }
                this.didThingCooldown = 10;

                const ballPos = vecm2p(this.runner.ball.GetWorldCenter());
                const targetFielder = this.fielder.fielders[this.runner.runner.targetStar];
                const dBallTarget = Dist(ballPos.x, ballPos.y, targetFielder.x, targetFielder.y);
                const dRunnerTarget = Dist(this.runner.runner.x, this.runner.runner.y, targetFielder.x, targetFielder.y);
                let closestStarIdx = this.runner.runner.targetStar, dRunnerClosestStar = 9999;

                const myPos = vecp2m({ x: this.runner.runner.x, y: this.runner.runner.y }); // easier than converting all the stars FROM box2d
                const occupiedBases = this.runner.onBaseRunners.map(r => r.baseNumber);
                this.fielder.fullHandler.stars.forEach((star, i) => {
                    if(occupiedBases.indexOf(i) >= 0 || i === this.runner.runner.targetStar) { return; }
                    const pos = star.GetWorldCenter();
                    const d = Dist(pos.x, pos.y, myPos.x, myPos.y);
                    if(d < dRunnerClosestStar) {
                        dRunnerClosestStar = d;
                        closestStarIdx = i;
                    }
                });
                const closestStar = this.fielder.fielders[closestStarIdx];
                const dBallClosestStar = Dist(ballPos.x, ballPos.y, closestStar.x, closestStar.y);

                if(dBallClosestStar < dBallTarget) {
                    if(dBallClosestStar > dBallTarget || Math.random() < 0.5) {
                        this.runner.runner.targetStar = closestStarIdx;
                        return; // I'm closer to a star that isn't my target, and the ball isn't (or I'm chancing it)! go for that one!
                    }
                }
            }
        }
    }

    // Fielding
    /** @param {number} accuracy @param {number} foresight @param {{ x: any; y: any; }} runnerPos @param {any} linearVelocity */
    SetUpField(accuracy, foresight, runnerPos, linearVelocity) {
        this.playerSwitcharounds = 0;
        this.SetUpPrediction(accuracy, foresight, runnerPos, linearVelocity);
        this.FindBestFielderInfo(20);
    }
    HandleField() {
        if(this.fielder.ballFielderIdx < 0) {
            this.timeStep += 1;
            if(this.timeStep > this.targetFieldPos.timestep) {
                this.fielder.doubleSpeed = true;
                return;
            } else {
                const goodFieldBoy = this.fielder.fielders[this.targetFieldPos.fielder];
                const f = new b2Vec2(this.targetFieldPos.x, this.targetFieldPos.y);
                const d = Dist(this.targetFieldPos.x, this.targetFieldPos.y, goodFieldBoy.x, goodFieldBoy.y);
                if(d < 10) { return; }
                f.Subtract(new b2Vec2(goodFieldBoy.x, goodFieldBoy.y));
                f.Normalize();
                this.fielder.MoveFielders(f.x, f.y);
            }
        } else {
            /*
            Runner Conditions:
                1   Far from Target Base, but can easily target a much closer Base
                2   Far from all Bases
                3   Very near Target Base
            Infielder Conditions:
                IA  Is Near Target Base
                IB  Is Far From Target Base
                IC  Is Target Base
            Outfielder Conditions:
                OA  Is Near Target Base
                OB  Is Far From Target Base
            Pitcher Conditions:
                PA  Is Near Target Base
                PB  Is Far From Target Base
            Additional Runner Conditions:
                a   Runner is approaching their first target base
                b   Runner has already switched between bases a few times
                c   Runner has already switched between bases a lot
                d   Runner is very near a fielder with Ball (that is not their Target)
            Additional Fielder Conditions:
                x   Base is near pitcher
                y   Base is not near pitcher
            Decisions:
                a   ***d*:  slam dunk
                b   2****:  throw ball to pitcher
                c   *I*cx:  "
                    *O*cx:  "
                d   *P*c-:  slam dunk

                far from target base, target base has ball
                e   1ICa*:  hold onto ball
                f   1ICb*:  throw ball to base closest to runner
                g   1ICcy:  throw ball to base closest to runner

                far from target base, base near target base has ball
                h   1IA**:  throw to target base
                i   1IAcy:  throw ball to base closest to runner

                far from target base, base far from target base has ball
                j   1IB*x:  throw ball to pitcher
                k   1IB*y:  throw ball to base closest to runner

                far from target base, outfielder near target base
                l   1OA**:  throw to ball to target base

                far from target base, outfielder far from target base
                m   1OB**:  throw to ball to pitcher or a base in between outfielder and target base, whichever is closer

                far from target base
                n   1P***:  slam dunk or throw to base closest to runner

                near target base, ball at target base
                o   3IA*a:  hold onto ball, slam dunk if player is in range and changes course, or throw to closest base.
                p   3IA**:  hold onto ball, slam dunk as soon as player gets in range, or throw to closest base.
                
                near target base, ball near target base
                q   3IB**:  throw to target base

                near target base, outfielder has ball
                r   3O**x:  throw to pitcher
                s   3O***:  throw to target base

                near target base, pitcher has ball
                t   3P***:  slam dunk or throw to target base

                in the event none of the above conditions are met, do one of the following:
                u   - throw to target
                    - throw to base close to player
                    - throw to pitcher
                    - if pitcher, slam dunk

                * In any event where throwing from one fielder to another, and the distance between them is high, target a midpoint fielder
            */
            const fielderWithBall = this.fielder.fielders[this.fielder.ballFielderIdx];
            const runnerTargetBaseIdx = this.runner.runner.targetStar;
            const runnerTargetFielder = this.fielder.fielders[runnerTargetBaseIdx];
            const pitcher = this.fielder.pitcher;
            const runner = this.runner.runner;

            const isBase = fielderWithBall.type === "infielder"; // I*, O*
            const isPitcher = fielderWithBall.pitcher; // P*
            const isThisTargetBase = this.runner.runner.targetStar === this.fielder.ballFielderIdx; // IC
            const fielderDistanceToTargetBase = isThisTargetBase ? 0 : Dist(runnerTargetFielder.x, runnerTargetFielder.y, fielderWithBall.x, fielderWithBall.y);
            const isFielderCloseToTargetBase = fielderDistanceToTargetBase < 250; // *A, *B

            const runnerDistanceToTargetBase = Dist(runner.x, runner.y, runnerTargetFielder.x, runnerTargetFielder.y);
            const isRunnerCloseToTargetBase = runnerDistanceToTargetBase < 50; // 3

            const runnerDistanceToFielderWithBall = Dist(runner.x, runner.y, fielderWithBall.x, fielderWithBall.y);
            const isRunnerCloseToBall = runnerDistanceToFielderWithBall < 60; // d

            const fielderDistanceToPitcher = isPitcher ? 0 : Dist(fielderWithBall.x, fielderWithBall.y, pitcher.x, pitcher.y);
            const isFielderCloseToPitcher = fielderDistanceToPitcher < 100; // x, y

            const isRunnerInnocent = (this.playerSwitcharounds === 0); // a
            const isRunnerBastard = (this.playerSwitcharounds >= 2); // c

            let closestBaseToRunner = 0, runnerDistanceToClosestBase = 9999;
            this.fielder.fielders.forEach((f, i) => {
                if(i === this.fielder.ballFielderIdx || i === this.runner.runner.targetStar) { return; } // don't re-check already known values
                const d = Dist(runner.x, runner.y, f.x, f.y);
                if(d < runnerDistanceToClosestBase) {
                    runnerDistanceToClosestBase = d;
                    closestBaseToRunner = i;
                }
            });
            const isRunnerCloseToAnotherBase = runnerDistanceToClosestBase < runnerDistanceToTargetBase; // 1
            const isRunnerFarFromAllBases = runnerDistanceToClosestBase >= 150; // 2

            if(isRunnerCloseToBall && !isThisTargetBase) { // {a}
                if((!this.fielder.dunked && !isPitcher) || (!this.fielder.pitcherdunked && isPitcher)) {
                    return this.DoASlamDunk();
                }
            }
            if(isRunnerFarFromAllBases) { // {b}
                if(isPitcher) {
                    if(this.fielder.pitcherdunked) { // {u}
                        return this.DoSomethingWackyAndRandom(this.fielder.ballFielderIdx, runnerTargetBaseIdx, closestBaseToRunner, pitcher);
                    } else {
                        return this.DoASlamDunk();
                    }
                } else {
                    return this.ThrowToPitcher(pitcher);
                }
            }
            if(isRunnerBastard) {
                if(isPitcher) { // {d}
                    if(this.fielder.pitcherdunked) { // {u}
                    return this.DoSomethingWackyAndRandom(this.fielder.ballFielderIdx, runnerTargetBaseIdx, closestBaseToRunner, pitcher);
                    } else {
                        return this.DoASlamDunk();
                    }
                } else { // {c}
                    return this.ThrowToPitcher(pitcher);
                }
            }

            if(isRunnerCloseToTargetBase) {
                if(isThisTargetBase) {
                    if(isRunnerInnocent) { // {o}
                        return this.IntentionallyDoNothing();
                    } else { // {p}
                        if(this.fielder.dunked) {
                            return this.IntentionallyDoNothing();
                        } else {
                            return this.DoASlamDunk();                            
                        }
                    }
                } else if(isFielderCloseToTargetBase) { // {q}
                    return this.ThrowToTargetBase(runnerTargetBaseIdx);
                } else if(!isBase) {
                    if(isFielderCloseToPitcher) { // {r}
                        return this.ThrowToPitcher(pitcher);
                    } else { // {s}
                        return this.ThrowToTargetBase(runnerTargetBaseIdx);
                    }
                } else if(isPitcher) { // {t}
                    if(this.fielder.pitcherdunked) {
                        return this.ThrowToTargetBase(runnerTargetBaseIdx);
                    } else {
                        return this.DoASlamDunk();
                    }
                }
            } else if(isRunnerCloseToAnotherBase) {
                if(isBase) {
                    if(isThisTargetBase) {
                        if(isRunnerInnocent) { // {e}
                            return this.IntentionallyDoNothing();
                        } else { // {f} {g}
                            return this.ThrowToBaseClosestToRunner(closestBaseToRunner);
                        }
                    } else if(isFielderCloseToTargetBase) {
                        if(isRunnerBastard) { // {i}
                            return this.ThrowToBaseClosestToRunner(closestBaseToRunner);
                        } else { // {h}
                            return this.ThrowToTargetBase(runnerTargetBaseIdx);
                        }
                    } else if(isBase) {
                        if(isFielderCloseToPitcher) { // {j}
                            return this.ThrowToPitcher(pitcher);
                        } else { // {k}
                            return this.ThrowToBaseClosestToRunner(closestBaseToRunner);
                        }
                    }
                } else if(isPitcher) { // {n}
                    if(this.fielder.pitcherdunked) {
                        return this.ThrowToBaseClosestToRunner(closestBaseToRunner);
                    } else {
                        return this.DoASlamDunk();
                    }
                } else {
                    if(isFielderCloseToTargetBase) { // {l}
                        return this.ThrowToTargetBase(runnerTargetBaseIdx);
                    } else { // {m}
                        if(fielderDistanceToPitcher < fielderDistanceToTargetBase) {
                            return this.ThrowToPitcher(pitcher);
                        } else {
                            return this.ThrowToTargetBase(runnerTargetBaseIdx);
                        }
                    }
                }
            }
            console.log("maybe worry if you're seeing this a lot!");
            return this.DoSomethingWackyAndRandom(this.fielder.ballFielderIdx, runnerTargetBaseIdx, closestBaseToRunner, pitcher); // {u}
        }
    }
    /** @param {number} myIdx @param {number} targetIdx @param {number} closePlayerIdx @param {Pitcher} pitcher */
    DoSomethingWackyAndRandom(myIdx, targetIdx, closePlayerIdx, pitcher) {
        const r = Math.random();
        if(r < 0.33) {
            if(myIdx !== targetIdx) {
                return this.ThrowToTargetBase(targetIdx);
            }
        } else if(r < 0.66) {
            if(myIdx !== closePlayerIdx) {
                return this.ThrowToBaseClosestToRunner(closePlayerIdx);
            }
        } else {
            if(this.fielder.fielders[myIdx].pitcher) {
                if(!this.fielder.pitcherdunked) {
                    return this.fielder.ThrowBall();
                }
            } else {
                return this.ThrowToPitcher(pitcher);
            }
        }
        console.log("this shouldn't happen often!");
        this.fielder.targetFielderIdx = RandRange(0, this.fielder.fielders.length);
        this.fielder.ThrowBall();
    }
    DoASlamDunk() {
        this.fielder.targetFielderIdx = this.fielder.ballFielderIdx;
        this.fielder.ThrowBall();
    }
    /** @param {Pitcher} pitcher */
    ThrowToPitcher(pitcher) {
        const pitcherIdx = this.fielder.fielders.findIndex(e => e === pitcher);
        if(pitcherIdx < 0) { // this shouldn't happen!
            console.log("this shouldn't happen!");
            this.fielder.targetFielderIdx = RandRange(0, this.fielder.fielders.length);
        } else {
            this.fielder.targetFielderIdx = pitcherIdx;
        }
        this.fielder.ThrowBall();
    }
    /** @param {number} targetBase */
    ThrowToTargetBase(targetBase) {
        this.fielder.targetFielderIdx = targetBase;
        this.fielder.ThrowBall();
    }
    /** @param {number} closestBase */
    ThrowToBaseClosestToRunner(closestBase) {
        this.fielder.targetFielderIdx = closestBase;
        this.fielder.ThrowBall();
    }
    IntentionallyDoNothing() { }


    /** @param {number} accuracy @param {number} foresight @param {{ x: any; y: any; }} runnerPos @param {any} linearVelocity */
    SetUpPrediction(accuracy, foresight, runnerPos, linearVelocity) {
        this.fakeWorld = new b2World(new b2Vec2(0, 0), true);
        this.fakeHelper = new b2Helpers(this.fakeWorld);
        this.fakeBall = this.fakeHelper.GetBaseball(runnerPos, linearVelocity, undefined, true);
        
        const scale = BaseStar.fullMult;
        const bounds = BaseStar.fieldBounds;
        const boundx = bounds.x * scale, boundy = bounds.y * scale;
        const boundw = bounds.w * scale, boundh = bounds.h * scale;
        this.fakeHelper.GetBarrier(boundx, boundy - 20, boundw, 20);
        this.fakeHelper.GetBarrier(boundx, boundy + boundh, boundw, 20);
        this.fakeHelper.GetBarrier(boundx - 20, boundy, 20, boundh);
        this.fakeHelper.GetBarrier(boundx + boundw, boundy, 20, boundh);

        const clampedAccuracy = Clamp(accuracy, 0, 10);
        const stepSizeTop = (50 + clampedAccuracy) * SpeedMult();
        this.stepSize = 1 / stepSizeTop;
        this.foresight = Clamp(foresight, 3, 13);
        const stepsToTake = this.foresight * 80;

        this.fakeGravMult = this.fielder.fullHandler.gravMult;
        this.ballPredictions = [ vecm2p(this.fakeBall.GetWorldCenter()) ];
        this.PredictBallPath(this.stepSize, stepsToTake);
    }
    ResetPrediction() {
        const ballPos = this.fielder.fullHandler.ball.GetWorldCenter();
        const linearVelocity = this.fielder.fullHandler.ball.GetLinearVelocity();
        this.fakeWorld.DestroyBody(this.fakeBall);
        this.fakeBall = this.fakeHelper.GetBaseball(ballPos, linearVelocity, undefined, true);

        this.fakeGravMult = this.fielder.fullHandler.gravMult;
        this.ballPredictions = [ vecm2p(ballPos) ];
        this.PredictBallPath(this.stepSize, this.foresight * 160);
    }
    /**
     * @param {number} stepSize
     * @param {number} stepsToTake
     */
    PredictBallPath(stepSize, stepsToTake) {
        for(let i = 0; i < stepsToTake; i++) {
            this.fakeWorld.Step(stepSize, 10, 10);
            this.fakeWorld.ClearForces();
            this.fakeGravMult *= 1 + (0.001 * SpeedMult());
            if(this.fakeGravMult > 13) { this.fakeGravMult = 13; }
            this.fielder.fullHandler.ApplyBallGravityForces(this.fakeBall, this.fakeGravMult);
            this.ballPredictions.push(vecm2p(this.fakeBall.GetWorldCenter()));
        }
    }
    /** @param {number} start, @param {number} [distMultWeight] */
    FindBestFielderInfo(start, distMultWeight) {
        distMultWeight = distMultWeight || 1;
        const probablyGoodPlacesToGo = [];
        this.timeStep = 0;
        for(let i = start; i < this.ballPredictions.length; i += 5) {
            const prediction = this.ballPredictions[i];
            let closestPlayerToThisPrediction = -1, closestDistance = 9999;
            for(let j = 0; j < this.fielder.fielders.length; j++) {
                const f = this.fielder.fielders[j];
                if(f.type === "infielder") { continue; }
                const dist = Dist(f.x, f.y, prediction.x, prediction.y);
                if(dist < closestDistance) {
                    closestPlayerToThisPrediction = j;
                    closestDistance = dist;
                }
            }
            const distanceMultiplier = (i > 200 ? 0.5 : (distMultWeight * (2 * (1 + (200 - i) / 200))));
            probablyGoodPlacesToGo.push({
                x: prediction.x, y: prediction.y, 
                fielder: closestPlayerToThisPrediction,
                distance: closestDistance,
                weightedDistance: closestDistance * distanceMultiplier,
                timestep: i
            });
        }
        probablyGoodPlacesToGo.sort((a, b) => a.weightedDistance - b.weightedDistance);
        this.targetFieldPos = probablyGoodPlacesToGo[Math.floor(Math.random() * Math.min(3, probablyGoodPlacesToGo.length))];
        //console.log(`it is likely that fielder ${this.targetFieldPos.fielder} can catch the ball at around timestep ${this.targetFieldPos.timestep}`);
    }



    // Pitching
    PlayerFailures = [0, 0, 0, 0];
    SetUpPitch() {
        this.pitcher.ready = true;
        this.pitcher.dx = -5 + 10 * Math.random();
        if(Math.random() <= 0.33) { // try being mean
            let mostFailures = Math.floor(Math.random() * 4), failCount = 0;
            for(let i = 0; i < 4; i++) {
                if(this.PlayerFailures[i] > failCount) {
                    failCount = this.PlayerFailures[i];
                    mostFailures = i;
                }
            }
            this.pitcher.throwStyle = mostFailures;
        } else if(Math.random() < 0.15 && outerGameData.seriesRound < 2) { // ever-so-slightly prefer easy balls early on
            this.pitcher.throwStyle = 1;
        } else { // otherwise go oppan random style
            this.pitcher.throwStyle = Math.floor(Math.random() * 4);
        }
    }

    // Batting
    SetUpSwing() {
        this.batter.ready = true;
        this.batter.dx = 0;
        this.batter.dir = -10 + 20 * Math.random();
        this.batter.power = 2 + Math.random() * 10;
        this.batter.state = 2;
        this.someChance = 0.0002;
    }
    TrySwing() {
        let doHit = false;
        if(this.pitcher.pitchAnimState < 3) { return; }
        const pitchPercent = this.pitcher.pitch.GetPercent();
        if(pitchPercent <= 0.1) {
            doHit = false;
        } else if(pitchPercent < 0.15) {
            doHit = Math.random() < 0.01;
        } else if(pitchPercent > 0.4) {
            doHit = Math.random() < 0.3;
        } else {
            doHit = Math.random() < this.someChance;
        }
        if(doHit) {
            this.batter.swingCounter = 0;
            this.batter.state = 4;
            this.batter.swingState = 1;
            return true;
        } else {
            this.someChance += 0.0004 * Math.random();
            return false;
        }
    }
};