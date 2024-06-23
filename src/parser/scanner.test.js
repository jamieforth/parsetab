import { expect, test } from '@jest/globals';
import { makeScanner, makeRules } from 'parsetab/parser/scanner';

const tokens = {
  SPACE: {
    'single space': ' ',
    'multiple spaces': '  ',
    'single newline': '\n',
    'multiple newlines': '\n\n',
    'mixed': ' \n  \n\n',
  },
  PAGE: {
    'page break': '{>}',
  },
  SYSTEM: {
    'system break': '{^}',
  },
  BAR: {
    'single': '|',
    'non counting dashed bar': '|=0',
    'non counting bar': '|0',
    'dashed bar': '|=',
    'two-side repeat double bar': ':||:',
    'two-side repeat bar': ':|:',
    'LH repeat double bar': ':||',
    'LH repeat bar': ':|',
    'RH repeat double bar': '||:',
    'RH repeat bar': '|:',
    'double bar': '||',
  },
  METRE: {
    'M(3)': 'M(3)',
    'M(C)': 'M(C)',
    'M(C.)': 'M(C.)',
    'M(C/)': 'M(C/)',
    'M(C.:3)': 'M(C.:3)',
    'M(C.;3)': 'M(C.;3)',
    'M(C/:3)': 'M(C/:3)',
    'M(C/;3)': 'M(C/;3)',
    'M(O:3)': 'M(O:3)',
  },
  RHYTHM_FLAG: {
    'duration': 'Q',
    'dotted duration': 'Q.',
    'fermata': 'F',
  },
  BEAM: {
    'quaver beam start': '[',
    'quaver beam end': ']',
    'semi-quaver beam start': '[[',
    'semi-quaver beam end': ']]',
    'demisemiquaver beam start': '[[[',
    'demisemiquaver beam end': ']]]',
    'hemidemisemiquaver beam start': '[[[[',
    'hemidemisemiquaver beam end': ']]]]',
    'semihemidemisemiquaver beam start': ']]]]]',
    'semihemidemisemiquaver beam end': ']]]]]',
  },
  TUPLE: {
    'explicit triplet': '3(2E)',
    'semi-implicit triplet': '3(E)',
    'implicit triplet': '3',
    'editorial triple': '[3](2E)',
    'editorial semi-implicit triple': '[3](E)',
    'editorial implicit triple': '[3]',
  },
  MAIN_COURSE_REF: {
    'highest course': '-1',
    'lowest course': '-6',
  },
  MAIN_PITCH: {
    'lowest open string': 'a6',
    'first fret top string': 'b1',
  },
  BASS_PITCH: {
    'first bass course open': 'Xa',
    'second bass course open': 'Xa/',
    'third bass course open': 'Xa//',
    'fourth bass course open': 'Xa///',
    'first bass course open shorthand': 'X1',
    'second bass course open shorthand': 'X2',
    'third bass course open shorthand': 'X3',
    'fourth bass course open shorthand': 'X4',
  },
  FINGERING: {
    'left hand, fourth finger, pos=3': '(Fl4:3)',
    'left hand dot, pos=3': '(Fl.:3)',
    'right hand dot, pos=3': '(Fr.:7)',
    'implicit right hand dot, pos=7': '(F.:7)',
    'right hand dot, pos=7 shorthand': '.',
    'right hand two dots, pos=7': '(Fr..:7)',
    'right hand two dots, pos=7 shorthand': ':',
    'left hand three dots, pos=3': '(Fl...:3)',
    'left hand four dots, pos=3': '(Fl....:3)',
    'short horizontal stroke in pos 6, 7 or 8 (r.h. thumb)': '(Fr-:6)',
    // FIXME: Is this the correct interpretation of a dash followed by a
    // letter, e.g. '-d2'?
    'short horizontal stroke in pos 6, 7 or 8 (r.h. thumb) shorthand': '-',
    'short vertical stroke in pos 7 (r.h. thumb)': '(Fr!:7)',
    'short vertical stroke in pos 7 (r.h. thumb) shorthand': '!',
    'pair of short vertical strokes in pos 7 (r.h. finger 2)': '(Fr":7)',
    'pair of short vertical strokes in pos 7 (r.h. finger 2) shorthand': '"',
  },
  LINE_TYPE_AB: {
    'straight line start pos 8': '(C34:8)',
    'straight line end pos 6': '(C-34:6)',
    'curved line (up) 34 start pos 3': '(C34:-63)',
    'curved line 34 end pos 4': '(C-34:4)',
    'slurred default (up)': '(C)',
    'slurred upward shorthand': '(Cu)',
    'slurred downward shorthand': '(Cd)',
  },
  LINE_TYPE_C: {
    'ensemble line default': '(E)',
    // FIXME: Is length a number of lines or something indicating start/end
    // position?
    'ensemble line with length': '(E3)',
  },
  LINE_TYPE_D: {
    'separée line default (up, centred)': '(S)',
    'separée line default (up, centred) shorthand': '/',
    'separée line up, centred': '(Su)',
    'separée line down, centred': '(Sd)',
    'separée line up, left': '(Su:l)',
    'separée line up, right': '(Su:r)',
    'separée line down, left': '(Sd:l)',
    'separée line down, right': '(Sd:r)',
  },
  ORNAMENT: {
    'backfall single': '(Oa1:5)',
    'backfall single shorthand': ',',
    'backfall multiple': '(Oa3:5)',
    // Abzug encoded as a slur, e.g. 'e1(C34:-67) c1(C-34:7)'.
    'forefall type 1': '(Oc1:7)',
    'forefall type 1 shorthand': 'u',
    'forefall type 2': '(Oc2:4)',
    'forefall type 2 shorthand': '<',
    'etoufement': '(Od:5)',
    'bebung': '(Oe:3)',
    'bebung shorthand': '#',
    'martellement': '(Of:3)',
    'martellement shorthand': 'x',
    'mordant': '(Og:5)',
    'bebung (weiss)': '(Oh:3)',
    'bebung (weiss) shorthand': '~',
    'kurzer mordent': '(Oi:5)',
    'kurzes trillo': '(Oj:5)',
    'turn': '(Ok:3)',
    'circulo mezzo': '(Ol:5)',
    // FIXME: Is this the correct interpretation of an asterisk after a null
    // pitch, e.g. '-3*'?
    'unknown ornament shorthand?': '*',
  },
  RULESET: {
    'italian rule': `{<rules>
 <notation>italian</notation>
<pitch>67</pitch>
<tuning>( -5 -5 -4 -5 -5 -2 -1 -2 -2 -1 -2)</tuning>
</rules>}`,
  },
};

