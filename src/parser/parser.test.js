import { expect, test } from '@jest/globals';
import { parse } from 'parsetab/parser';
import {
  Barline,
  Chord,
  Comment,
  Duration,
  Metre,
  PageBreak,
  Pitch,
  Rest,
  SystemBreak,
  TabNote,
} from 'parsetab/parser/tabclasses';

const space = {
  'single space': (
    (tabcode = ' ') => ({
      tabcode: tabcode,
      expected: [],
    }))(),
  'mixed space': (
    (tabcode = '\n  \r\n') => ({
      tabcode: tabcode,
      expected: [],
    }))(),
};

const comments = {
  'regular comment': (
    (tabcode = '{This is a comment.}') => ({
      tabcode: tabcode,
      expected: [new Comment(tabcode)],
    }))(),
  'nested comment{': (
    (tabcode = '{This is a comment {inside a comment}.}') => ({
      tabcode: tabcode,
      expected: [new Comment(tabcode)],
    }))(),
};

const breaks = {
  'page break': (
    (tabcode = '{>}') => ({
      tabcode: tabcode,
      expected: [new PageBreak(tabcode, 1)],
    }))(),
  'page break with context': (
    (tabcode = '{>}', context = { pageNum: 2 }) => ({
      tabcode: tabcode,
      context: context,
      expected: [new PageBreak(tabcode, context.pageNum)],
    }))(),
  'system break': (
    (tabcode = '{^}') => ({
      tabcode: tabcode,
      expected: [new SystemBreak(tabcode, 1)],
    }))(),
  'system break with context': (
    (tabcode = '{^}', context = { sysNum: 2 }) => ({
      tabcode: tabcode,
      context: context,
      expected: [new SystemBreak(tabcode, context.sysNum)],
    }))(),
};

const barlines = {
  'single': (
    (tabcode = '|') => ({
      tabcode: tabcode,
      expected: [new Barline(tabcode, 1)],
    }))(),
  'double': (
    (tabcode = '||') => ({
      tabcode: tabcode,
      expected: [new Barline(tabcode, 1, { doubleBar: true })],
    }))(),
  'LH repeat single': (
    (tabcode = ':|') => ({
      tabcode: tabcode,
      expected: [new Barline(tabcode, 1, { lRepeat: true })],
    }))(),
  'LH repeat double': (
    (tabcode = ':||') => ({
      tabcode: tabcode,
      expected: [new Barline(tabcode, 1, {
        lRepeat: true,
        doubleBar: true,
      })],
    }))(),
  'RH repeat single': (
    (tabcode = '|:') => ({
      tabcode: tabcode,
      expected: [new Barline(tabcode, 1, { rRepeat: true })],
    }))(),
  'RH repeat double': (
    (tabcode = '||:') => ({
      tabcode: tabcode,
      expected: [new Barline(tabcode, 1, {
        rRepeat: true,
        doubleBar: true,
      })],
    }))(),
  'two-side repeat single': (
    (tabcode = ':|:') => ({
      tabcode: tabcode,
      expected: [new Barline(tabcode, 1, {
        lRepeat: true,
        rRepeat: true,
      })],
    }))(),
  'two-side repeat double': (
    (tabcode = ':||:') => ({
      tabcode: tabcode,
      expected: [new Barline(tabcode, 1, {
        lRepeat: true,
        rRepeat: true,
        doubleBar: true,
      })],
    }))(),
  'dashed': (
    (tabcode = '|=') => ({
      tabcode: tabcode,
      expected: [new Barline(tabcode, 1, { dashed: true })],
    }))(),
  'non counting': (
    (tabcode = '|0') => ({
      tabcode: tabcode,
      expected: [new Barline(tabcode, 1, { nonCounting: true })],
    }))(),
  'non counting dashed': (
    (tabcode = '|=0') => ({
      tabcode: tabcode,
      expected: [new Barline(tabcode, 1, {
        dashed: true,
        nonCounting: true,
      })],
    }))(),
  'mid-dots barline': (
    (tabcode = '|:|') => ({
      tabcode: tabcode,
      expected: [new Barline(tabcode, 1, { midDots: true })],
    }))(),
};

