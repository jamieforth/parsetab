import { Ruleset, parseRuleset } from 'parsetab/parser/rules';
import { makeScanner } from 'parsetab/parser/scanner';
import {
  Barline,
  BassNote,
  Chord,
  Comment,
  Duration,
  Fingering,
  Line,
  MainCourseRef,
  Metre,
  Ornament,
  PageBreak,
  Pitch,
  Rest,
  SystemBreak,
  TabNote,
} from 'parsetab/parser/tabclasses';

// Parser rules.
export const rules = {
  bar: {
    DOUBLE: /\|{2}/,
    L_REPEAT: /^:\|/,
    R_REPEAT: /\|:$/,
    DASHED: /^\|=/,
    NONCOUNTING: /^\|=?0$/,
    MID_DOTS: /^\|:\|$/,
  },
  metre: {
    COMPONENTS: /[^M(:;)]+/g,
    VERTICAL: /[:]/,
  },
};

export function parse(input, defaults = {}) {
  const scanner = makeScanner(input, defaults, true);

  const context = Object.assign(
    {
      comments: true,
      pageNum: 1,
      sysNum: 1,
      barNum: 1,
      curRhythm: false,
      prevRhythm: false,
      curNotes: [],
      curBassNotes: [],
      curBeams: 0,
      curTripletGroup: false,
      ruleset: new Ruleset(),
      withinChord() {
        return this.curNotes.length > 0;
      },
      newRhythmContext() {
        return this.curRhythm != false;
      },
    },
    defaults,
  );

  const data = [];

  for (const [token, count] of scanner) {
    if (context.debug) console.log(count, token);
    switch (token.type) {
      case 'RHYTHM_FLAG':
        parseRhythmFlag(token, context);
        continue;
      case 'BEAM':
        parseBeam(token, context);
        continue;
      case 'TUPLE':
        parseTuple(token, context);
        continue;
      case 'MAIN_COURSE_REF':
        parseMainCourseRef(token, context);
        continue;
      case 'MAIN_PITCH':
        parseMainPitch(token, context);
        continue;
      case 'BASS_PITCH':
        parseBassPitch(token, context);
        continue;
      case 'FINGERING':
        parseFingering(token, context);
        continue;
      case 'ORNAMENT':
        parseOrnament(token, context);
        continue;
      case 'LINE_TYPE_AB':
        parseLine(token, context);
        continue;
      case 'LINE_TYPE_C':
        parseLine(token, context);
        continue;
      case 'LINE_TYPE_D':
        parseLine(token, context);
        continue;
    }

    // If none of the above, then we are at the end of a TabWord.
    const curEvent = flushContext(context);
    if (curEvent) data.push(curEvent);

    switch (token.type) {
      case 'SPACE':
        break;
      case 'COMMENT':
        // parseComment(token, context);
        if (context.comments) {
          data.push(new Comment(token.code));
        }
        break;
      case 'PAGE':
        data.push(new PageBreak(
          token.code,
          context.pageNum,
        ));
        context.pageNum++;
        break;
      case 'SYSTEM':
        data.push(new SystemBreak(
          token.code,
          context.sysNum,
        ));
        context.sysNum++;
        break;
      case 'BAR':
        data.push(parseBar(token, context));
        break;
      case 'METRE':
        data.push(parseMetre(token));
        break;
      case 'RULESET':
        data.push(parseRuleset(token, context));
        break;
      default:
        throw new ParseError('Unexpected token', token, context);
    }
  }
  const curEvent = flushContext(context);
  if (curEvent) data.push(curEvent);
  return data;
}

function flushContext(context) {
  if (context.mainCourseRef) {
    throw new ParseError('Unhandled main course reference', null, context);
  }
  let newEvent = false;
  switch (true) {
    case context.withinChord():
      newEvent = new Chord(
        context.curNotes,
        {
          duration: context.curRhythm
            ? context.curRhythm
            : context.prevRhythm,
          bassCourses: context.curBassNotes,
        },
      );
      context.curNotes = [];
      context.curBassNotes = [];
      break;
    case context.newRhythmContext():
      newEvent = new Rest(context.curRhythm);
      break;
  }
  context.prevRhythm = context.curRhythm;
  context.curRhythm = false;

  return newEvent;
}

function parseBar(token, context) {
  const options = {
    doubleBar: rules.bar.DOUBLE.test(token.code),
    lRepeat: rules.bar.L_REPEAT.test(token.code),
    rRepeat: rules.bar.R_REPEAT.test(token.code),
    dashed: rules.bar.DASHED.test(token.code),
    nonCounting: rules.bar.NONCOUNTING.test(token.code),
    midDots: rules.bar.MID_DOTS.test(token.code),
  };
  const barline = new Barline(
    token.code,
    context.barNum,
    options,
  );
  context.barNum++;
  return barline;
}

