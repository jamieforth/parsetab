// Lexical tokenisation.

import {
  defaultMainCourseCount,
  durationLetters,
  rhythmFlags,
} from 'parsetab/parser/base';

// Tabcode grammar.
export function makeRules(mainCourseCount = defaultMainCourseCount) {
  const rules = {
    SPACE: /\s+/dy,
    PAGE: /{>}/dy,
    SYSTEM: /{\^}/dy,
    BAR: /:?\|[^\s{}]*/dy,
    METRE: /M[^\s{}]*/dy,
    // Rhythm tokens.
    RHYTHM_FLAG: RegExp(`[${rhythmFlags}]\\.?`, 'dy'),
    BEAM: /(?:\[+(?!\d\])|\]+)/dy,
    TUPLE: RegExp(
      `(?:\\[?\\d\\]?\\(\\d?[${durationLetters}]\\)|\\[\\d\\]|\\d)`,
      'dy',
    ),
    // Course reference, i.e. a 'null pitch'.
    MAIN_COURSE_REF: RegExp(
      `-[1-${mainCourseCount}]`,
      'dy',
    ),
    // Fret/course tab location.
    MAIN_PITCH: RegExp(
      `[a-z][1-${mainCourseCount}]`,
      'dy',
    ),
    // FIXME: Are bass courses ever stopped?
    BASS_PITCH: /X(?:[a-z]\/*|\d*)/dy,
    // Performance markings.
    // FIXME: Check dash.
    FINGERING: /(?:\(F[lr]?(?:[1-4!\-"]|\.+):[1-8]\)|[.:\-!"](?![|\d]))/dy,
    // FIXME: Check asterisk.
    ORNAMENT: /(?:\(O[acdefghijkl]\d?(?::\d)?\)|[ux,#<~*])/dy,
    LINE_TYPE_AB: /\(C[ud]?(?:-?\d+:-?(?:[1-8]{1}|[1-8]{2}))?\)/dy,
    LINE_TYPE_C: /\(E\d*\)/dy,
    LINE_TYPE_D: /(?:\(S[ud]?(?::[lr])?\)|\/)/dy,
    // As rule-sets are embedded XML, treat as a single token and parse
    // separately.
    RULESET: /{\s*<rules>[\s\S]*<\/rules>\s*}/diy, // Case insensitive.
  };
  return rules;
}

export class Token {
  constructor(type, code, index, lastIndex) {
    this.type = type;
    this.code = code;
    this.index = index;
    this.lastIndex = lastIndex;
  }
}

export function* makeScanner(
  input,
  {
    mainCourseCount = defaultMainCourseCount,
  } = {},
  returnCount = false,
) {
  // Generator function to tokenise TabCode.

  let index = 0;
  const end = input.length;
  let count = 0;
  const rules = makeRules(mainCourseCount);

  while (index < end) {
    count++;
    let token = null;
    for (const [type, regex] of Object.entries(rules)) {
      regex.lastIndex = index;
      token = regex.exec(input);
      if (token) {
        index = token.indices[0][1];
        token = new Token(type, token[0], ...token.indices[0]);
        break;
      }
    }
    if (token === null && input[index] == '{') {
      const [comment, lastIndex] = findCommentEnd(input, index);
      token = new Token('COMMENT', comment, index, lastIndex);
      index = lastIndex;
    }
    else if (token === null) {
      throw new ScanError('Unexpected symbol', index, input);
    }
    if (returnCount) {
      yield [token, count];
    }
    else {
      yield token;
    }
  }
  return false;
}

function findCommentEnd(input, start) {
  const markers = [];
  let commentLevel = 0;
  let comment = '';
  for (let i = start; i < input.length; i++) {
    comment += input[i];
    if (input[i] == '{') {
      markers.push(i);
      commentLevel++;
    }
    else if (input[i] == '}') {
      commentLevel--;
    }
    if (commentLevel == 0) {
      return [comment, i + 1];
    }
  }
  throw new ScanError(
    'Unbalanced parentheses',
    markers[commentLevel - 1],
    input,
  );
}

class ScanError extends Error {
  constructor(message, index, input, ...params) {
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only
    // available on V8).
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ScanError);
    }

    this.name = 'ScanError';
    this.message = `${message}: ${input[index]} at position ${index}`;
  }
}
