function Draw() {
    gfx.ClearLayer("canvastop");
}
function myInit() {
    gfx.LoadSpriteSheets("img", ["sprites", "title"], function() {
        setInterval(Draw, 10);
    });
}