const rules = makeRules();

function testTokenMatch(targetType, tokens) {
  Object.entries(tokens).forEach(([name, value]) => {
    test(`tokenise ${targetType}: ${name} '${value.replaceAll('\n', '\\n')}'`, () => {
      const rule = rules[targetType];
      rule.lastIndex = 0;
      expect(rule.exec(value)[0]).toBe(value);
    });
  });
}

function testTokenReject(targetType, tokens) {
  Object.entries(tokens).forEach(([tokenType, tokens]) => {
    if (tokenType != targetType) {
      Object.entries(tokens).forEach(([name, value]) => {
        test(
          `tokenise ${targetType} not ${tokenType}: ${name} '${value.replaceAll('\n', '\\n')}'`,
          () => {
            const rule = rules[targetType];
            rule.lastIndex = 0;
            expect(rule.test(value)).toBe(false);
          },
        );
      });
    }
  });
}

// Test all regex match correct pattern.
Object.entries(tokens).forEach(([targetType, tokens]) => {
  testTokenMatch(targetType, tokens);
});

// Test all regex reject other patterns.
Object.keys(tokens).forEach((targetType) => {
  testTokenReject(targetType, tokens);
});

const tabcodes = {
  'B1574-7_78.tc': `{<rules>
 <notation>french</notation>
<pitch>67</pitch>
<tuning>( -5 -5 -4 -5 -5 -2 -1 -2 -2 -1 -2)</tuning>
</rules>}

 {6:"c6"=(218,320,242,348;6,66,88)} {6:"b6"=(281,310,304,336;7,130,209)} {6:"c6"=(306,320,321,337;8,35,13)} {6:"a6"=(322,317,357,339;8,195,73)} M(C/) {6:"k6"=(361,305,383,337;10,3,193)} [[b2d3a5{2:"b2"=(487,162,509,189;11,68,57)3:"d3"=(476,200,503,226;11,228,117)5:"a5"=(480,274,503,296;12,132,177)} ]]b2d3{2:"b2"=(523,162,547,189;13,36,237)3:"d3"=(515,199,540,225;13,197,41)} |{BAR:"|"=(553,132,563,299;14,101,102)} [[a2b3a4d6{2:"a2"=(578,168,594,188;15,165,222)3:"b3"=(578,197,601,225;16,70,26)4:"a4"=(576,238,596,258;16,230,86)6:"d6"=(573,304,606,332;17,134,146)} a1a2b3a6{1:"a1"=(614,131,634,151;18,38,206)2:"a2"=(613,167,630,188;18,199,10)3:"b3"=(615,196,638,225;19,103,70)6:"a6"=(615,308,641,330;20,7,130)} a1a2a3c5{1:"a1"=(651,131,671,154;20,167,190)2:"a2"=(650,168,671,189;21,71,250)3:"a3"=(651,203,670,224;21,232,55)5:"c5"=(651,272,670,297;22,136,115)} ]]e2a3c5{2:"e2"=(690,166,704,189;23,40,175)3:"a3"=(686,204,705,225;23,200,235)5:"c5"=(687,273,704,299;24,105,39)} |{BAR:"|"=(718,130,727,297;25,9,99)} Qa1a2c3a6{FLAG:"Q"=(745,72,771,121;25,169,159)1:"a1"=(739,134,759,155;26,73,219)2:"a2"=(739,170,760,191;26,234,23)3:"c3"=(743,203,760,227;27,138,83)6:"a6"=(731,311,762,334;28,42,143)} |:{BAR:"|"=(772,132,780,299;28,202,204)} |{BAR:"|"=(826,134,835,301;31,235,248)} [[a1a2b3a6{1:"a1"=(849,134,869,156;33,44,112)2:"a2"=(848,171,869,191;33,204,172)3:"b3"=(850,200,874,229;34,108,232)6:"a6"=(840,312,872,335;35,13,36)} ]]a1{1:"a1"=(884,135,905,157;35,173,97)} |{BAR:"|"=(918,134,926,301;36,77,157)} [[b2d3a5{2:"b2"=(943,164,966,192;37,142,21)3:"d3"=(935,202,960,229;38,46,81)5:"a5"=(938,275,961,298;38,206,141)} d3{3:"d3"=(971,201,998,229;39,110,201)} d2d3a4{2:"d2"=(1009,166,1035,193;40,15,5)3:"d3"=(1010,201,1036,228;40,175,65)4:"a4"=(1013,240,1037,262;41,79,125)} ]]d2{2:"d2"=(1048,166,1073,193;41,239,185)} |{BAR:"|"=(1084,134,1097,300;42,143,245)} [[a2c3a6{2:"a2"=(1108,167,1131,189;43,208,110)3:"c3"=(1110,201,1130,226;44,112,170)6:"a6"=(1102,308,1133,331;45,16,230)} c3{3:"c3"=(1147,201,1165,225;45,177,34)} d3c4a5{3:"d3"=(1175,200,1199,227;46,81,94)4:"c4"=(1183,238,1203,262;46,241,154)5:"a5"=(1179,275,1202,298;47,145,214)} ]]b2d3a5{2:"b2"=(1224,163,1246,190;48,50,18)3:"d3"=(1216,201,1237,228;48,210,78)5:"a5"=(1216,275,1237,297;49,114,138)} |{BAR:"|"=(1251,131,1264,297;50,18,199)} [[a2c3a6{2:"a2"=(1275,168,1295,188;51,83,63)3:"c3"=(1277,202,1293,225;51,243,123)6:"a6"=(1269,310,1298,332;52,147,183)} d3c6{3:"d3"=(1306,199,1329,227;53,51,243)6:"c6"=(1304,309,1338,334;53,212,47)} a4{4:"a4"=(1348,240,1369,261;54,116,107)} ]]c3c4a6{3:"c3"=(1389,202,1410,227;55,20,167)4:"c4"=(1388,238,1406,261;55,180,227)6:"a6"=(1380,310,1417,333;56,85,31)} |{BAR:"|"=(1421,131,1432,296;56,245,92)} Qd3c4a5{FLAG:"Q"=(1437,71,1463,120;57,149,152)3:"d3"=(1440,199,1462,226;58,53,212)4:"c4"=(1446,238,1462,261;58,214,16)5:"a5"=(1440,274,1461,297;59,118,76)} |:{BAR:"|"=(1476,129,1487,297;60,182,196)} |{BAR:"|"=(1529,131,1543,299;63,215,240)}
`,
  'B1574-7_79.tc': `{<rules>
 <notation>french</notation>
<pitch>67</pitch>
<tuning>( -5 -5 -4 -5 -5 -2 -1 -2 -2 -1 -2)</tuning>
</rules>}

 {6:"g6"=(213,615,228,644;66,88,225)} M(C/) {6:"d6"=(266,606,344,635;68,57,149)} {6:"f6"=(346,601,357,632;68,217,209)} {6:"c6"=(357,615,370,633;69,122,13)} [[f1c2d3a5{1:"f1"=(403,420,424,453;71,90,194)2:"c2"=(403,461,420,485;71,250,254)3:"d3"=(392,494,420,522;72,155,58)5:"a5"=(396,569,419,592;73,59,118)} ]]e1a2a6{1:"e1"=(442,425,457,448;73,219,178)2:"a2"=(436,463,459,484;74,123,238)6:"a6"=(430,604,460,628;75,28,42)} |{BAR:"|"=(470,426,481,591;75,188,102)} [[c1c2d3c6{1:"c1"=(495,423,514,447;76,252,222)2:"c2"=(495,459,512,481;77,157,26)3:"d3"=(486,492,510,519;78,61,87)6:"c6"=(482,600,515,626;78,221,147)} a1a2c3e6{1:"a1"=(531,424,552,446;79,125,207)2:"a2"=(529,461,552,481;80,30,11)3:"c3"=(530,493,550,518;80,190,71)6:"e6"=(519,599,553,624;81,94,131)} a1c2d3a5{1:"a1"=(569,424,588,446;81,254,191)2:"c2"=(570,458,588,482;82,158,251)3:"d3"=(560,491,586,518;83,63,55)5:"a5"=(566,565,588,589;83,223,115)} ]]e2a3c5{2:"e2"=(607,457,623,480;84,127,175)3:"a3"=(603,495,623,516;85,31,235)5:"c5"=(605,564,620,590;85,192,40)} |{BAR:"|"=(638,421,646,588;86,96,100)} Qa1a2c3a6{FLAG:"Q"=(658,363,685,411;87,0,160)1:"a1"=(660,422,680,445;87,160,220)2:"a2"=(660,459,679,479;88,65,24)3:"c3"=(661,492,678,516;88,225,84)6:"a6"=(655,599,688,624;89,129,144)} |:{BAR:"|"=(693,421,702,589;90,33,204)} |{BAR:"|"=(747,423,757,592;93,66,249)} [[[d3c4a5{3:"d3"=(764,494,788,519;94,131,113)4:"c4"=(771,530,788,554;95,35,173)5:"a5"=(766,567,790,590;95,195,233)} a2{2:"a2"=(807,460,829,483;96,100,37)} c2{2:"c2"=(847,460,866,485;97,4,97)} ]]]d2{2:"d2"=(875,457,901,485;97,164,157)} |{BAR:"|"=(911,424,923,592;98,68,217)} [[a1c2d3a5{1:"a1"=(936,425,957,448;99,133,81)2:"c2"=(939,460,957,484;100,37,142)3:"d3"=(932,494,955,521;100,197,202)5:"a5"=(933,567,955,590;101,102,6)} c1d2d3a4{1:"c1"=(976,425,996,449;102,6,66)2:"d2"=(967,458,994,486;102,166,126)3:"d3"=(966,493,993,521;103,70,186)4:"a4"=(969,532,993,555;103,230,246)} d2a3c5{2:"d2"=(1006,458,1031,485;104,135,50)3:"a3"=(1008,501,1031,521;105,39,110)5:"c5"=(1011,567,1030,593;105,199,170)} ]]a1a2b3a6{1:"a1"=(1049,427,1071,450;106,103,230)2:"a2"=(1049,464,1069,485;107,8,35)3:"b3"=(1050,492,1074,522;107,168,95)6:"a6"=(1047,603,1077,627;108,72,155)} |{BAR:"|"=(1081,425,1092,592;108,232,215)} [[c2d3c4a5{2:"c2"=(1108,461,1126,485;110,41,79)3:"d3"=(1099,494,1123,522;110,201,139)4:"c4"=(1104,532,1123,556;111,105,199)5:"a5"=(1101,569,1123,590;112,10,3)} ]]a1{1:"a1"=(1141,428,1164,450;112,170,63)} [[[a2a3a4c5{2:"a2"=(1178,462,1199,483;113,234,184)3:"a3"=(1177,497,1199,519;114,138,244)4:"a4"=(1174,533,1199,555;115,43,48)5:"c5"=(1177,567,1197,593;115,203,108)} c2{2:"c2"=(1219,460,1237,484;116,107,168)} d2{2:"d2"=(1248,461,1273,485;117,11,228)} ]]]a2{2:"a2"=(1291,461,1311,483;117,172,32)} |{BAR:"|"=(1322,424,1333,591;118,76,92)} Qc2d3c4a5{FLAG:"Q"=(1345,365,1373,414;118,236,152)2:"c2"=(1347,460,1365,484;119,140,212)3:"d3"=(1338,493,1363,520;120,45,16)4:"c4"=(1344,531,1362,555;120,205,76)5:"a5"=(1341,568,1364,590;121,109,137)} |:{BAR:"|"=(1375,424,1387,593;122,13,197)} |{BAR:"|"=(1434,423,1444,591;125,46,241)} [[[d3c4a5{3:"d3"=(1452,493,1476,519;127,15,165)4:"c4"=(1457,531,1476,554;127,175,225)5:"a5"=(1454,569,1474,590;128,80,30)} a2{2:"a2"=(1494,461,1515,484;128,240,90)} c2 {2:"c2"=(1535,461,1552,485;129,144,150)} ]]]d2{2:"d2"=(1564,458,1589,485;130,48,210)} |{BAR:"|"=(1601,424,1613,592;130,209,14)} [[a1c2d3a5{1:"a1"=(1627,427,1647,448;132,17,134)2:"c2"=(1629,460,1647,482;132,177,194)3:"d3"=(1619,493,1644,521;133,81,254)5:"a5"=(1621,568,1643,591;133,242,58)} c2d3a5{2:"c2"=(1665,461,1683,484;134,146,118)3:"d3"=(1655,494,1680,521;135,50,179)5:"a5"=(1658,569,1679,592;135,210,239)} d2a3c5{2:"d2"=(1694,458,1719,486;136,115,43)3:"a3"=(1698,499,1718,520;137,19,103)5:"c5"=(1699,569,1718,594;137,179,163)} ]]a1e5{1:"a1"=(1736,429,1756,450;138,83,223)5:"e5"=(1738,569,1753,593;138,244,27)} |{BAR:"|"=(1766,429,1777,595;139,148,87)} [[c1a4{1:"c1"=(1795,427,1813,451;140,212,207)4:"a4"=(1792,535,1812,556;141,117,11)} ]]a1a2b3a6{1:"a1"=(1828,428,1851,451;142,21,71)2:"a2"=(1827,463,1848,485;142,181,132)3:"b3"=(1830,493,1853,522;143,85,192)6:"a6"=(1819,605,1853,629;143,245,252)}
`,
};

// Test scanned tabcodes can regenerate original.
function testTabcodeIdentity(name, tabcode) {
  test(`tokenise ${name}`, () => {
    const scanner = makeScanner(tabcode);
    const tokens = [...scanner];
    const scanned = tokens.map(token => token.code).join('');
    expect(scanned).toEqual(tabcode);
  });
};

Object.entries(tabcodes).forEach(([name, tabcode]) => {
  testTabcodeIdentity(name, tabcode);
});
