const miscFillers = [
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
function MiscFiller(a, b, replacement) {
    const val = miscFillers[RandRange(a, b)];
    if(replacement === undefined) { return val; }
    return val.replace("{0}", replacement);
}
function GetTeamComment(team1Idx, team2Idx) {
    const speakerArray = teamComments[(Math.random() <= 0.5 ? team1Idx : team2Idx)];
    return speakerArray[RandRange(0, speakerArray.length)];
}
const SpeakHandler = {
    Speakers: {
        "Zenn" : { variant: "f3", pitch: 5, speed: 170 },
        "Announcer": { variant: "m2", pitch: 50, speed: 110, wordgap: 1 }
    },
    Speak: function(text, person) {
        SpeakHandler.Stop();
        if(SpeakHandler.PreloadedMessages[text] !== undefined && SpeakHandler.PreloadedMessages[text].stream !== null) { return SpeakHandler.SpeakFromKey(text); }
        person = person || "Zenn";
        SpeakHandler.StartCaption(person, text);
        if(!playerOptions["voice"].value) { return; }
        meSpeak.speak(text, SpeakHandler.Speakers[person], SpeakHandler.EndCaption);
    },
    Stop: function() {
        SpeakHandler.EndCaption();
        meSpeak.stop();
    },
    SpeakFromKey: function(key, callback) {
        SpeakHandler.Stop();
        const me = SpeakHandler.PreloadedMessages[key];
        if(me === undefined) { return; }
        if(me.stream === null) { return this.Speak(me.text, me.person); }
        SpeakHandler.StartCaption(me.person, me.text);
        if(!playerOptions["voice"].value) { return; }
        const audioStream = me.stream.slice(0); // creates a copy
        if(callback === undefined) {
            meSpeak.play(audioStream, undefined, SpeakHandler.EndCaption);
        } else {
            meSpeak.play(audioStream, undefined, callback);
        }
    },
    StartCaption(person, text) {
        if(!playerOptions["captions"].value) { return; }
        document.getElementById("captionsText").textContent = person + ": " + text;
        document.getElementById("captions").style["display"] = "block";
    },
    EndCaption() {
        document.getElementById("captions").style["display"] = "none";
    },

    SoundsToPreload: 0, 
    PreloadAll: function() {
        if(SpeakHandler.SoundsToPreload > 0 || SpeakHandler.PreloadedMessages["Announcer"] !== undefined) { return; }
        meSpeak.loadVoice("voices/en/en-us.json", function() {
            const soundsToPreload = [
                { key: "logo", speaker: "Announcer", text: "d.a. sports 2. become one with the game!" },
                { key: "letsplay", text: "Let's play some Basesol!" }
            ];
            teamComments.forEach(e => {
                soundsToPreload.push(...e.map(t => ({ key: t, text: t }))); // TODO: 50 things is too many
            });
            soundsToPreload.push(...TeamInfo.map(t => ({ key: t.name, text: t.name })));
            SpeakHandler.SoundsToPreload = soundsToPreload.length;
            console.log(SpeakHandler.SoundsToPreload);
            soundsToPreload.forEach(f => SpeakHandler.Preload(f.key, f.text, f.speaker));
        });
    },
    Preload: function(key, text, person) {
        person = person || "Zenn";
        const options = Object.assign({ rawdata: true }, SpeakHandler.Speakers[person]);
        SpeakHandler.PreloadedMessages[key] = {
            stream: null,
            text: text,
            person: person
        };
        meSpeak.speak(text, options, function(success, id, stream) {
            SpeakHandler.PreloadedMessages[key].stream = stream;
            SpeakHandler.SoundsToPreload -= 1;
            if(SpeakHandler.SoundsToPreload === 0) { console.log("ALL LOADED!"); }
            //console.log(`Preloaded Message "${key}." Remaining: ${SpeakHandler.SoundsToPreload}`);
        });
    },
    /** @type {{[key:string] : {stream:any; text:string; person: string } }} */
    PreloadedMessages: {},
};
const Sounds = {
    /** @type {{[key:string] : HTMLAudioElement }} */ SoundTable: {},
    /** @type {string[]} */ ActiveSoundEffects: [],
    /** @type {string[]} */ ActiveSongs: [], 
    Init: function() {
        const sounds = ["confirm", "cancel", "playBall"];
        sounds.forEach(s => {
            const song = new Audio("sound/" + s + ".ogg");
            song.onended = function() {
                let i = Sounds.ActiveSoundEffects.indexOf(s);
                if(i >= 0) { Sounds.ActiveSoundEffects.splice(i, 1); }
            }
            Sounds.SoundTable[s] = song;
        });
        const music = ["title"];
        music.forEach(s => {
            const song = new Audio("sound/" + s + ".ogg");
            song.loop = true;
            Sounds.SoundTable[s] = song;
        });
    },
    PlaySong: /** @param {string} name persist @param {number} [forcedVolume] */
    function(name, forcedVolume) {
        if(!playerOptions["music"].value) { return; }
        console.log(`Now Playing: ${name}`);
        Sounds.ActiveSongs.push(name);
        Sounds.SoundTable[name].currentTime = 0;
        Sounds.SoundTable[name].volume = forcedVolume || 0.05;//(forcedVolume || player.options.sound) / 20;
        Sounds.SoundTable[name].play();
    },
    PlaySound: /** @param {string} name @param {boolean} persistTransition @param {number} [forcedVolume] */
    function(name, persistTransition, forcedVolume) {
        if(!playerOptions["sound"].value) { return; }
        console.log(`Now Playing: ${name}`);
        if(!persistTransition) { Sounds.ActiveSoundEffects.push(name); }
        Sounds.SoundTable[name].currentTime = 0;
        Sounds.SoundTable[name].volume = forcedVolume || 0.1;//(forcedVolume || player.options.sound) / 20;
        Sounds.SoundTable[name].play();
    },
    EndSpecific: function(name) {
        Sounds.SoundTable[name].pause();
    },
    EndAll: function() {
        Sounds.ActiveSoundEffects.forEach(s => Sounds.SoundTable[s].pause());
        Sounds.ActiveSoundEffects = [];
        Sounds.ActiveSongs.forEach(s => Sounds.SoundTable[s].pause());
        Sounds.ActiveSongs = [];
    }
};
Sounds.Init();