const metres = {
  '3': (
    (tabcode = 'M(3)') => ({
      tabcode: tabcode,
      expected: [new Metre(tabcode, { components: ['3'] })],
    }))(),
  'C': (
    (tabcode = 'M(C)') => ({
      tabcode: tabcode,
      expected: [new Metre(tabcode, { components: ['C'] })],
    }))(),
  'O': (
    (tabcode = 'M(O)') => ({
      tabcode: tabcode,
      expected: [new Metre(tabcode, { components: ['O'] })],
    }))(),
  'D': (
    (tabcode = 'M(D)') => ({
      tabcode: tabcode,
      expected: [new Metre(tabcode, { components: ['D'] })],
    }))(),
  'C.': (
    (tabcode = 'M(C.)') => ({
      tabcode: tabcode,
      expected: [new Metre(tabcode, {
        components: ['C.'],
      })],
    }))(),
  'C/': (
    (tabcode = 'M(C/)') => ({
      tabcode: tabcode,
      expected: [new Metre(tabcode, {
        components: ['C/'],
      })],
    }))(),
  'C.;3': (
    (tabcode = 'M(C.;3)') => ({
      tabcode: tabcode,
      expected: [new Metre(tabcode, {
        components: ['C.', '3'],
      })],
    }))(),
  'C/;3': (
    (tabcode = 'M(C/;3)') => ({
      tabcode: tabcode,
      expected: [new Metre(tabcode, {
        components: ['C/', '3'],
      })],
    }))(),
  'C.:3': (
    (tabcode = 'M(C.:3)') => ({
      tabcode: tabcode,
      expected: [new Metre(tabcode, {
        components: ['C.', '3'],
        vertical: true,
      })],
    }))(),
  'C/:3': (
    (tabcode = 'M(C/:3)') => ({
      tabcode: tabcode,
      expected: [new Metre(tabcode, {
        components: ['C/', '3'],
        vertical: true,
      })],
    }))(),
  'O:3': (
    (tabcode = 'M(O:3)') => ({
      tabcode: tabcode,
      expected: [new Metre(tabcode, {
        components: ['O', '3'],
        vertical: true,
      })],
    }))(),
};

// Events

