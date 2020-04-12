const fps = 1000 / 60;
const AnimationHelpers = {
	animIdx: 0, animData: {}, 
	IsAnimating: () => AnimationHelpers.animIdx > 0,
	StartScrollText: function(text, callback) {
		const len = gfx.WriteBorderedText(text, 0, 1000, "specialanim", "#FFFFFF", "#FFFFFF", 196, 5);
		this.animData = { 
			text: text, callback: callback,
			x: 640 + len / 2, y: 300, 
			length: len, endX: (-len / 2) };
		this.animIdx = setInterval(this.AnimateScrollText, fps);
	},
	AnimateScrollText: function() {
		const data = AnimationHelpers.animData;
		data.x -= 20; // 10
		gfx.ClearLayer("specialanim");
		if(data.x <= data.endX) {
			clearInterval(AnimationHelpers.animIdx);
			AnimationHelpers.animIdx = 0;
			data.callback();
		} else {
			gfx.WriteBorderedText(data.text, data.x, data.y, "specialanim", "#FFFFFF", "#FF0000", 196, 5);
		}
	}
};

// TO DEPRECATE:
function getMousePos(event, src_elem) {
	let totalOffsetX = 0, totalOffsetY = 0;
	let x_pos = 0, y_pos = 0;
	let currElement = src_elem;

	if (event.offsetX !== undefined && event.offsetY !== undefined) { // IE, Chrome
		x_pos = event.offsetX;
		y_pos = event.offsetY;
	} else { // FireFox
		do {
			totalOffsetX += currElement.offsetLeft - currElement.scrollLeft;
			totalOffsetY += currElement.offsetTop - currElement.scrollTop;
		} while(currElement = currElement.offsetParent);
		x_pos = event.pageX - totalOffsetX - document.body.scrollLeft; 
		y_pos = event.pageY - totalOffsetY - document.body.scrollTop;
	}
	return new b2Vec2(x_pos, y_pos);
}