function parseMetre(token) {
  const options = {
    components: token.code.match(rules.metre.COMPONENTS),
    vertical: rules.metre.VERTICAL.test(token.code),
  };
  return new Metre(token.code, options);
}

function parseRhythmFlag(token, context) {
  // Rhythm flag only allowed at the start of a TabWord.
  if (!context.withinChord()
      && !context.newRhythmContext()) {
    context.curRhythm = new Duration(token.code);
  }
  else {
    throw new ParseError('Unexpected rhythm flag', token, context);
  }
}

function parseBeam(token, context) {
}

function parseTuple(token, context) {
}

function parseMainCourseRef(token, context) {
  const course = parseInt(token.code[1]);
  if (!context.mainCourseRef) {
    context.mainCourseRef = new MainCourseRef(token.code, course);
  }
  else {
    throw new ParseError('Unexpected main course reference', token, context);
  }
  // Always expect a line next?
}

function parseMainPitch(token, context) {
  const fret = token.code[0];
  const course = parseInt(token.code[1]);
  const rule = context.curRule;
  context.curNotes.push(
    new TabNote(
      new Pitch(token.code, fret, course, rule),
    ),
  );
}

function parseBassPitch(token, context) {
  const fret = token.code[0];
  const course = parseInt(token.code[1]);
  const rule = context.curRule;
  context.curBassNotes.push(
    new BassNote(
      new Pitch(token.code, fret, course, rule),
    ),
  );
}

function parseFingering(token, context) {
  if (context.withinChord()) {
    context.curNotes[context.curNotes.length - 1].fingering = new Fingering(
      token.code,
    );
  }
  else {
    throw new ParseError('Unexpected fingering', token, context);
  }
}

function parseOrnament(token, context) {
  if (context.withinChord()) {
    context.curNotes[context.curNotes.length - 1].ornament = new Ornament(
      token.code,
    );
  }
  else {
    throw new ParseError('Unexpected ornament', token, context);
  }
}

// In the case of type a or b lines, the line-number and a colon ‘:’ follow
// immediately after ‘C’. Then comes a code representing the type of line. For
// our purposes this can be simplified to ‘<pos>’ (the position-code alone) for
// straight line starting positions; ‘6<pos>’ for downward-curved (slur-like)
// line starting position; ‘-6<pos>’ for upward-curved ditto; and just ‘<pos>’
// for straight or curved line ending positions.

// Straight line example:
// Qa1c2d3(C34:8) .... Sd1(C-34:6)a6

// Curved line example:
// Qa1c2d3(C34:-63) ... Sd1(C-34:4)a6

// type c ‘ensemble’ lines the ‘E’ can be followed by a number giving the
// length of the line, but this may be omitted; the default is for the line to
// go from position ‘7’ of the top letter to position ‘2’ of the bottom letter.

// N.B. There must be at least one empty staff line between the two letters.

// (e.g. Qa1(E)d5 means notes a1 and d5 joined by a default ensemble line.

// type d ‘separée’ lines, after the ‘S’ comes either ‘u’ to indicate the
// right end is up, or ‘d’ to indicate it’s down; but by default, we assume
// ‘u’ (more common), so all that is needed usually is ‘S’ alone.

// Normally the separée lines are horizontally centred on the letters, but
// sometimes they appear to one side of them; in such cases, end with ":l"
// (for ‘left), or ":r" (’right’).

// A shortcut for the default ‘separée’ line equivalent to (S) is /

// Example 1. Qa1(S)b3(S)a4(S)Xd is a four-note chord with three separating
// ‘upward’ slashes between the letters. It can also be encoded as
// Qa1/b3/a4/Xd

// Example 2. Qa1(Sd:l)b3(Sd:l)a4(Sd:l)Xd is a four-note chord with three
// separating ‘downward’ slashes to the left of the column of letters.

function parseLine(token, context) {
  if (context.withinChord()) {
    if (context.mainCourseRef) {
      context.curNotes[context.curNotes.length - 1].line = new Line(
        token.code,
        context.mainCourseRef,
      );
      delete context.mainCourseRef;
    }
    else {
      context.curNotes[context.curNotes.length - 1].line = new Line(
        token.code,
      );
    }
  }
  else {
    throw new ParseError('Unexpected line', token, context);
  }
}

class ParseError extends Error {
  constructor(message, token, context, ...params) {
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only
    // available on V8).
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ParseError);
    }

    this.name = 'ParseError';
    if (token) {
      this.message = `${message}: ${token.code}`;
      this.token = token;
    }
    else {
      this.message = message;
    }
    this.context = context;
  }
}
