class Helper {
    constructor() {
        this.outerDisplay = document.getElementById("helpText");
        this.textDisplay = document.getElementById("helpTextContent");
        this.isVisible = false;
        this.justPressedByPlayer1 = false;
    }
    GetHelpInformation(playerNum, fromKeyboard) {
        if(fromKeyboard) {
            if(playerNum === 1) {
                this.justPressedByPlayer1 = true;
            } else if(this.justPressedByPlayer1) {
                this.justPressedByPlayer1 = false;
                return;
            }
        }
        if(this.isVisible) { return this.HideMessage(); }
        switch(game.currentHandler) { // menus and such
            case LogoScreen: 
            case Title:
            case WinScreen:
            case Credits:
                return this.ShowMessage([
                    "Welcome to Basesol: a video game!",
                    "The default controls are WASD to move around, Z to confirm, X to cancel, and the Enter key to pause!",
                    "You can also use a gamepad with the d-pad, A and B buttons, and Start button to do the same!"
                ]);
            case TeamSelection:
                return this.ShowMessage([
                    "It's time to select a Basesol team to play with!",
                    "Each team has 3 constellations to choose from. These constellations can be chosen when your team is pitching, and they will be the game field until you and the other team switch sides.",
                    "Other than constellations, all differences between teams are purely cosmetic, so unless you're an experienced player who knows which constellations they want, just pick whichever one looks cool to you!"
                ]);
            case SeriesIndicator:
                return this.ShowMessage([
                    "You're about to play a series match!",
                    "In a galactic series, you must compete in a series of games against other teams to become the best and win the Award!"
                ]);
            case VersusIndicator:
                return this.ShowMessage([
                    "You're about to play a versus match!",
                    "You and your opponent will compete head-to-head! During the pitching event, both players will share a screen, but once the ball is projected into the game field, the screen will split and Player 1 will look at the left side, while Player 2 will look at the right side."
                ]);
            case CoinToss:
                return this.ShowMessage([
                    "It's time for the coin toss!",
                    "Call which side the hypercoin will land on - if you guess correctly, your team will be the jumping team first, otherwise you will pitch first.",
                    "The jumping team is similar to the batting team in the ancient \"sport\" of baseball, and the pitching team is similar to baseball's pitching team."
                ]);
            case SeriesWinScreen:
                return this.ShowMessage(["Come on, this is a victory screen. You don't need help right now."]);
            case OptionsScreen:
                return this.ShowMessage([
                    "Ah, the Options Menu. Truly a screen beloved by all.",
                    "Sound, Music, and Voices toggle sound, music, and voice audio respectively. Voice Captions toggles captions for the spoken messages, regardless of whether voice audio is on or off.",
                    "When Gameplay is off, there is no video game. Only darkness. This cannot be turned on.",
                    "When Slowdown Mode is on, the game will run at half speed. Perfect for new players and those who think the real world moves fast enough outside of video games! It also might be useful for players on slower computers.",
                    "Likewise, turning Particle Effects off may fix slowdown on slower computers or help players who don't like seeing that much sparkling stuff on screen."
                ], true);
            case ControlsScreen:
                return this.ShowMessage([
                    "Here you can change the keyboard or gamepad controls you want to use for the game.",
                    "When using gamepads, player 1 will always be the first gamepad and player 2 will always be the second gamepad. Press buttons on the gamepads in the order you want to use them.",
                    "It is not recommended to toggle between the keyboard and gamepads on this screen. Navigate to this screen with the control method you want to use first."
                ]);
        }
        if(game.currentHandler !== BaseStar || BaseStar.subhandler === null) {
            return this.ShowMessage([
                "I'm gonna keep it real with you, chief.",
                "I don't know what screen you're on.",
                "Please navigate to another menu or game screen and then try again.",
                "If you're as confused as I am, try refreshing the page and starting over."
            ]);
        }
        switch(BaseStar.subhandler.constructor.name) {
            case "FieldPickHandler":
                return this.ShowMessage([
                    "== Constellation Selection ==",
                    "The Pitching Team can select one of their three constellations to be the game field. Once selected, they can place Wanderers on the field.",
                    "Each team has three constellations, and the number of stars in the constellation will affect how many Wanderers can be placed.",
                    "Larger constellations have more stars, making it harder for the Running Team to reach some of them and avoid getting caught by the Catchers that guard each star.",
                    "But the more stars you have, the more Catchers you need for them, so you'll have less Wanderers to place in larger constellations.",
                    "Try to find the right balance and Wanderer placements that work for your play style - or that work against your opponent's!"
                ], true);
            case "AtBatHandler":
                return this.ShowMessage([
                    "== Pitching and Becoming ==",
                    "The Pitcher can select one of four pitching styles to project the Sol with.",
                    "The Becomer must press the Confirm button to select the direction and power of their hit, then press it again after the Sol has been thrown to hit it.",
                    "If the Becomer misses the Sol, they will receive a strike. After two strikes, they will be out.",
                    "If they hit the Sol, they will become one with it and be launched into the game field."
                ]);
            case "FieldRunHandler":
                if((BaseStar.data.team1.isUp && playerNum === 1) || (BaseStar.data.team2.isUp && playerNum === 2)) {
                    return this.ShowMessage([
                        "== Jumping ==",
                        "The Becomer must press the Confirm button to detach from the Sol. If the Sol is caught while the Becomer is still fused with it, they will be out.",
                        "The Becomer can then PRESS the directional buttons to cycle between target stars, and press Confirm once to dash toward a star. Once they have reached a target star, they can press Confirm once more to end the run.",
                        "Additionally, if multiple players on the Becoming Team are on the field, the player can press the Cancel button to switch between them and move already placed players to other stars.",
                        "If the Becomer is hit by the Sol, or lands on a star that the Sol is on, they will be out. Additionally, Wanderers and Catchers with the Sol can perform a Slam Dunk, which will launch particles that will get the Becomer out if they're hit by them."
                    ], true);
                } else {
                    return this.ShowMessage([
                        "== Catching ==",
                        "While the Sol is moving around the field, the Catching Team can move their Wanderers by HOLDing a directional button to move in that direction. Wanders will also slowly move toward the Sol on their own.",
                        "Once a Wanderer or Catcher has the Sol, they can PRESS a directional button to cycle between targets to throw the Sol to, then press the Confirm button to throw to them.",
                        "If the Becomer is hit by the Sol, or lands on a star that the Sol is on, they will be out. Additionally, Wanderers and Catchers with the Sol can perform a Slam Dunk, which will launch particles that will get the Becomer out if they're hit by them.",
                        "Only one Slam Dunk may be performed per round, but the Pitcher's Slam Dunk is much more powerful and will home in on the Becomer."
                    ], true);
                }
        }
    }
    ShowMessage(msgArray, bigHead) {
        this.isVisible = true;
        this.outerDisplay.style["display"] = "block";
        this.textDisplay.innerHTML = "<p>" + msgArray.join("</p><p>") + "</p>";
        if(bigHead === true) {
            this.textDisplay.style["padding-top"] = "10px";
        } else {
            this.textDisplay.style["padding-top"] = "100px";
        }
    }
    HideMessage() {
        this.isVisible = false;
        this.outerDisplay.style["display"] = "none";
    }
}
const helper = new Helper();