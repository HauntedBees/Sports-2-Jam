const gfx = {
    /** @type {{[key:string] : HTMLCanvasElement }} */ canvas: {}, 
    /** @type {{[key:string] : CanvasRenderingContext2D }} */ ctx: {}, 
    pi2: Math.PI * 2, 
    canvasWidth: 960, canvasHeight: 760,
    tileWidth: 960, tileHeight: 720, 
    spritesheets: [], teamSheets: [], 

    LoadSpriteSheets: /** @param {string} source @param {string[]} paths @param {() => void} callback */
    function(source, paths, callback) {
        let count = 0;
        paths.forEach(function(path) {
            const f = function(path, len) {
                const img = new Image();
                img.onload = function() {
                    gfx.spritesheets[path] = this;
                    count += 1;
                    if(count === len) { callback(); }
                };
                img.src = `${source}/${path}.png`;
            };
            f(path, paths.length);
        });
    },
    ClearLayer: /**@param {string} key */ key => gfx.ctx[key].clearRect(0, 0, gfx.canvasWidth, gfx.canvasWidth),
    ClearSome: /**@param {string[]} keys */ keys => keys.forEach(e => gfx.ClearLayer(e)),
    ClearAll: function() {
        for(const key in gfx.ctx) {
            gfx.ClearLayer(key);
        }
    },

    CreateTeamSheet: /**
     * @param {string} team @param {string} tint */
    function(team, tint) {
        const sheet = gfx.spritesheets["baseballers"];
        const canvas = document.createElement("canvas");
        canvas.width = sheet.width;
        canvas.height = sheet.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(sheet, 0, 0, sheet.width, sheet.height);
        ctx.globalCompositeOperation = "source-atop";
        ctx.fillStyle = tint;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        gfx.teamSheets[team] = canvas;
    },

    TintSheet: /**
     * @param {string} sheetName @param {string} tint */
    function(sheetName, tint) {
        const sheet = gfx.spritesheets[sheetName];
        const canvas = document.createElement("canvas");
        canvas.width = sheet.width;
        canvas.height = sheet.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(sheet, 0, 0, sheet.width, sheet.height);
        ctx.globalCompositeOperation = "source-atop";
        ctx.fillStyle = tint;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        gfx.spritesheets[sheetName + "tint"] = canvas;
    },

    FlipSheet:
    /** @param {string} sheetName */
    function(sheetName) {
        const newname = sheetName + "flip";
        if(gfx.spritesheets[newname] !== undefined) { return; }
        const sheet = gfx.spritesheets[sheetName];
        const canvas = document.createElement("canvas");
        canvas.width = sheet.width;
        canvas.height = sheet.height;
        const ctx = canvas.getContext("2d");
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(sheet, 0, 0, sheet.width, sheet.height);
        gfx.spritesheets[newname] = canvas;
    },

    DrawLine: /**
     * @param {number} x1 @param {number} y1
     * @param {number} x2 @param {number} y2
     * @param {string} color @param {any} layer
     * @param {number} [cx] @param {number} [cy]
     * @param {number} [lineWidth] */
    function(x1, y1, x2, y2, color, layer, cx, cy, lineWidth) {
        const ctx = gfx.ctx[layer];
        ctx.strokeStyle = color || "#DDDDDDFF";
        ctx.lineWidth = lineWidth || 3;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        if(cx !== undefined) {
            ctx.quadraticCurveTo(cx, cy, x2, y2);
        } else {
            ctx.lineTo(x2, y2);
        }
        ctx.stroke();
    },

    DrawEarth: function(layer, x, y, dx, scale) {
        const ctx = gfx.ctx[layer];
        dx *= scale;
        gfx.DrawSpriteToCameras("UI", "worldcover", 0, 1, x, y, layer, 200, scale, true);
        ctx.globalCompositeOperation = "source-in";
        gfx.DrawSpriteToCameras("UI", "worldmap", 0, 0, x - (dx % (225 * scale)), y, layer, 450, scale, true);
        ctx.globalCompositeOperation = "source-over";
        gfx.DrawSpriteToCameras("UI", "worldcover", 0, 0, x, y, layer, 200, scale, true);
    },

    DrawHUDRectToCameras: /**
    * @param {number} x @param {number} y
    * @param {number} w @param {number} h
    * @param {string} borderColor @param {string} color
    * @param {string} layer */
    function(x, y, w, h, borderColor, color, layer) {
        BaseStar.cameras.forEach(camera => {
            const ctx = gfx.ctx[camera.prefix + (camera.forcedLayer || layer)];
            ctx.strokeStyle = borderColor;
            ctx.fillStyle = color;
            ctx.lineWidth = 2;
            ctx.fillRect(x, y, w, h);
            ctx.strokeRect(x, y, w, h);
        });
    },

    DrawLineToCameras: /**
    * @param {number} x1 @param {number} y1
    * @param {number} x2 @param {number} y2
    * @param {string} color @param {string} layer
    * @param {number} [cx] @param {number} [cy] */
    function(x1, y1, x2, y2, color, layer, cx, cy) {
        BaseStar.cameras.forEach(camera => {
            const ctx = gfx.ctx[camera.prefix + (camera.forcedLayer || layer)];
            ctx.strokeStyle = color || "#DDDDDDFF";
            ctx.lineWidth = 3;
            const p1 = camera.GetPos({ x: x1, y: y1 }, "line");
            const p2 = camera.GetPos({ x: x2, y: y2 }, "line");
            if(p1.ignore && p2.ignore) { return; }
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            if(cx !== undefined) {
                const pc = camera.GetPos({ x: cx, y: cy }, "line");
                ctx.quadraticCurveTo(pc.x, pc.y, p2.x, p2.y);
            } else {
                ctx.lineTo(p2.x, p2.y);
            }
            ctx.stroke();
        });
   },
    DrawSpriteToCameras: /**
     * @param {string} type
     * @param {string} sheetpath
     * @param {number} sx @param {number} sy
     * @param {number} x @param {number} y
     * @param {string} layer @param {number} [size] @param {number} [scale] @param {boolean} [force] */
    function(type, sheetpath, sx, sy, x, y, layer, size, scale, force) {
        BaseStar.cameras.forEach(camera => {
            const point = camera.GetPos({ x: x, y: y }, type);
            if(point.ignore && !force) { return; }
            gfx.DrawSprite(sheetpath, sx, sy, point.x, point.y, camera.prefix + (camera.forcedLayer || layer), size || 32, (scale || 1) * camera.zoom);
        });
    },
    DrawCenteredSpriteToCameras: /**
    * @param {string} type
    * @param {string} sheetpath
    * @param {number} sx @param {number} sy
    * @param {number} x @param {number} y
    * @param {string} layer @param {number} size @param {number} [scale] */
    function(type, sheetpath, sx, sy, x, y, layer, size, scale) {
        BaseStar.cameras.forEach(camera => {
            const point = camera.GetPos({ x: x, y: y }, type);
            if(point.ignore) { return; }
            gfx.DrawCenteredSprite(sheetpath, sx, sy, point.x, point.y, camera.prefix + (camera.forcedLayer || layer), size, (scale || 1) * camera.zoom);
        });
    },


    DrawCenteredSprite: /**
     * @param {string} sheetpath
     * @param {number} sx @param {number} sy
     * @param {number} x @param {number} y
     * @param {string} layer @param {number} size @param {number} [scale] */
    function(sheetpath, sx, sy, x, y, layer, size, scale) {
        scale = scale || 1;
        const delta = (size / 2) * scale;
        gfx.DrawSprite(sheetpath, sx, sy, x - delta, y - delta, layer, size, scale);
    },

    DrawSpriteFromPoint: /**
     * @param {string} sheetpath
     * @param {number[]} spoint
     * @param {number} x @param {number} y
     * @param {string} layer */
    function(sheetpath, spoint, x, y, layer) { gfx.DrawSprite(sheetpath, spoint[0], spoint[1], x, y, layer); },

    DrawSprite: /**
     * @param {string} sheetpath
     * @param {number} sx @param {number} sy
     * @param {number} x @param {number} y
     * @param {string} layer @param {number} [size] @param {number} [scale] */
    function(sheetpath, sx, sy, x, y, layer, size, scale) {
        scale = scale || 1;
        size = size || 32;
        const sheet = gfx.teamSheets[sheetpath] !== undefined ? gfx.teamSheets[sheetpath] : gfx.spritesheets[sheetpath];
        const startX = sx * size;
        const startY = sy * size;
        gfx.DrawImage(gfx.ctx[layer], sheet, startX, startY, size, size, x, y, size * scale, size * scale);
    },

    DrawMapCharacter: /**
     * @param {number} x @param {number} y
     * @param {{ x: number; y: number; }} offset
     * @param {string} sheet
     * @param {number} w @param {number} h
     * @param {string} layer
     * @param {number} sx @param {number} sy */
    function(x, y, offset, sheet, w, h, layer, sx, sy) {
        layer = layer || "characters"; sx = sx || 0; sy = sy || 0;
        gfx.DrawImage(gfx.ctx[layer], gfx.spritesheets[sheet], sx * w, sy * h, w, h, (x - offset.x), (y - offset.y), w, h);
    },

    DrawImage: /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {any} image
     * @param {any} srcX @param {any} srcY
     * @param {any} srcW @param {any} srcH
     * @param {any} dstX @param {any} dstY
     * @param {any} dstW @param {any} dstH */
    function(ctx, image, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH) {
        ctx.drawImage(image, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH);  
    },


    WriteEchoPlayerText: /**
    * @param {string} t @param {number} x @param {number} y @param {number} maxLen @param {string} layer 
    * @param {string} topColor @param {string} bottomColor @param {number} size @param {CanvasTextAlign} alignment */
   function(t, x, y, maxLen, layer, topColor, bottomColor, size, alignment) {
        const ctx = gfx.ctx[layer];
        ctx.font = size + "px Retro";
        let name = t;
        while(ctx.measureText(name).width > maxLen) {
            name = name.substring(0, name.length - 4) + "...";
        }
       gfx.WritePlayerTextInner(name, x + 1, y + 1, layer, bottomColor, size, alignment);
       gfx.WritePlayerTextInner(name, x, y, layer, topColor, size, alignment);
   },

   WritePlayerTextInner: /**
    * @param {string} t @param {number} x @param {number} y @param {string} layer 
    * @param {string} color @param {number} size @param {CanvasTextAlign} alignment */
   function(t, x, y, layer, color, size, alignment) {
       const ctx = gfx.ctx[layer];
       ctx.fillStyle = color;
       ctx.font = size + "px Retro";
       ctx.textAlign = alignment;
       ctx.fillText(t, x, y);
       return ctx.measureText(t).width;
   },

    WriteEchoOptionText: /**
     * @param {string} t @param {number} x @param {number} y
     * @param {string} layer @param {string} topColor @param {string} bottomColor @param {number} size */
    function(t, x, y, layer, topColor, bottomColor, size) {
        gfx.WriteOptionText(t, x + 1, y + 1, layer, bottomColor, size);
        gfx.WriteOptionText(t, x, y, layer, topColor, size);
    },

    WriteOptionText: /**
     * @param {string} t @param {number} x @param {number} y
     * @param {string} layer @param {string} color @param {number} size */
    function(t, x, y, layer, color, size) {
        const ctx = gfx.ctx[layer];
        ctx.fillStyle = color;
        size = size || 12;
        ctx.font = size + "px Retro";
        ctx.textAlign = "center";
        ctx.fillText(t, x, y);
        return ctx.measureText(t).width;
    },

    WriteBorderedText: /**
     * @param {string} t
     * @param {number} x @param {number} y
     * @param {string} layer
     * @param {string} color @param {string} borderColor
     * @param {number} size @param {number} lineWidth */
    function(t, x, y, layer, color, borderColor, size, lineWidth) {
        const ctx = gfx.ctx[layer];
        ctx.fillStyle = color || "#FFFFFF";
        ctx.strokeStyle = borderColor || "#0000FF";
        ctx.lineWidth = lineWidth || 2;
        size = size || 12;
        ctx.font = size + "px Retro";
        ctx.textAlign = "center";
        ctx.strokeText(t, x, y);
        ctx.fillText(t, x, y);
        return ctx.measureText(t).width;
    },

    // ****************
    // ****************
    // ****************
    // ****************
    // ****************
    // ****************
    // ****************
    // ****************
    // ****************
    // ****************
    // ****************
    // likely unused below here
    // ****************
    // ****************
    // ****************
    // ****************
    // ****************
    // ****************
    // ****************
    // ****************
    // ****************
    // ****************
    /*
    DrawStar: function(x, y, radius) {
        const layer = gfx.ctx["background"];
        layer.beginPath();
        layer.rect(x, y, radius * 1.5, radius * 1.5);
        layer.fill();
    },
    DrawHUDRect: function(x, y, w, h, fillColor) {
        const bg = gfx.ctx["HUD"];
        bg.fillStyle = fillColor || "#FFFFFF";
        bg.fillRect(x, y, w, h);
        bg.stroke();
    },
    DrawLaser: function(laser) {
        const layer = gfx.ctx["characters"];
        layer.strokeStyle ="#00FF00";
        layer.lineWidth = 3;
        layer.beginPath();
        layer.moveTo(laser.sx, laser.sy);
        layer.lineTo(laser.dx, laser.dy);
        layer.stroke();
    },
    GetFont: () => "PressStart2P",
    GetFontSize: function(size, justNum) {
        size = size || 22;
        return justNum === true ? size : size + "px ";
    },
    DrawSpaceText: function(textInfo) {
        const bottom = Math.ceil(gfx.DrawWrappedText(textInfo.text, 160, 30, 770, "#2B87FF", 144));
        const noOffset = { x: 0, y: 0 };
        gfx.DrawMapCharacter(0, bottom, noOffset, "spacebottom", 960, 6, "menu");
        gfx.DrawMapCharacter(0, 0, noOffset, "profiles", 150, 150, "menu", textInfo.px, textInfo.py);
        gfx.DrawMapCharacter(0, 0, noOffset, "border", 150, 150, "menu");
    },
    DrawSpaceChoice: function(text, y, selected) {
        gfx.DrawWrappedText(text, 160, y, 770, selected ? "#2B87FF": "#5B80AD", 40, true);
    },
    DrawSpeechBubble: function(textInfo, target) {
        const bottom = Math.ceil(gfx.DrawFullText(textInfo.text));
        const noOffset = { x: 0, y: 0 };
        gfx.DrawMapCharacter(0, bottom, noOffset, "talkbottom", 960, 15, "menu");
        if(textInfo.isThought) {
            gfx.DrawMapCharacter(450, bottom + 13, noOffset, "bubblebottom", 60, 50, "menu");
        } else {
            const offset = this.GetMapOffset(game.currentHandler, game.playerPos.x, game.playerPos.y);
            offset.y = 0;
            gfx.DrawMapCharacter(target.x - 30, bottom + 13, offset, "bubblebottom", 60, 50, "menu", 1);
        }
    },
    DrawFullText: function(t, y) { return gfx.DrawWrappedText(t, 10, 30 + (y || 0), 940); },
    DrawWrappedText: function(t, x, y, maxWidth, fillColor, minBottom, extraPadding) {
        minBottom = minBottom || 0;
        const ctx = gfx.ctx["menutext"];
        ctx.fillStyle = "#000000";
        const size = gfx.GetFontSize(22, true);
        ctx.font = size + "px " + gfx.GetFont();
        const ddy = size * 1.25, ts = t.split(" ");
        let row = ts[0], dy = 0;
        for(let i = 1; i < ts.length; i++) {
            const textInfo = ctx.measureText(row + " " + ts[i]);
            if(textInfo.width > maxWidth || row.indexOf("\n") >= 0) {
                ctx.fillText(row, x, (y + dy));
                dy += ddy;
                row = ts[i];
            } else {
                row += " " + ts[i];
            }
        }
        ctx.fillText(row, x, (y + dy));

        const bg = gfx.ctx["menu"];
        bg.fillStyle = fillColor || "#FFFFFF";//"#2B87FF";
        bg.fillRect(0, y - 30, 960, Math.max(dy + ddy, minBottom) + (extraPadding ? 5: 2));
        bg.stroke();
        return Math.max((y + dy - 2), minBottom);
    },
    GetMapOffset: function(map, centerx, centery) {
        const w = map.mapWidth, h = map.mapHeight;
        return {
            x: Math.min(w - gfx.tileWidth, Math.max(centerx - (gfx.tileWidth / 2), 0 + 0.5)),
            y: Math.min(h - gfx.tileHeight, Math.max(centery - (gfx.tileHeight / 2), 0))
        };
    },
    DrawMap: function(handler, centerx, centery) {
        const mapImg = gfx.spritesheets[handler.map];
        const offset = gfx.GetMapOffset(handler, centerx, centery);
        gfx.DrawImage(gfx.ctx["background"], mapImg, offset.x, offset.y, gfx.canvasWidth, gfx.canvasHeight, 0, 0, gfx.canvasWidth, gfx.canvasHeight);
        return offset;
    },
    numberDeltas: { "1": [1, 0], "2": [2, 0], "3": [3, 0], "4": [4, 0], "5": [5, 0], "6": [1, 1], "7": [2, 1], "8": [3, 1], "9": [4, 1], "0": [5, 1] }*/
};