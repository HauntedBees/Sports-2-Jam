const OldMiscFillers = [
    // 0-9: commentary on constellation choice
    "Let's see how that plays out.",
    "A fan favorite.",
    "A wise choice.",
    "Not a bad move on their part.",
    "That's caused problems for them before.",
    "Excellent strategy as always.",
    "A safe bet in this round.",
    "You love to see it.",
    "Bold move.",
    "The suspense rises.",
    // 10-13: hit the ball
    "Excellent form.",
    "A beautiful projection.",
    "And it's off!",
    "Here we go!",
    // 14-16: slam dunking
    "Here comes a Slam Dunk.",
    "A Slam Dunk from {0}!",
    "{0} has unleashed a Slam Dunk.",
    // 17-19: catching
    "The Sol has been caught.",
    "Excellent catch from {0}.",
    "{0} caught the Sol.",
    // 20-32: up to bat / random comments
    "{0} is up.",
    "{0}, ready to go.",
    "Here comes {0}.",
    "Get ready for {0}.",
    "This game is going to go down in history.",
    "I hope the viewers at home are enjoying this game as much as I am.",
    "Now this is what I call Sports. 2.",
    "I have not seen a match like this in years.",
    "Games like this remind me of why I took this job in the first place.",
    "I hope this game wraps up soon, I need to go home and watch Oprah 2.",
    "This game is proudly sponsored by d.a. sports 2. Buy their games!",
    "I meditated on this game for seven days and seven nights. It's going to be a good one, folks.",
    "Remember when the pickle went extinct?",
    "We would like to remind our extra-dimensional viewers that attempting to alter the outcome of the game is strictly forbidden under penalty of space law."
];
const teamComments = [
    [ // Sisimiut Centaurs
        "I had lunch with a centaur once. Great guy. He could really go to town on a plate full of hay.",
        "I'd say you should wear a jacket if you plan on visiting Greenland, but physically visiting places is very last-century! You don't need a jacket if you astrally project there! Ha ha!",
        "The Sisimiut Centaurs have won three championship games so far, which is pretty impressive considering they've only been in two! Parallel universes really mess with bookkeeping!"
    ],
    [ // Bujumbura Bulls
        "I tell you, you haven't had Bujumburan coffee until you've had Bujumburan coffee!",
        "The stars say that if you're a Taurus, you should keep an eye on your pets this weekend! They might be more hectic than usual!",
        "Lake Tanganyika in Burundi became the deepest lake in the world after an asteroid crashed into it a few years back! Take that, Lake Baikal! Ha ha!"
    ],
    [ // Sydney Scales
        "Sydney was just a couple kilometers south of the Event that decimated a large part of eastern Australia. Talk about close calls!",
        "There's always fun in store when the Sydney Scales are playing! I wish the same was true about my bathroom scale! Ha ha!",
        "The Sydney Scales are on their way to the championships this year, as long as their coach doesn't fumble their strategy like they did in 2989!"
    ],
    [ // Makhachkala Rams
        "The players of the Makhachkala Rams always donate a portion of their winnings to the Russian Block Stacking Game You Know The One Foundation for the Sciences.",
        "Last week I was swimming deep in the Pacific and I came across a cow covered in plants. Oh, I'm sorry, I'm thinking of the wrong Moscow. Sorry, Russia!",
        "The clear skies in western Russia give the Rams a beautiful view of the stars to plan their plays with!"
    ],
    [ // Seine Scorpions
        "Not much data about food from the old times has survived, but I thank the stars that the recipe for croissants wasn't lost!",
        "The Eiffel Tower 2 is always a sight to behold; the Seine Scorpions are lucky to live so close to it!",
        "With skills as good as theirs, you'd think the Seine Scorpions could predict the future! They probably can! Chakras are wild like that."
    ],
    [ // Tokyo Twins
        "I know I don't look the type, but I'm a big fan of Japanese classical music! That old standard Cruel Angel's Thesis never disappoints!",
        "For the first 30 years of Basesol, the Tokyo Twins got away with having 40 players on their team by saying they were twins! I can't believe they got away with that for so long!",
        "My first crush when I was much younger was from Tokyo. Unfortunately, universal translators were still a few years away from being perfected, so all I could say to them was \"Where's the bathroom?\""
    ],
    [ // Qusqu Goats
        "Here's my impression of a goat: baa! baaa! goaaat! Wait, it's sheep that go \"baa,\" isn't it?",
        "Peru is home to many famous historical landmarks like Machu Picchu, Qorikancha, and the Plaza Norte Shopping Center.",
        "Qusqu's flag is a rainbow of colors, and it reminds me of my favorite rainbow: the kind you can taste. Purchase Proprietary Fruit Chews today, kids!"
    ],
    [ // San Diego Waterbearers
        "San Diego is a wonderful city to visit, as long as you don't fly in from the east. Flying over eastern North America is never a good idea.",
        "Believe it or not, California used to be part of the former United States before Mexico called dibs and reclaimed it during the U.S. Collapse.",
        "The waterbearer is an important role these days, and I would like to thank all of our waterbearers keeping the world wet and hydrated every day."
    ],
    [ // Atlantis Koi
        "Atlantis rose from the ocean only 200 years ago, and they've already produced one of the best teams in the league in such a short time! Truly amazing.",
        "I'm not much for seafood, but whenever I visit Atlantis for a game, I can't leave until I've stuffed myself on fried anchovies!",
        "The Atlanteans are proud of their star becomer, Regorty Grimentond, as chosen by their infallible clockwork supercomputer POSEIDON."
    ],
    [ // Seoul Snow Crabs
        "The Snow Crab is named after snow, an ancient weather condition that was like acid rain, but nontoxic and apparently fun to play around in!",
        "I love my job, but if I ever had to change it up, I'd want to be a food critic in Korea! I could eat kimchi with every meal! Or just constantly, without ever stopping!",
        "The Seoul Snow Crabs have won more championships than any other team in the League, and they've got their pitcher Ingunna Assa to thank for a lot of those wins!"
    ],
    [ // Cúcuta Maidens
        "Colombian hot chocolate is delicious, but if you have time to go out to a supernova, heating the chocolate to 11,000 degrees really brings out some extra rich flavors!",
        "Colombia obviously has an excellent Basesol team, but their Grundleshort team, the Santa Marta Quigglebops, are truly unparalleled!",
        "South America almost separated from North America a few years ago but Colombian geologist Unglurt Siquez secured the continents together with some electric tape."
    ],
    [ // Lilongwe Lions
        "They say it's better to be a lion among sheep than a sheep among lions, but I'd rather be a human among humans! Ha ha! I haven't seen another human in person in weeks.",
        "Many members of the Lilongwe Lions are graduates from the University of Malawi. Walen Gubard graduated last year with a degree in Cryptozoology, which is sadly quite similar to regular Zoology these days!",
        "Malawi is one of only two landlocked countries in the International Association to Glue the Moon Back Together!"
    ]
];
function ArrayRange(array, min, max) {
    const arr = [];
    for(let i = min; i <= max; i++) {
        arr.push(array[i]);
    }
    return arr;
}
function GenerateSpeechClips() {
    const soundsToPreload = [
        { key: "spk_random9", speaker: "Zenn", text: "We would like to remind our extra-dimensional viewers that attempting to alter the outcome of the game is strictly forbidden under penalty of space law."}
        //{ key: "spk_logo", speaker: "Announcer", text: "d.a. sports 2. become one with the game!" },
        //{ key: "spk_letsplay", text: "Let's play some Basesol!" }
    ];
  /*  teamComments.forEach((e, i) => {
        soundsToPreload.push(...e.map((t, j) => ({ key: `spk_teamComments${i}_${j}`, text: t })));
    });
    soundsToPreload.push(...TeamInfo.map((t, i) => ({ key: `spk_teamName${i}`, text: t.name })));
*/
    //soundsToPreload.push(...ArrayRange(OldMiscFillers, 10, 13).map((t, i) => ({ key: `spk_solHit${i}`, text: t })));
    //soundsToPreload.push(...ArrayRange(OldMiscFillers, 14, 16).map((t, i) => ({ key: `spk_slamDunk${i}`, text: t })));
    //soundsToPreload.push(...ArrayRange(OldMiscFillers, 24, 32).map((t, i) => ({ key: `spk_random${i}`, text: t })));

    PreloadedSoundsRemaining = soundsToPreload.length;
    console.log(`Now preloading ${PreloadedSoundsRemaining} sounds.`);
    soundsToPreload.forEach(f => PreloadSpeechClip(f.key, f.text, "Zenn")); // f.speaker
}
function PreloadSpeechClip(key, text, person) {
    person = person || "Zenn";
    const options = Object.assign({ rawdata: "data-url" }, SpeakHandler.Speakers[person]);
    PreloadedMessages[key] = {
        stream: null,
        text: text,
        person: person
    };
    meSpeak.speak(text, options, function(success, id, stream) {
        PreloadedMessages[key].stream = stream;
        PreloadedSoundsRemaining -= 1;
        DownloadFile(key);
        if(PreloadedSoundsRemaining === 0) { console.log("ALL LOADED!"); }
        console.log(`Preloaded Message "${key}." Remaining: ${PreloadedSoundsRemaining}`);
    });
}
function DownloadFile(key) {
    const obj = PreloadedMessages[key];
    var fileUrl = obj.stream;
    /** @author Peter Mortensen (https://stackoverflow.com/users/63550/peter-mortensen)
     * @license CC-BY-SA (https://stackoverflow.com/help/licensing)
     * @version 13APR2020 (https://stackoverflow.com/a/59578316/12211222) */
    fetch(fileUrl).then(response => response.blob()).then(blob => {
        var link = window.document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = key + ".wav";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}
function GenerateTeamCommentsCaptions() {
    const arr = [];
    for(let i = 0; i < teamComments.length; i++) {
        const tc = teamComments[i];
        for(let j = 0; j < tc.length; j++) {
            arr.push(`"spk_teamComments${i}_${j}": "Zenn: ${tc[j].replace(/"/g, '\\\"')}", `);
        }
    }
    console.log(arr.join("\n"));
}


/** @type {{[key:string] : {stream:any; text:string; person: string } }} */
const PreloadedMessages = {};
let PreloadedSoundsRemaining = 0;

function NormalizeConstellations(width) { // clamps to width (default 500), starts at 0, 0 (previously default width was 1000; halving it improved gameplay immensely)
    width = width || 500;
    let tallest = 0;
    let newConstellations = "const ConstellationInfo = {";
    Object.keys(UnnormalizedConstellationInfo).forEach(name => {
        const c = UnnormalizedConstellationInfo[name];
        let power = 0;
        let minx = 99999, miny = 99999, maxx = -1, maxy = -1;
        c.stars.forEach(star => {
            if(star.x < minx) { minx = star.x; }
            if(star.x > maxx) { maxx = star.x; }
            if(star.y < miny) { miny = star.y; }
            if(star.y > maxy) { maxy = star.y; }
            power += star.power;
        });
        console.log(`${name}: ${power / c.stars.length}`);
        newConstellations += `
    "${name}": new Constellation(${c.hx}, ${c.hy}, 0, 0, 1, 1, [`;
        const mult = width / (maxx - minx);
        c.stars.forEach((star, i) => {
            const newStarX = (star.x - minx) * mult;
            const newStarY = (star.y - miny) * mult;
            if(newStarY > tallest) { tallest = newStarY; }
            newConstellations += `
        new Star(${newStarX}, ${newStarY}, ${star.power})${i === (c.stars.length - 1) ? "" : ","}`;
        });
            newConstellations += `
    ], ${JSON.stringify(c.connections)}),`;
    });
    newConstellations += `
};`
    console.log(`Highest Constellation Height: ${tallest}`);
    console.log(newConstellations);
}


/** @type {{[key:string] : Constellation }} */
const UnnormalizedConstellationInfo = {
    "Test": new Constellation(0, 0, 0, 50, 1, 1, [
        new Star(0, 0, 3),
        new Star(100, 0, 3),
        new Star(100, 100, 3),
        new Star(0, 100, 3)
    ], [[0, 1], [1, 2], [2, 3], [3, 0]]),
    "Orion": new Constellation(4, 2, 0, 0, 1, 1, [
        new Star(3, 1, 2),
        new Star(58, 28, 2),
        new Star(132, 16, 4),
        new Star(144, 58, 4),
        new Star(114, 71, 3),
        new Star(67, 47, 1),
        new Star(1, 62, 2),
        new Star(62, 37, 1)
    ], [ [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [5, 7], [7, 1] ]),
    "Lynx": new Constellation(4, 3, 0, 0, 1, 1, [
        new Star(4, 6, 3),
        new Star(40, 2, 3),
        new Star(74, 27, 2),
        new Star(124, 26, 2),
        new Star(182, 110, 3),
        new Star(330, 188, 2),
        new Star(480, 150, 3),
        new Star(542, 200, 3)
    ], [ [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7] ]),
    "Dephinus": new Constellation(4, 4, 0, 0, 1, 1, [
        new Star(5, 80, 3),
        new Star(83, 7, 4),
        new Star(167, 35, 4),
        new Star(87, 86, 3),
        new Star(370, 115, 4)
    ], [ [0, 1], [1, 2], [2, 3], [3, 0], [2, 4] ]),
    "Andromeda": new Constellation(5, 0, 0, 0, 1, 1, [
        new Star(18, 65, 3),
        new Star(325, 175, 4),
        new Star(520, 240, 3),
        new Star(700, 213, 3),
        new Star(365, 83, 2),
        new Star(375, 8, 2)
    ], [ [0, 1], [1, 2], [2, 3], [1, 4], [4, 5] ]),
    "Monoceros": new Constellation(5, 1, 0, 0, 1, 1, [ 
        new Star(140, 250, 3),
        new Star(2, 42, 2),
        new Star(380, 65, 3),
        new Star(718, 10, 3),
        new Star(800, 85, 1),
        new Star(615, 295, 3),
        new Star(705, 300, 3)
    ], [ [0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6] ]),
    "Ursa Minor": new Constellation(5, 2, 0, 0, 1, 1, [
        new Star(4, 20, 3),
        new Star(50, 45, 2),
        new Star(110, 60, 2),
        new Star(168, 42, 3),
        new Star(210, 8, 4),
        new Star(240, 33, 3),
        new Star(185, 70, 2)
    ], [ [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3] ]),
    "Taurus": new Constellation(0, 0, 0, 50, 1, 1, [
        new Star(5, 140, 3), // left horn
        new Star(188, 134, 1),
        new Star(263, 155, 2),
        new Star(30, 267, 2), // right horn
        new Star(265, 206, 3),
        new Star(291, 197, 2), // head
        new Star(319, 181, 1),
        new Star(294, 164, 2),
        new Star(328, 6, 2), // back
        new Star(415, 178, 2), // legs
        new Star(560, 135, 3)
    ], [
        [0, 1], [1, 2], [3, 4], // horns
        [2, 4], [4, 5], [5, 6], [2, 7], [6, 7], // head
        [7, 8], [6, 9], [9, 10] // back and legs
    ]),
    "Scorpius": new Constellation(1, 0, 0, 0, 1, 1, [
        new Star(80, 8, 3),
        new Star(38, 10, 2),
        new Star(15, 11, 1),
        new Star(5, 66, 3),
        new Star(51, 122, 1),
        new Star(93, 152, 2),
        new Star(154, 117, 2),
        new Star(204, 85, 2),
        new Star(311, 67, 2),
        new Star(347, 69, 4),
        new Star(450, 86, 2),
        new Star(463, 127, 3),
        new Star(421, 162, 2)
    ], [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], // body
        [9, 10], [9, 11], [9, 12] // claws 
    ]),
    "Aries": new Constellation(2, 0, 30, 100, 1.2, 1.4, [
        new Star(8, 163, 3),
        new Star(134, 6, 2),
        new Star(345, 84, 4),
        new Star(410, 136, 2),
        new Star(420, 170, 1)
    ], []), // sequential
    "Gemini": new Constellation(3, 0, 0, 0, 1, 1, [
        new Star(22, 90, 4),
        new Star(107, 83, 1),
        new Star(227, 119, 2),
        new Star(314, 121, 2),
        new Star(340, 107, 3),
        new Star(368, 77, 1),
        new Star(311, 164, 1),
        new Star(138, 5, 2),
        new Star(8, 160, 4),
        new Star(46, 166, 1),
        new Star(128, 218, 2),
        new Star(190, 215, 1),
        new Star(308, 233, 3),
        new Star(167, 295, 2),
        new Star(306, 296, 1),
        new Star(31, 214, 2),
        new Star(74, 139, 1)
    ], [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [2, 6], [1, 7], [1, 16], // first body
        [8, 9], [9, 10], [10, 11], [11, 12], [10, 13], [13, 14], [9, 15], [9, 16]// second body
    ]),
    "Aquarius": new Constellation(0, 1, 0, 0, 2, 2, [
        new Star(4, 336, 1),
        new Star(114, 114, 1),
        new Star(243, 123, 2),
        new Star(386, 2, 2),
        new Star(419, 2, 3),
        new Star(446, 53, 2),
        new Star(536, 64, 4),
        new Star(424, 193, 1),
        new Star(334, 227, 1),
        new Star(218, 254, 2),
        new Star(177, 292, 3),
        new Star(67, 381, 2),
        new Star(430, 336, 1),
        new Star(667, 235, 4),
        new Star(855, 402, 2)
    ], [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 13], [13, 14], // arms
        [6, 7], // torso
        [7, 8], [8, 9], [9, 10], [10, 11], // right leg
        [7, 12] // left leg
    ]),
    "Libra": new Constellation(1, 1, 0, 0, 1, 1, [
        new Star(1, 246, 1),
        new Star(50, 156, 2),
        new Star(50, 5, 4),
        new Star(255, 45, 4),
        new Star(311, 246, 2)
    ], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 1]]),
    "Aquila": new Constellation(2, 1, 0, 0, 1, 1, [
        new Star(5, 9, 2),
        new Star(90, 80, 1),
        new Star(202, 186, 2), // center (2)
        new Star(452, 160, 3),
        new Star(492, 174, 2),
        new Star(102, 361, 2), // tail
        new Star(244, 8, 4), //head
        new Star(186, 12, 1),
        new Star(288, 10, 2)
    ], [
        [0, 1], [1, 2], [2, 3], [3, 4], // wings
        [5, 2], [2, 6], // body
        [6, 7], [6, 8] // head
    ]),
    "Pisces": new Constellation(3, 1, 0, 0, 1, 1, [
        new Star(8, 675, 2),
        new Star(82, 524, 2),
        new Star(140, 384, 2),
        new Star(204, 173, 2),
        new Star(235, 9, 4),
        new Star(169, 119, 2),
        new Star(54, 660, 2),
        new Star(113, 601, 2),
        new Star(172, 579, 2),
        new Star(310, 520, 2),
        new Star(390, 520, 2),
        new Star(532, 475, 2),
        new Star(650, 480, 2),
        new Star(760, 485, 3),
        new Star(820, 455, 3),
        new Star(895, 510, 4),
        new Star(850, 565, 3),
        new Star(765, 570, 3)
    ], [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 3], // fish one
        [0, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 13],
        [13, 14], [14, 15], [15, 16], [16, 17], [17, 13] // fish two
    ]),
    "Sagittarius": new Constellation(0, 2, 100, -100, 1, 1, [
        new Star(38, 240, 1),
        new Star(124, 218, 2),
        new Star(134, 182, 2),
        new Star(232, 236, 4),
        new Star(224, 298, 3),
        new Star(98, 388, 1),
        new Star(90, 528, 1),
        new Star(244, 590, 1),
        new Star(382, 638, 2),
        new Star(500, 557, 1),
        new Star(420, 510, 1),
        new Star(275, 308, 3),
        new Star(458, 226, 4),
        new Star(270, 205, 2),
        new Star(390, 150, 2),
        new Star(445, 105, 3),
        new Star(463, 5, 1),
        new Star(295, 118, 2),
        new Star(265, 5, 2)
    ], [
        [0, 1], [1, 2], [2, 3], // cape
        [3, 4], [4, 11], [11, 14], [14, 3], // body
        [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [8, 10], // legs
        [11, 12], [12, 14], [12, 15], [15, 16], [15, 14], [14, 17], [17, 13], [13, 14], [17, 18] // bow
    ]),
    "Capricornus": new Constellation(1, 2, 100, 0, 1, 1, [
        new Star(0, 300, 2),
        new Star(25, 250, 3),
        new Star(260, 215, 3),
        new Star(345, 225, 2),
        new Star(435, 230, 3),
        new Star(470, 240, 4),
        new Star(365, 105, 4),
        new Star(200, 5, 2),
        new Star(170, 37, 2)
    ], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [3, 6], [6, 2], [2, 7], [1, 8]]),
    "Virgo": new Constellation(2, 2, 100, 0, 1, 1, [
        new Star(10, 135, 1), // leg
        new Star(190, 148, 1),
        new Star(295, 185, 2),
        new Star(20, 260, 1), // leg
        new Star(128, 268, 1),
        new Star(138, 335, 2),
        new Star(325, 355, 4), // hip
        new Star(505, 210, 3),
        new Star(596, 205, 2),
        new Star(735, 90, 1),
        new Star(450, 130, 2),
        new Star(430, 5, 2)
    ], [
        [0, 1], [1, 2], [3, 4], [4, 5], [5, 6], // legs
        [2, 6], [6, 7], [7, 10], [10, 2], // body
        [10, 11], [7, 8], [8, 9]// arms/head
    ]),
    "Leo": new Constellation(3, 2, 100, 0, 1, 1, [
        new Star(6, 265, 3),
        new Star(168, 246, 2),
        new Star(485, 290, 4),
        new Star(478, 195, 1),
        new Star(412, 142, 3),
        new Star(165, 148, 3),
        new Star(418, 70, 2),
        new Star(516, 3, 1),
        new Star(555, 40, 2)
    ], [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 1], // body
        [4, 6], [6, 7], [7, 8] // head
    ]),
    "Cancer": new Constellation(0, 3, 0, 0, 1, 1, [
        new Star(5, 298, 3),
        new Star(204, 66, 3),
        new Star(292, 58, 3),
        new Star(470, 162, 3),
        new Star(477, 4, 3),
        new Star(21, 6, 3)
    ], [
        [0, 1], [1, 2], [2, 3], // body
        [2, 4], [1, 5] // claws
    ]),
    "Ursa Major": new Constellation(1, 3, 0, 0, 1, 1, [
        new Star(8, 55, 2),
        new Star(100, 20, 2),
        new Star(160, 40, 2),
        new Star(237, 60, 1),
        new Star(263, 123, 2),
        new Star(380, 110, 2),
        new Star(388, 28, 2),
        new Star(555, 5, 1),
        new Star(680, 8, 1),
        new Star(525, 75, 2),
        new Star(530, 150, 1),
        new Star(579, 186, 2),
        new Star(673, 230, 2),
        new Star(666, 245, 2),
        new Star(253, 209, 2),
        new Star(330, 280, 2),
        new Star(466, 323, 2),
        new Star(450, 343, 3)
    ], [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3], // tail and lower body
        [6, 7], [7, 8], [8, 9], [9, 10], [10, 5], // upper body
        [10, 11], [11, 12], [11, 13], // front legs
        [4, 14], [14, 15], [15, 16], [15, 17] // back legs
    ]),
    "Cetus": new Constellation(2, 3, 0, 0, 1, 1, [
        new Star(105, 171, 2),
        new Star(141, 198, 1),
        new Star(229, 193, 1),
        new Star(250, 340, 1),
        new Star(255, 375, 1),
        new Star(302, 362, 1),
        new Star(442, 267, 2),
        new Star(628, 169, 3),
        new Star(492, 127, 2),
        new Star(432, 136, 2),
        new Star(372, 219, 2),
        new Star(292, 315, 1),
        new Star(623, 11, 2),
        new Star(40, 202, 2),
        new Star(7, 137, 1),
        new Star(41, 90, 2),
        new Star(106, 76, 2),
        new Star(107, 127, 2),
        new Star(148, 40, 2)
    ], [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 12], // neck and lower body
        [7, 8], [8, 9], [9, 10], [10, 11], [11, 3], // upper body
        [0, 13], [13, 14], [14, 15], [15, 16], [16, 17], [17, 0], [16, 18] // head
    ]),
    "Centaurus": new Constellation(3, 3, 0, 0, 1, 1, [
        new Star(104, 39, 3),
        new Star(174, 96, 1),
        new Star(177, 106, 1),
        new Star(165, 145, 1),
        new Star(184, 175, 2),
        new Star(360, 162, 3),
        new Star(391, 177, 1),
        new Star(436, 183, 2),
        new Star(505, 241, 1),
        new Star(486, 370, 1),
        new Star(243, 246, 3),
        new Star(231, 358, 4),
        new Star(166, 390, 4),
        new Star(63, 147, 3),
        new Star(6, 175, 2),
        new Star(214, 51, 1),
        new Star(233, 6, 2)
    ], [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], // main body
        [4, 10], [10, 11], [11, 12], // front leg
        [2, 13], [13, 14], [1, 15], [15, 16] // arms
    ]),
    "Hercules": new Constellation(0, 4, 100, 0, 1, 1, [
        new Star(15, 112, 1),
        new Star(6, 200, 1),
        new Star(72, 204 , 2),
        new Star(128, 200, 3),
        new Star(193, 270, 3),
        new Star(190, 280, 1),
        new Star(198, 295, 1),
        new Star(225, 383, 2),
        new Star(92, 376, 2),
        new Star(345, 6, 2),
        new Star(330, 48, 3),
        new Star(218, 148, 3),
        new Star(252, 196, 2),
        new Star(353, 260, 1),
        new Star(348, 315, 3),
        new Star(337, 356, 2),
        new Star(353, 383, 2),
        new Star(352, 204, 3)
    ], [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], // legs
        [3, 11], [11, 12], [12, 4], // body
        [11, 10], [10, 9], [12, 13], [13, 14], [14, 15], [15, 16], [13, 17] // arms
    ]),
    "Lepus": new Constellation(1, 4, 0, 0, 1, 1, [
        new Star(4, 30, 2),
        new Star(70, 17, 3),
        new Star(130, 43, 3),
        new Star(207, 136, 3),
        new Star(224, 219, 4),
        new Star(115, 250, 3),
        new Star(78, 202, 3),
        new Star(338, 125, 3),
        new Star(357, 285, 3),
        new Star(310, 30, 2),
        new Star(312, 5, 1),
        new Star(350, 30, 2),
        new Star(360, 2, 1)
    ], [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3], [3, 7], [7, 8], [8, 4], // body
        [7, 9], [9, 10], [7, 11], [11, 12] // ears
    ]),
    "Pegasus": new Constellation(2, 4, 0, 0, 1, 1, [
        new Star(11, 78, 3),
        new Star(130, 11, 2),
        new Star(288, 100, 2),
        new Star(310, 130, 1 ),
        new Star(392, 194, 3),
        new Star(710, 233, 3),
        new Star(637, 500, 3),
        new Star(359, 445, 2),
        new Star(305, 373, 2),
        new Star(290, 350, 1),
        new Star(120, 376, 2),
        new Star(22, 285, 2),
        new Star(270, 475, 2),
        new Star(132, 530, 1)
    ], [
        [0, 1], [1, 2], [2, 3], [3, 4], // neck
        [4, 5], [5, 6], [6, 7], [7, 4], // body
        [7, 8], [8, 9], [9, 10], [10, 11], // top leg
        [7, 12], [12, 13] // bottom leg
    ]),
    "Perseus": new Constellation(3, 4, 0, 0, 1, 1, [
        new Star(27, 203, 2),
        new Star(6, 67, 3),
        new Star(72, 25, 1),
        new Star(150, 5, 3),
        new Star(315, 5, 2),
        new Star(380, 45, 4),
        new Star(460, 70, 3),
        new Star(520, 84, 2),
        new Star(235, 165, 3),
        new Star(203, 195, 2),
        new Star(220, 248, 1)
    ], [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], // body
        [5, 8], [8, 9], [9, 10] // arm
    ]),
    "Boötes": new Constellation(4, 0, 0, 100, 1, 1, [
        new Star(123, 166, 4),
        new Star(320, 127, 3),
        new Star(491, 86, 1),
        new Star(574, 207, 2),
        new Star(482, 282, 3),
        new Star(348, 207, 2),
        new Star(88, 11, 1),
        new Star(67, 246, 3),
        new Star(10, 246, 2)
    ], [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], // body
        [6, 0], [0, 7], [7, 8] // leggies
    ]),
    "Cygnus": new Constellation(4, 1, 0, 0, 1, 1, [
        new Star(7, 7, 2),
        new Star(43, 41, 2),
        new Star(176, 81, 3),
        new Star(268, 213, 4),
        new Star(381, 317, 3),
        new Star(435, 437, 2),
        new Star(433, 573, 1),
        new Star(167, 273, 3),
        new Star(370, 117, 1),
        new Star(505, 6, 2)
    ], [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], // wings
        [7, 3], [3, 8], [8, 9] // body
    ])
};

/*
,
    "X": new Constellation(3, 1, 0, 0, 1, 1, [
        new Star(0, 0, 2),
        new Star(0, 0, 2),
        new Star(0, 0, 2),
        new Star(0, 0, 2),
        new Star(0, 0, 2),
        new Star(0, 0, 2),
        new Star(0, 0, 2),
        new Star(0, 0, 2),
        new Star(0, 0, 2)
    ], [

    ])

*/