class Star {
    /** @param {number} x @param {number} y @param {number} power */
    constructor(x, y, power) {
        this.x = x; this.y = y;
        this.power = power;
    }
}
class Constellation {
    /** @param {number} hx @param {number} hy
     * @param {number} offx @param {number} offy
     * @param {number} scalex @param {number} scaley
     * @param {Star[]} stars @param {number[][]} connections */
    constructor(hx, hy, offx, offy, scalex, scaley, stars, connections) {
        this.hx = hx; this.hy = hy;
        this.offset = { x: offx, y: offy };
        this.scale = { x: scalex, y: scaley };
        this.stars = stars;
        this.connections = connections;
        if(this.connections.length === 0) {
            for(let i = 0; i < (this.stars.length - 1); i++) {
                this.connections.push([i, i + 1]);
            }
        }
    }
}
/** @type {{[key:string] : Constellation }} */
const ConstellationInfo = {
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
        new Star(7, 244, 2),
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
        new Star(515, 236, 3),
        new Star(270, 205, 2),
        new Star(390, 150, 2),
        new Star(445, 105, 3),
        new Star(463, 5, 1),
        new Star(295, 118, 2),
        new Star(265, 5, 2)
    ], [
        [0, 1], [1, 2], [2, 3], [3, 4], // cape
        [4, 5], [5, 12], [12, 15], [15, 4], // body
        [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [9, 11], // legs
        [12, 13], [13, 14], [13, 16], [13, 17], [17, 18], [17, 16], [16, 19], [19, 15], [15, 16], [19, 20] // bow
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