const rests = {
  'breve': (
    (tabcode = 'B') => ({
      tabcode: tabcode,
      expected: [new Rest(new Duration(tabcode))],
    }))(),
  'dotted breve': (
    (tabcode = 'B.') => ({
      tabcode: tabcode,
      expected: [new Rest(new Duration(tabcode))],
    }))(),
  'semibreve': (
    (tabcode = 'W') => ({
      tabcode: tabcode,
      expected: [new Rest(new Duration(tabcode))],
    }))(),
  'dotted semibreve': (
    (tabcode = 'W.') => ({
      tabcode: tabcode,
      expected: [new Rest(new Duration(tabcode))],
    }))(),
  'minim': (
    (tabcode = 'H') => ({
      tabcode: tabcode,
      expected: [new Rest(new Duration(tabcode))],
    }))(),
  'dotted minim': (
    (tabcode = 'H.') => ({
      tabcode: tabcode,
      expected: [new Rest(new Duration(tabcode))],
    }))(),
  'crotchet': (
    (tabcode = 'Q') => ({
      tabcode: tabcode,
      expected: [new Rest(new Duration(tabcode))],
    }))(),
  'dotted crotchet': (
    (tabcode = 'Q.') => ({
      tabcode: tabcode,
      expected: [new Rest(new Duration(tabcode))],
    }))(),
  'quaver': (
    (tabcode = 'E') => ({
      tabcode: tabcode,
      expected: [new Rest(new Duration(tabcode))],
    }))(),
  'dotted quaver': (
    (tabcode = 'E.') => ({
      tabcode: tabcode,
      expected: [new Rest(new Duration(tabcode))],
    }))(),
  'semiquaver': (
    (tabcode = 'S') => ({
      tabcode: tabcode,
      expected: [new Rest(new Duration(tabcode))],
    }))(),
  'dotted semiquaver': (
    (tabcode = 'S.') => ({
      tabcode: tabcode,
      expected: [new Rest(new Duration(tabcode))],
    }))(),
  'demisemiquaver': (
    (tabcode = 'T') => ({
      tabcode: tabcode,
      expected: [new Rest(new Duration(tabcode))],
    }))(),
  'dotted demisemiquaver': (
    (tabcode = 'T.') => ({
      tabcode: tabcode,
      expected: [new Rest(new Duration(tabcode))],
    }))(),
  'hemidemisemiquaver': (
    (tabcode = 'Y') => ({
      tabcode: tabcode,
      expected: [new Rest(new Duration(tabcode))],
    }))(),
  'dotted hemidemisemiquaver': (
    (tabcode = 'Y.') => ({
      tabcode: tabcode,
      expected: [new Rest(new Duration(tabcode))],
    }))(),
  'semihemidemisemiquaver': (
    (tabcode = 'Z') => ({
      tabcode: tabcode,
      expected: [new Rest(new Duration(tabcode))],
    }))(),
  'dotted semihemidemisemiquaver': (
    (tabcode = 'Z.') => ({
      tabcode: tabcode,
      expected: [new Rest(new Duration(tabcode))],
    }))(),
};

// Pitch

const mainCourseNotes = {
  'One note': (
    (tabcode = 'a1') => ({
      tabcode: tabcode,
      expected: [
        new Chord([
          new TabNote(new Pitch(tabcode, 'a', 1)),
        ]),
      ],
    }))(),
  'Two notes': (
    (tabcode = 'a1b2') => ({
      tabcode: tabcode,
      expected: [
        new Chord([
          new TabNote(new Pitch(tabcode.substring(0, 2), 'a', 1)),
          new TabNote(new Pitch(tabcode.substring(2, 4), 'b', 2)),
        ]),
      ],
    }))(),
};

const bassCourseNotes = {
}

// Duration.

const rhythm_flags = {
  Breve: (
    (tabcode = 'Ba1') => ({
      tabcode: tabcode,
      expected: [
        new Chord([
          new TabNote(new Pitch(tabcode.substring(1, 3), 'a', 1)),
        ], {
          duration: new Duration(tabcode[0]),
        }),
      ],
    }))(),
};

const beams = {
};

const tuples = {
};

// const lines = {
//   'straight line': 'Qa1c2d3(C34:8) .... Sd1(C-34:6)a6',
//   'Curved line 1': 'Qa1c2d3(C34:-63) ... Sd1(C-34:4)a6',
//   'Curved line 2': 'Qa1c2d3-5(C34:68) ... Sd1a6(C-34:6)',
//   'slurred pair': 'Sd3(C) c3',
//   'complex slurred pair': 'Sc2d3(Cu) a3 Ea2c3c4',
// };

function testParser(tType, tests) {
  Object.entries(tests).forEach(([name, params]) => {
    test(`parse ${tType} – ${name}: ${params.tabcode}`, () => {
      const object = parse(params.tabcode, params.context);
      expect(object).toEqual(params.expected);
    });
  });
}

testParser('Space', space);
testParser('Comment', comments);
testParser('Break', breaks);
testParser('BarLine', barlines);
testParser('Metre', metres);
testParser('Rest', rests);
testParser('MainCourseNote', mainCourseNotes);
testParser('BassCourseNote', bassCourseNotes);
testParser('Rhythm flags', rhythm_flags);
testParser('Beams', beams);
testParser('Tuples', tuples);
// testParser('Lines', lines);
