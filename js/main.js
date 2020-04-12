/*function CreateStar(x, y, radius, gravityForce, gravityRange) {
    x = p2m(x);
    y = p2m(y);
    radius = p2m(radius);
	const fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 1.0;
	fixDef.restitution = 0.0;
	fixDef.shape = new b2CircleShape(radius);
	fixDef.isSensor = false;
	
	const bodyDef = new b2BodyDef;
	bodyDef.type = b2Body.b2_staticBody;
	bodyDef.position.x = x;
	bodyDef.position.y = y;
	bodyDef.userData = {
        gravity: gravityForce,
        radius: radius,
        gravity_factor: gravityRange
    };

	const star = world.CreateBody(bodyDef);
	star.CreateFixture(fixDef);
	return star;
}*/

/*function RandomForce() { return Math.ceil(20 * Math.random()); } // force is between 1 and 20
function RandomRange() { return 5 + Math.ceil(20 * Math.random()); }
function UrsaMajor() {
    planets = [
        CreateStar(20, 12, 10, RandomForce(), RandomRange()),
        CreateStar(73, 71, 10, RandomForce(), RandomRange()),
        CreateStar(143, 119, 10, RandomForce(), RandomRange()),
        CreateStar(294, 123, 10, RandomForce(), RandomRange()),
        CreateStar(457, 137, 10, RandomForce(), RandomRange()),
        CreateStar(566, 161, 10, RandomForce(), RandomRange()),
        CreateStar(421, 210, 10, RandomForce(), RandomRange()),
        CreateStar(273, 221, 10, RandomForce(), RandomRange()),
        CreateStar(156, 212, 10, RandomForce(), RandomRange()),
        CreateStar(60, 330, 10, RandomForce(), RandomRange()),
        CreateStar(212, 380, 10, RandomForce(), RandomRange()),
        CreateStar(224, 350, 10, RandomForce(), RandomRange()),
        CreateStar(467, 332, 10, RandomForce(), RandomRange()),
        CreateStar(550, 370, 10, RandomForce(), RandomRange()),
        CreateStar(530, 409, 10, RandomForce(), RandomRange())
    ];
}*/

function Draw() {
    gfx.ClearLayer("canvastop");
    /*for (let i = 0; i < debris.length; i++ ) {
        const pos = debris[i].GetWorldCenter();
		const linear_velocity = debris[i].GetLinearVelocity();
        const angle = Math.atan2(linear_velocity.y, linear_velocity.x);//debris[i].GetAngle();
        let angleDegrees = angle * toRadians;
        if(angleDegrees < 0) { angleDegrees += 360; }
        let sx = 0;
        if(angleDegrees >= 337 || angleDegrees < 22) {
            sx = 2;
        } else if(angleDegrees >= 22 && angleDegrees < 67) {
            sx = 1;
        } else if(angleDegrees >= 67 && angleDegrees < 112) {
            sx = 0;
        } else if(angleDegrees >= 112 && angleDegrees < 157) {
            sx = 7;
        } else if(angleDegrees >= 157 && angleDegrees < 202) {
            sx = 6;
        } else if(angleDegrees >= 202 && angleDegrees < 247) {
            sx = 5;
        } else if(angleDegrees >= 247 && angleDegrees < 292) {
            sx = 4;
        } else if(angleDegrees >= 292 && angleDegrees < 337) {
            sx = 3;
        }
        gfx.DrawSprite("sprites", sx, 2, m2p(pos.x) - 16, m2p(pos.y) - 16, "canvastop");
    }
    for(let i = 0; i < planets.length; i++) {
        const pos = planets[i].GetWorldCenter();
        const data = planets[i].GetUserData();
        const powerIdx = Math.floor(5 * (data.gravity / 20));
        gfx.DrawSprite("sprites", powerIdx, 0, m2p(pos.x) - 16, m2p(pos.y) - 16, "canvastop");
    }*/
}
//const toRadians = 180 / Math.PI;
function myInit() {
    gfx.LoadSpriteSheets("img", ["sprites", "title"], function() {
        //UrsaMajor();
        setInterval(Draw, 10);
    });
    
    /*planets.push(CreateStar(100, 100, 10, 5, 20));
    planets.push(CreateStar(400, 400, 10, 8, 25));
    planets.push(CreateStar(100, 400, 10, 20, 15));
    planets.push(CreateStar(400, 100, 10, 1, 30));*/
}