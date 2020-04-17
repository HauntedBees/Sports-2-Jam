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

function NormalizeConstellations() { // clamps to 1000 width, starts at 0, 0
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
        const mult = 1000 / (maxx - minx);
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
const ConstellationInfo = {
    "Taurus": new Constellation(0, 0, 0, 0, 1, 1, [
        new Star(0, 241.44144144144144, 3),
        new Star(329.72972972972974, 230.63063063063063, 1),
        new Star(464.8648648648649, 268.4684684684685, 2),
        new Star(45.04504504504504, 470.27027027027026, 2),
        new Star(468.4684684684685, 360.36036036036035, 3),
        new Star(515.3153153153153, 344.14414414414415, 2),
        new Star(565.7657657657658, 315.31531531531533, 1),
        new Star(520.7207207207207, 284.68468468468467, 2),
        new Star(581.981981981982, 0, 2),
        new Star(738.7387387387388, 309.9099099099099, 2),
        new Star(1000, 232.43243243243245, 3)
    ], [[0,1],[1,2],[3,4],[2,4],[4,5],[5,6],[2,7],[6,7],[7,8],[6,9],[9,10]]),
    "Scorpius": new Constellation(1, 0, 0, 0, 1, 1, [
        new Star(163.75545851528386, 0, 3),
        new Star(72.0524017467249, 4.366812227074236, 2),
        new Star(21.83406113537118, 6.550218340611354, 1),
        new Star(0, 126.63755458515286, 3),
        new Star(100.43668122270743, 248.90829694323148, 1),
        new Star(192.1397379912664, 314.410480349345, 2),
        new Star(325.3275109170306, 237.99126637554588, 2),
        new Star(434.4978165938865, 168.1222707423581, 2),
        new Star(668.1222707423582, 128.82096069868996, 2),
        new Star(746.7248908296943, 133.1877729257642, 4),
        new Star(971.6157205240175, 170.3056768558952, 2),
        new Star(1000.0000000000001, 259.8253275109171, 3),
        new Star(908.2969432314411, 336.2445414847162, 2)
    ], [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[9,11],[9,12]]),
    "Aries": new Constellation(2, 0, 0, 0, 1, 1, [
        new Star(0, 381.06796116504853, 3),
        new Star(305.8252427184466, 0, 2),
        new Star(817.9611650485436, 189.32038834951456, 4),
        new Star(975.7281553398058, 315.53398058252424, 2),
        new Star(999.9999999999999, 398.0582524271844, 1)
    ], [[0,1],[1,2],[2,3],[3,4]]),
    "Gemini": new Constellation(3, 0, 0, 0, 1, 1, [
        new Star(38.888888888888886, 236.11111111111111, 4),
        new Star(275, 216.66666666666666, 1),
        new Star(608.3333333333333, 316.66666666666663, 2),
        new Star(850, 322.22222222222223, 2),
        new Star(922.2222222222222, 283.3333333333333, 3),
        new Star(1000, 200, 1),
        new Star(841.6666666666666, 441.66666666666663, 1),
        new Star(361.1111111111111, 0, 2),
        new Star(0, 430.55555555555554, 4),
        new Star(105.55555555555556, 447.22222222222223, 1),
        new Star(333.3333333333333, 591.6666666666666, 2),
        new Star(505.55555555555554, 583.3333333333333, 1),
        new Star(833.3333333333333, 633.3333333333333, 3),
        new Star(441.66666666666663, 805.5555555555555, 2),
        new Star(827.7777777777777, 808.3333333333333, 1),
        new Star(63.888888888888886, 580.5555555555555, 2),
        new Star(183.33333333333331, 372.22222222222223, 1)
    ], [[0,1],[1,2],[2,3],[3,4],[4,5],[2,6],[1,7],[1,16],[8,9],[9,10],[10,11],[11,12],[10,13],[13,14],[9,15],[9,16]]),
    "Aquarius": new Constellation(0, 1, 0, 0, 1, 1, [
        new Star(0, 392.4794359576968, 1),
        new Star(129.2596944770858, 131.60987074030552, 1),
        new Star(280.8460634547591, 142.18566392479434, 2),
        new Star(448.8836662749706, 0, 2),
        new Star(487.6615746180963, 0, 3),
        new Star(519.3889541715629, 59.929494712103406, 2),
        new Star(625.1468860164512, 72.85546415981199, 4),
        new Star(493.53701527614567, 224.4418331374853, 1),
        new Star(387.77908343125733, 264.3948296122209, 1),
        new Star(251.46886016451234, 296.1222091656874, 2),
        new Star(203.29024676850764, 340.7755581668625, 3),
        new Star(74.03055229142186, 445.358401880141, 2),
        new Star(500.58754406580493, 392.4794359576968, 1),
        new Star(779.0834312573443, 273.79553466509986, 4),
        new Star(1000, 470.0352526439483, 2)
    ], [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,13],[13,14],[6,7],[7,8],[8,9],[9,10],[10,11],[7,12]]),
    "Libra": new Constellation(1, 1, 0, 0, 1, 1, [
        new Star(0, 777.4193548387096, 1),
        new Star(158.06451612903226, 487.09677419354836, 2),
        new Star(158.06451612903226, 0, 4),
        new Star(819.3548387096773, 129.03225806451613, 4),
        new Star(999.9999999999999, 777.4193548387096, 2)
    ], [[0,1],[1,2],[2,3],[3,4],[4,1]]),
    "Aquila": new Constellation(2, 1, 0, 0, 1, 1, [
        new Star(0, 2.0533880903490758, 2),
        new Star(174.53798767967143, 147.84394250513344, 1),
        new Star(404.5174537987679, 365.5030800821355, 2),
        new Star(917.8644763860368, 312.11498973305953, 3),
        new Star(999.9999999999999, 340.86242299794657, 2),
        new Star(199.17864476386035, 724.8459958932237, 2),
        new Star(490.7597535934291, 0, 4),
        new Star(371.66324435318273, 8.213552361396303, 1),
        new Star(581.1088295687885, 4.1067761806981515, 2)
    ], [[0,1],[1,2],[2,3],[3,4],[5,2],[2,6],[6,7],[6,8]]),
    "Pisces": new Constellation(3, 1, 0, 0, 1, 1, [
        new Star(0, 750.8455467869221, 2),
        new Star(83.42728297632469, 580.6087936865839, 2),
        new Star(148.8162344983089, 422.77339346110483, 2),
        new Star(220.96956031567078, 184.89289740698985, 2),
        new Star(255.91882750845545, 0, 4),
        new Star(181.510710259301, 124.01352874859074, 2),
        new Star(51.860202931228855, 733.934611048478, 2),
        new Star(118.37655016910935, 667.4182638105975, 2),
        new Star(184.89289740698985, 642.6155580608794, 2),
        new Star(340.4735062006764, 576.0992108229989, 2),
        new Star(430.66516347237877, 576.0992108229989, 2),
        new Star(590.7553551296504, 525.3664036076663, 2),
        new Star(723.7880496054114, 531.0033821871476, 2),
        new Star(847.8015783540022, 536.6403607666291, 3),
        new Star(915.445321307779, 502.8184892897407, 3),
        new Star(999.9999999999999, 564.825253664036, 4),
        new Star(949.2671927846674, 626.8320180383314, 3),
        new Star(853.4385569334836, 632.4689966178128, 3)
    ], [[0,1],[1,2],[2,3],[3,4],[4,5],[5,3],[0,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15],[15,16],[16,17],[17,13]]),
    "Sagittarius": new Constellation(0, 2, 0, 0, 1, 1, [
        new Star(0, 508.65800865800867, 1),
        new Star(186.14718614718615, 461.038961038961, 2),
        new Star(207.7922077922078, 383.1168831168831, 2),
        new Star(419.9134199134199, 500, 4),
        new Star(402.5974025974026, 634.1991341991342, 3),
        new Star(129.87012987012986, 829.004329004329, 1),
        new Star(112.55411255411255, 1132.034632034632, 1),
        new Star(445.8874458874459, 1266.2337662337661, 1),
        new Star(744.5887445887446, 1370.1298701298701, 2),
        new Star(1000, 1194.8051948051948, 1),
        new Star(826.8398268398269, 1093.073593073593, 1),
        new Star(512.987012987013, 655.8441558441558, 3),
        new Star(909.0909090909091, 478.35497835497836, 4),
        new Star(502.16450216450215, 432.9004329004329, 2),
        new Star(761.9047619047619, 313.8528138528138, 2),
        new Star(880.952380952381, 216.45021645021646, 3),
        new Star(919.91341991342, 0, 1),
        new Star(556.2770562770563, 244.5887445887446, 2),
        new Star(491.34199134199133, 0, 2)
    ], [[0,1],[1,2],[2,3],[3,4],[4,11],[11,14],[14,3],[4,5],[5,6],[6,7],[7,8],[8,9],[8,10],[11,12],[12,14],[12,15],[15,16],[15,14],[14,17],[17,13],[13,14],[17,18]]),
    "Capricornus": new Constellation(1, 2, 0, 0, 1, 1, [
        new Star(0, 627.6595744680851, 2),
        new Star(53.191489361702125, 521.2765957446809, 3),
        new Star(553.1914893617021, 446.8085106382979, 3),
        new Star(734.0425531914893, 468.0851063829787, 2),
        new Star(925.531914893617, 478.72340425531917, 3),
        new Star(1000, 500, 4),
        new Star(776.595744680851, 212.7659574468085, 4),
        new Star(425.531914893617, 0, 2),
        new Star(361.70212765957444, 68.08510638297872, 2)
    ], [[0,1],[1,2],[2,3],[3,4],[4,5],[3,6],[6,2],[2,7],[1,8]]),
    "Virgo": new Constellation(2, 2, 0, 0, 1, 1, [
        new Star(0, 179.31034482758622, 1),
        new Star(248.27586206896552, 197.24137931034485, 1),
        new Star(393.1034482758621, 248.27586206896552, 2),
        new Star(13.793103448275863, 351.72413793103453, 1),
        new Star(162.75862068965517, 362.7586206896552, 1),
        new Star(176.55172413793105, 455.1724137931035, 2),
        new Star(434.4827586206897, 482.75862068965523, 4),
        new Star(682.7586206896552, 282.7586206896552, 3),
        new Star(808.2758620689656, 275.86206896551727, 2),
        new Star(1000.0000000000001, 117.24137931034484, 1),
        new Star(606.896551724138, 172.41379310344828, 2),
        new Star(579.3103448275863, 0, 2)
    ], [[0,1],[1,2],[3,4],[4,5],[5,6],[2,6],[6,7],[7,10],[10,2],[10,11],[7,8],[8,9]]),
    "Leo": new Constellation(3, 2, 0, 0, 1, 1, [
        new Star(0, 477.23132969034606, 3),
        new Star(295.08196721311475, 442.6229508196721, 2),
        new Star(872.4954462659381, 522.7686703096539, 4),
        new Star(859.7449908925319, 349.72677595628414, 1),
        new Star(739.5264116575592, 253.18761384335153, 3),
        new Star(289.6174863387978, 264.1165755919854, 3),
        new Star(750.4553734061931, 122.04007285974498, 2),
        new Star(928.9617486338798, 0, 1),
        new Star(1000, 67.39526411657559, 2)
    ], [[0,1],[1,2],[2,3],[3,4],[4,5],[5,1],[4,6],[6,7],[7,8]]),
    "Cancer": new Constellation(0, 3, 0, 0, 1, 1, [
        new Star(0, 622.8813559322034, 3),
        new Star(421.6101694915254, 131.35593220338984, 3),
        new Star(608.0508474576271, 114.40677966101696, 3),
        new Star(985.1694915254238, 334.7457627118644, 3),
        new Star(1000.0000000000001, 0, 3),
        new Star(33.898305084745765, 4.237288135593221, 3)
    ], [[0,1],[1,2],[2,3],[2,4],[1,5]]),
    "Ursa Major": new Constellation(1, 3, 0, 0, 1, 1, [
        new Star(0, 74.40476190476191, 2),
        new Star(136.9047619047619, 22.321428571428573, 2),
        new Star(226.1904761904762, 52.083333333333336, 2),
        new Star(340.7738095238095, 81.8452380952381, 1),
        new Star(379.4642857142857, 175.5952380952381, 2),
        new Star(553.5714285714286, 156.25, 2),
        new Star(565.4761904761905, 34.226190476190474, 2),
        new Star(813.9880952380953, 0, 1),
        new Star(1000, 4.464285714285714, 1),
        new Star(769.3452380952381, 104.16666666666667, 2),
        new Star(776.7857142857143, 215.77380952380952, 1),
        new Star(849.702380952381, 269.34523809523813, 2),
        new Star(989.5833333333334, 334.82142857142856, 2),
        new Star(979.1666666666667, 357.14285714285717, 2),
        new Star(364.58333333333337, 303.57142857142856, 2),
        new Star(479.1666666666667, 409.2261904761905, 2),
        new Star(681.547619047619, 473.2142857142857, 2),
        new Star(657.7380952380953, 502.9761904761905, 3)
    ], [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,3],[6,7],[7,8],[8,9],[9,10],[10,5],[10,11],[11,12],[11,13],[4,14],[14,15],[15,16],[15,17]]),
    "Cetus": new Constellation(2, 3, 0, 0, 1, 1, [
        new Star(157.80998389694042, 257.6489533011272, 2),
        new Star(215.78099838969405, 301.12721417069247, 1),
        new Star(357.487922705314, 293.0756843800322, 1),
        new Star(391.304347826087, 529.7906602254428, 1),
        new Star(399.3558776167472, 586.1513687600644, 1),
        new Star(475.04025764895334, 565.2173913043479, 1),
        new Star(700.4830917874397, 412.23832528180355, 2),
        new Star(1000, 254.42834138486313, 3),
        new Star(780.9983896940419, 186.79549114331724, 2),
        new Star(684.3800322061192, 201.28824476650564, 2),
        new Star(587.7616747181964, 334.9436392914654, 2),
        new Star(458.93719806763283, 489.5330112721417, 1),
        new Star(991.9484702093398, 0, 2),
        new Star(53.14009661835749, 307.56843800322065, 2),
        new Star(0, 202.8985507246377, 1),
        new Star(54.750402576489535, 127.21417069243157, 2),
        new Star(159.42028985507247, 104.66988727858293, 2),
        new Star(161.0305958132045, 186.79549114331724, 2),
        new Star(227.05314009661836, 46.69887278582931, 2)
    ], [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,12],[7,8],[8,9],[9,10],[10,11],[11,3],[0,13],[13,14],[14,15],[15,16],[16,17],[17,0],[16,18]]),
    "Centaurus": new Constellation(3, 3, 0, 0, 1, 1, [
        new Star(196.39278557114227, 66.1322645290581, 3),
        new Star(336.67334669338675, 180.36072144288576, 1),
        new Star(342.6853707414829, 200.4008016032064, 1),
        new Star(318.63727454909815, 278.5571142284569, 1),
        new Star(356.7134268537074, 338.6773547094188, 2),
        new Star(709.4188376753506, 312.625250501002, 3),
        new Star(771.5430861723446, 342.6853707414829, 1),
        new Star(861.7234468937875, 354.7094188376753, 2),
        new Star(999.9999999999999, 470.94188376753505, 1),
        new Star(961.9238476953907, 729.4589178356713, 1),
        new Star(474.94989979959917, 480.96192384769535, 3),
        new Star(450.9018036072144, 705.4108216432865, 4),
        new Star(320.6412825651302, 769.5390781563126, 4),
        new Star(114.22845691382764, 282.565130260521, 3),
        new Star(0, 338.6773547094188, 2),
        new Star(416.8336673346693, 90.18036072144288, 1),
        new Star(454.9098196392785, 0, 2)
    ], [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[4,10],[10,11],[11,12],[2,13],[13,14],[1,15],[15,16]]),
    "Hercules": new Constellation(0, 4, 0, 0, 1, 1, [
        new Star(25.936599423631122, 305.47550432276654, 1),
        new Star(0, 559.0778097982709, 1),
        new Star(190.20172910662825, 570.6051873198847, 2),
        new Star(351.5850144092219, 559.0778097982709, 3),
        new Star(538.9048991354467, 760.806916426513, 3),
        new Star(530.2593659942363, 789.6253602305476, 1),
        new Star(553.314121037464, 832.8530259365994, 1),
        new Star(631.1239193083574, 1086.4553314121038, 2),
        new Star(247.8386167146974, 1066.2824207492795, 2),
        new Star(976.9452449567723, 0, 2),
        new Star(933.7175792507204, 121.03746397694525, 3),
        new Star(610.9510086455331, 409.22190201729103, 3),
        new Star(708.9337175792507, 547.550432276657, 2),
        new Star(1000, 731.9884726224784, 1),
        new Star(985.5907780979827, 890.4899135446685, 3),
        new Star(953.8904899135447, 1008.6455331412103, 2),
        new Star(1000, 1086.4553314121038, 2),
        new Star(997.1181556195966, 570.6051873198847, 3)
    ], [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[3,11],[11,12],[12,4],[11,10],[10,9],[12,13],[13,14],[14,15],[15,16],[13,17]]),
    "Lepus": new Constellation(1, 4, 0, 0, 1, 1, [
        new Star(0, 78.65168539325843, 2),
        new Star(185.3932584269663, 42.134831460674164, 3),
        new Star(353.9325842696629, 115.1685393258427, 3),
        new Star(570.2247191011236, 376.4044943820225, 3),
        new Star(617.9775280898876, 609.5505617977528, 4),
        new Star(311.7977528089888, 696.6292134831461, 3),
        new Star(207.86516853932585, 561.7977528089888, 3),
        new Star(938.2022471910113, 345.5056179775281, 3),
        new Star(991.5730337078652, 794.9438202247192, 3),
        new Star(859.5505617977528, 78.65168539325843, 2),
        new Star(865.1685393258427, 8.426966292134832, 1),
        new Star(971.9101123595507, 78.65168539325843, 2),
        new Star(1000.0000000000001, 0, 1)
    ], [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,3],[3,7],[7,8],[8,4],[7,9],[9,10],[7,11],[11,12]]),
    "Pegasus": new Constellation(2, 4, 0, 0, 1, 1, [
        new Star(0, 95.85121602288984, 3),
        new Star(170.24320457796853, 0, 2),
        new Star(396.28040057224604, 127.3247496423462, 2),
        new Star(427.7539341917024, 170.24320457796853, 1),
        new Star(545.0643776824035, 261.80257510729615, 3),
        new Star(1000, 317.59656652360513, 3),
        new Star(895.5650929899857, 699.5708154506437, 3),
        new Star(497.85407725321886, 620.8869814020029, 2),
        new Star(420.6008583690987, 517.8826895565093, 2),
        new Star(399.14163090128756, 484.9785407725322, 1),
        new Star(155.93705293276108, 522.1745350500715, 2),
        new Star(15.736766809728183, 391.9885550786838, 2),
        new Star(370.52932761087266, 663.8054363376251, 2),
        new Star(173.10443490701002, 742.4892703862661, 1)
    ], [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,4],[7,8],[8,9],[9,10],[10,11],[7,12],[12,13]]),
    "Perseus": new Constellation(3, 4, 0, 0, 1, 1, [
        new Star(40.856031128404666, 385.21400778210113, 2),
        new Star(0, 120.62256809338521, 3),
        new Star(128.4046692607004, 38.91050583657587, 1),
        new Star(280.1556420233463, 0, 3),
        new Star(601.1673151750973, 0, 2),
        new Star(727.6264591439689, 77.82101167315174, 4),
        new Star(883.2684824902724, 126.45914396887159, 3),
        new Star(1000, 153.69649805447472, 2),
        new Star(445.52529182879374, 311.284046692607, 3),
        new Star(383.2684824902724, 369.64980544747084, 2),
        new Star(416.34241245136184, 472.7626459143969, 1)
    ], [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[5,8],[8,9],[9,10]]),
    "Boötes": new Constellation(4, 0, 0, 0, 1, 1, [
        new Star(200.354609929078, 274.822695035461, 4),
        new Star(549.645390070922, 205.6737588652482, 3),
        new Star(852.8368794326241, 132.9787234042553, 1),
        new Star(999.9999999999999, 347.5177304964539, 2),
        new Star(836.8794326241134, 480.4964539007092, 3),
        new Star(599.2907801418439, 347.5177304964539, 2),
        new Star(138.29787234042553, 0, 1),
        new Star(101.06382978723404, 416.66666666666663, 3),
        new Star(0, 416.66666666666663, 2)
    ], [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[6,0],[0,7],[7,8]]),
    "Cygnus": new Constellation(4, 1, 0, 0, 1, 1, [
        new Star(0, 2.0080321285140563, 2),
        new Star(72.28915662650603, 70.28112449799197, 2),
        new Star(339.3574297188755, 150.60240963855424, 3),
        new Star(524.0963855421687, 415.66265060240966, 4),
        new Star(751.004016064257, 624.4979919678715, 3),
        new Star(859.4377510040161, 865.4618473895583, 2),
        new Star(855.421686746988, 1138.55421686747, 1),
        new Star(321.285140562249, 536.1445783132531, 3),
        new Star(728.9156626506025, 222.89156626506025, 1),
        new Star(1000, 0, 2)
    ], [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[7,3],[3,8],[8,9]])
};

/** @type {{[key:string] : Constellation }} */
const UnnormalizedConstellationInfo = {
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