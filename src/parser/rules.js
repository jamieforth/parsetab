import {
  defaultNotation,
  defaultPitch,
  defaultFullTuning,
  letterPitch,
  fullTunings, // FIXME: Is there a rule to set a named full tuning?
} from 'parsetab/parser/base';
import { TabCode } from 'parsetab/parser/tabclasses';

import { XMLParser } from 'fast-xml-parser';

// FIXME: Should these be in namedTunings?
// const renaissanceGuitarIntervals = [5, 4, -7];
// const modernGuitarIntervals = [5, 4, 5, 5, 5];
// const renaissanceBassIntervals = [2, 1, 2, 2, 1, 2, 2];
// const baroqueBassIntervals = [2, 2, 1, 2, 2, 2, 1];

// FIXME: Are these standardised identifiers?
const namedTunings = {
  'renaissance': [5, 5, 4, 5, 5],
  'baroque': [3, 5, 4, 3, 5],
  'harpway-sarabande': [5, 3, 4, 5, 5],
  'gaultier': [4, 3, 4, 5, 5],
  'harpway-flat': [5, 4, 3, 5, 5],
  'french-flat': [3, 4, 3, 5, 5],
  'cordes-avallee': [5, 4, 5, 7, 5],
};

const namedBassTunings = {
  'renaissance_minor8': [2, 3],
  'baroque': [3, 5, 4, 3, 5],
};

export function parseRuleset(token, context = {}) {
  const xmlParser = new XMLParser();
  // Parse all rules lowercase.
  let rules = xmlParser.parse(token.code.toLowerCase()).rules;
  rules = rules ? rules : {};
  // Base new ruleset on the current context.
  if (context.ruleset) {
    rules = { ...context.ruleset.rules, ...rules };
  }
  const ruleset = new Ruleset(token.code, rules);
  return ruleset;
}

export class Ruleset extends TabCode {
  constructor(code, rules = {}) {
    super(code);
    this.fType = 'Ruleset';

    // Set defaults.
    rules = Object.assign(
      {
        notation: defaultNotation,
        pitch: defaultPitch,
      },
      rules,
    );
    this.rules = rules;
  }

  get fullTuning() {
    // This is mostly copy-and-paste from TC's original parser.

    // Now tuning -- this is a bit more complicated.
    // Have to combine various bits of rules for named or listed
    // tunings, pitch and bass courses.
    let fullTuning = defaultFullTuning;

    const pitch = this.rules.pitch;
    if (pitch) {
      fullTuning = fullTuning.map(this.pitchFunction(pitch));
    }
    else {
      // Should never happen.
      throw new Error('No pitch rule');
    }

    if (this.rules.tuning_named) {
      const namedTuning = this.rules.tuning_named;
      if (namedTuning in namedTunings) {
        fullTuning = fullTuning.map(
          this.namedTuningFunction(1, namedTunings[namedTuning]),
        );
      }
    }
    else if (this.rules.tuning) {
      const listedTuning = this.rules.tuning;
      fullTuning = this.retune(
        fullTuning,
        0,
        this.stringnumlistToArray(listedTuning),
      );
    }

    if (this.rules.bass_tuning_named) {
      const namedBassTuning = this.rules.bass_tuning_named;
      if (namedBassTuning in namedBassTunings) {
        fullTuning = fullTuning.map(
          this.namedTuningFunction(6, namedBassTunings[namedBassTuning]),
        );
      }
    }
    else if (this.rules.bass_tuning) {
      const listedBassTuning = this.rules.bass_tuning;
      fullTuning = this.retune2(
        fullTuning,
        6,
        this.stringnumlistToArray(listedBassTuning),
      );
    }
    return fullTuning;
  }

  staffLines() {
    const family = this.rules('staff_lines');
    return parseInt(family);
  }

  tabChar(tabChar) {
    if (this.rules.notation == 'italian')
      return letterPitch(tabChar);
    else
      return tabChar;
  }

  retune2(tuning, course, list) {
    // Copy first to avoid modifying in place.
    tuning = [...tuning];
    for (let i = 0; i < list.length; i++) {
      tuning[course + i] = Math.max(0, tuning[course + i - 1] + list[i]);
    }
    return tuning;
  }

  retune(tuning, course, list) {
    // Copy first to avoid modifying in place.
    tuning = [...tuning];
    let interval = 0;
    for (let i = 0; i < list.length; i++) {
      interval += list[i];
      tuning[course + 1] = Math.max(0, tuning[course] + Number(interval));
      interval = 0;
      course++;
    }
    return tuning;
  }

  pitchFunction(rule) {
    return function (e, _, a) {
      return Math.max(0, e - (a[0] - Number(rule)));
    };
  }

  namedTuningFunction(course, tuningData) {
    return function (e, i, a) {
      let soFar = 0;
      for (let n = 0; n < i; n++) {
        soFar += tuningData[n];
      }
      return i < course ? e : Math.max(0, a[0] - soFar);
    };
  }

  stringnumlistToArray(string) {
    return string.match(/-?[0-9]+/ig).map(
      function (e) { return Number(e); });
  }
}
