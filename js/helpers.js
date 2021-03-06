const fpsAnim = 1000 / 60, fpsUpdate = 80;
const b2Framerate = 1 / 60;
const RandRange = (a, b) => (a + Math.floor((b - a) * Math.random()));
const RandFloat = (a, b) => a + (b - a) * Math.random();
const Either = (a, b, condition1, condition2) => (a === condition1 && b === condition2) || (a === condition2 && b === condition1);
const PMult = (p, m) => ({ x: p.x * m, y: p.y * m });
const PAdd = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
const PSub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
const InRect = (x, y, rx1, rx2, ry1, ry2) => (x >= rx1 && x <= rx2 && y >= ry1 && y <= ry2);
const Clamp = (n, min, max) => Math.min(Math.max(min, n), max);
const AnimationHelpers = {
	animIdx: 0, animData: {}, 
	IsAnimating: () => AnimationHelpers.animIdx > 0,
	StartScrollText: function(text, callback) {
		if(this.animIdx > 0) { return; }
		SpeakHandler.Speak(text, "Zenn", true);
		const len = gfx.WriteBorderedText(text, 0, 1000, "specialanim", "#FFFFFF", "#FFFFFF", 196, 5);
		this.animData = { 
			text: text, callback: callback,
			x: 640 + len / 2, y: 300, 
			length: len, endX: (-len / 2) };
		this.animIdx = setInterval(this.AnimateScrollText, fpsAnim);
	},
	AnimateScrollText: function() {
		const data = AnimationHelpers.animData;
		if(data === null) { return; }
		data.x -= 20; // 10
		gfx.ClearLayer("specialanim");
		if(data.x <= data.endX) {
			clearInterval(AnimationHelpers.animIdx);
			AnimationHelpers.animIdx = 0;
			AnimationHelpers.animData = null;
			data.callback();
		} else {
			gfx.WriteBorderedText(data.text, data.x, data.y, "specialanim", "#FFFFFF", "#FF0000", 196, 5);
		}
	}
};