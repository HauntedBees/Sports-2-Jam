const BaseStar = {
    fast: true, subhandler: null, freeMovement: true, 
    p1Team: "Fuckers", p2Team: "Shitters",
    Init: function() {
        gfx.DrawMapCharacter(0, 0, { x: 0, y: 0 }, "background2", 640, 480, "background", 0, 0);
        this.SwitchTo(BaseStar.ThePitch, BaseStar.Batting, BaseStar.Pitching);
        gfx.CreateTeamSheet("Fuckers", "#FF000066");
        gfx.CreateTeamSheet("Shitters", "#0000FF66");
    },
    KeyPress: function(key) { this.subhandler.KeyPress(key); },
    Update: function() { this.subhandler.Update(); },
    AnimUpdate: function() {
        gfx.ClearSome(["interface", "overlay"]);
        this.subhandler.AnimUpdate();
    },
    SwitchTo: function(newSubhandler, ...args) {
        // TODO: cleanup
        this.subhandler = newSubhandler;
        this.subhandler.Init(...args);
        this.freeMovement = this.subhandler.freeMovement || false;
        this.freeMovement2 = this.subhandler.freeMovement2 || false;
        this.subhandler.parentHandler = this;
    }
};