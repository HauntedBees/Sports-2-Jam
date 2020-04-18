const SpeakHandler = {
    Speakers: {
        "Zenn" : { variant: "croak", pitch: 15 }
    },
    Speak: function(text, person) {
        person = person || "Zenn";
        console.log(`${person}: ${text}`);
        //meSpeak.speak(text, SpeakHandler.Speakers[person]);
    },
    Stop: function() {
        meSpeak.stop();
    }
};