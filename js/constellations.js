function CStar(x, y, power) {
    this.x = x;
    this.y = y;
    this.power = power;
}
const constellations = {
    "Aries": {
        offset: { x: 30, y: 100 }, 
        scale: { x: 1.2, y: 1.4 }, 
        stars: [
            new CStar(8, 163, 4),
            new CStar(134, 6, 3),
            new CStar(345, 84, 5),
            new CStar(410, 136, 3),
            new CStar(420, 170, 2)
        ]
    }
};
/*this.stars = [
    this.helper.GetStar(20, 12),
    this.helper.GetStar(73, 71),
    this.helper.GetStar(143, 119),
    this.helper.GetStar(294, 123),
    this.helper.GetStar(457, 137),
    this.helper.GetStar(566, 161),
    this.helper.GetStar(421, 210),
    this.helper.GetStar(273, 221),
    this.helper.GetStar(156, 212),
    this.helper.GetStar(60, 330),
    this.helper.GetStar(212, 380),
    this.helper.GetStar(224, 350),
    this.helper.GetStar(467, 332),
    this.helper.GetStar(550, 370),
    this.helper.GetStar(530, 409)
];*/
        /*this.canvas = document.getElementById("canvas");
        this.canvas.addEventListener("mouseup", function(e) {
            console.log(getMousePos(e, this));
        });*/