const SpeakHandler = {
    Speakers: {
        "Zenn" : { variant: "croak", pitch: 15 },
        "logo": { variant: "m2", pitch: 50, speed: 110, wordgap: 1 }
    },
    Speak: function(text, person) {
        person = person || "Zenn";
        console.log(`${person}: ${text}`);
        if(!playerOptions["voice"].value) { return; }
        meSpeak.speak(text, SpeakHandler.Speakers[person]);
    },
    Stop: function() {
        meSpeak.stop();
    },
    Preload: function(key, text, person) {
        person = person || "Zenn";
        const options = Object.assign(SpeakHandler.Speakers[person], { rawdata: true });
        meSpeak.speak(text, options, function(success, id, stream) {
            SpeakHandler.PreloadedMessages[key] = stream;
            SpeakHandler.SoundsToPreload -= 1;
            //console.log(`Preloaded Message "${key}." Remaining: ${SpeakHandler.SoundsToPreload}`);
        });
    },
    PreloadedMessages: {}, 
    SpeakFromKey: function(key, callback) {
        if(SpeakHandler.PreloadedMessages[key] === undefined) { return; }
        const audioStream = SpeakHandler.PreloadedMessages[key].slice(0); // creates a copy
        if(callback === undefined) {
            meSpeak.play(audioStream);
        } else {
            meSpeak.play(audioStream, undefined, callback);
        }
    },
    SoundsToPreload: 0, 
    PreloadAll: function() {
        if(SpeakHandler.SoundsToPreload > 0 || SpeakHandler.PreloadedMessages["logo"] !== undefined) { return; }
        meSpeak.loadVoice("voices/en/en-us.json", function() {
            const soundsToPreload = [
                { key: "logo", speaker: "logo", text: "d.a. sports 2. become one with the game!" },
                { key: "letsplay", text: "Let's play some Base Sol!" }
            ];
            soundsToPreload.push(...TeamInfo.map(t => ({ key: t.name, text: t.name })));
            SpeakHandler.SoundsToPreload = soundsToPreload.length;
            soundsToPreload.forEach(f => SpeakHandler.Preload(f.key, f.text, f.speaker));
        });
    }
};
const Sounds = {
    /** @type {{[key:string] : HTMLAudioElement }} */ SoundTable: {},
    /** @type {string[]} */ ActiveSoundEffects: [],
    /** @type {string[]} */ ActiveSongs: [], 
    Init: function() {
        const sounds = ["confirm", "cancel"];
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