import { expect, test } from '@jest/globals';
import { Ruleset, parseRuleset } from 'parsetab/parser/rules';
import { Token } from 'parsetab/parser/scanner';

const rulesets = {
  'notation: french': (
    (tabcode = `{<rules><notation>french</notation></rules>}`) => ({
      token: new Token('RULESET', tabcode, 0, tabcode.length),
      expected: new Ruleset(tabcode, {
        notation: 'french',
      }),
    }))(),
  'notation: italian': (
    (tabcode = `{<rules><notation>italian</notation></rules>}`) => ({
      token: new Token('RULESET', tabcode, 0, tabcode.length),
      expected: new Ruleset(tabcode, {
        notation: 'italian',
      }),
    }))(),
  'pitch=67': (
    (tabcode = `{<rules><pitch>67</pitch></rules>}`) => ({
      token: new Token('RULESET', tabcode, 0, tabcode.length),
      expected: new Ruleset(tabcode, {
        pitch: 67,
      }),
    }))(),
  'pitch=68': (
    (tabcode = `{<rules><pitch>68</pitch></rules>}`) => ({
      token: new Token('RULESET', tabcode, 0, tabcode.length),
      expected: new Ruleset(tabcode, {
        pitch: 68,
      }),
    }))(),
  'tuning: listed': (
    (tabcode = `{
      <rules><tuning>(-5 -5 -4 -5 -5 -2 -1 -2 -2 -1 -2)</tuning></rules>
    }`) => ({
      token: new Token('RULESET', tabcode, 0, tabcode.length),
      expected: new Ruleset(tabcode, {
        tuning: '(-5 -5 -4 -5 -5 -2 -1 -2 -2 -1 -2)',
      }),
    }))(),
  'tuning: named': (
    (tabcode = `{
      <rules><tuning_named>renaissance</tuning_named></rules>
    }`) => ({
      token: new Token('RULESET', tabcode, 0, tabcode.length),
      expected: new Ruleset(tabcode, {
        tuning_named: 'renaissance',
      }),
    }))(),
  'bass tuning: listed': (
    (tabcode = `{
      <rules><bass_tuning>(-2 -3 -2)</bass_tuning></rules>
    }`) => ({
      token: new Token('RULESET', tabcode, 0, tabcode.length),
      expected: new Ruleset(tabcode, {
        bass_tuning: '(-2 -3 -2)',
      }),
    }))(),
  'french, renaissance and bass tuning': (
    (tabcode = `{
      <rules>
        <tuning_named>renaissance</tuning_named>
        <notation>french</notation>
        <bass_tuning>(-2 -3 -2)</bass_tuning>
        <pitch>67</pitch>
      </rules>
    }`) => ({
      token: new Token('RULESET', tabcode, 0, tabcode.length),
      expected: new Ruleset(tabcode, {
        tuning_named: 'renaissance',
        notation: 'french',
        bass_tuning: '(-2 -3 -2)',
        pitch: 67,
      }),
    }))(),
};

function testParser(tests) {
  Object.entries(tests).forEach(([name, params]) => {
    test(`parse ${name}: ${params.tabcode}`, () => {
      const parsed = parseRuleset(params.token);
      expect(parsed).toEqual(params.expected);
    });
  });
}

testParser(rulesets);

const fullTunings = {
  'fullTuning: french': (
    (tabcode = `{<rules><notation>french</notation></rules>}`) => ({
      token: new Token('RULESET', tabcode, 0, tabcode.length),
      expected: [
        67, 62, 57, 53, 48, 43, 41, 40, 38, 36, 35, 33, 31,
      ],
    }))(),
  'fullTuning: italian': (
    (tabcode = `{<rules><notation>italian</notation></rules>}`) => ({
      token: new Token('RULESET', tabcode, 0, tabcode.length),
      expected: [
        67, 62, 57, 53, 48, 43, 41, 40, 38, 36, 35, 33, 31,
      ],
    }))(),
  'fullTuning: pitch=67': (
    (tabcode = `{<rules><pitch>67</pitch></rules>}`) => ({
      token: new Token('RULESET', tabcode, 0, tabcode.length),
      expected: [
        67, 62, 57, 53, 48, 43, 41, 40, 38, 36, 35, 33, 31,
      ],
    }))(),
  'fullTuning: pitch=68': (
    (tabcode = `{<rules><pitch>68</pitch></rules>}`) => ({
      token: new Token('RULESET', tabcode, 0, tabcode.length),
      expected: [
        68, 63, 58, 54, 49, 44, 42, 41, 39, 37, 36, 34, 32,
      ],
    }))(),
  'fullTuning: listed': (
    (tabcode = `{
      <rules>
        <tuning>(-5 -5 -4 -5 -5 -2 -1 -2 -2 -1 -2)</tuning>
      </rules>
    }`) => ({
      token: new Token('RULESET', tabcode, 0, tabcode.length),
      expected: [
        67, 62, 57, 53, 48, 43, 41, 40, 38, 36, 35, 33, 31,
      ],
    }))(),
  'fullTuning: listed, pitch=68': (
    (tabcode = `{
      <rules>
        <tuning>(-5 -5 -4 -5 -5 -2 -1 -2 -2 -1 -2)</tuning>
        <pitch>68</pitch>
      </rules>
    }`) => ({
      token: new Token('RULESET', tabcode, 0, tabcode.length),
      expected: [
        68, 63, 58, 54, 49, 44, 42, 41, 39, 37, 36, 34, 32,
      ],
    }))(),
  'fullTuning: listed semitones+': (
    (tabcode = `{
      <rules>
        <tuning>(1 1 1 1 1 1 1 1 1 1 1)</tuning>
        <pitch>60</pitch>
      </rules>
    }`) => ({
      token: new Token('RULESET', tabcode, 0, tabcode.length),
      expected: [
        60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 24,
      ],
    }))(),
  'fullTuning: listed semitones-': (
    (tabcode = `{
      <rules>
        <tuning>(-1 -1 -1 -1 -1 -1 -1 -1 -1 -1 -1)</tuning>
        <pitch>60</pitch>
      </rules>
    }`) => ({
      token: new Token('RULESET', tabcode, 0, tabcode.length),
      expected: [
        60, 59, 58, 57, 56, 55, 54, 53, 52, 51, 50, 49, 24,
      ],
    }))(),
};

function testFullTunings(tests) {
  Object.entries(tests).forEach(([name, params]) => {
    test(`test ${name}: ${params.tabcode}`, () => {
      const ruleset = parseRuleset(params.token);
      expect(ruleset.fullTuning).toEqual(params.expected);
    });
  });
}

testFullTunings(fullTunings);

const rulesetsContext = {
  'notation: french (token overrides context)': (
    (tabcode = `{<rules><notation>french</notation></rules>}`) => ({
      token: new Token('RULESET', tabcode, 0, tabcode.length),
      context: {
        ruleset: new Ruleset('', {
          notation: 'italian',
        }),
      },
      expected: new Ruleset(tabcode, {
        notation: 'french',
      }),
    }))(),
  'notation: italian (token overrides context)': (
    (tabcode = `{<rules><notation>italian</notation></rules>}`) => ({
      token: new Token('RULESET', tabcode, 0, tabcode.length),
      context: {
        ruleset: new Ruleset('', {
          notation: 'french',
        }),
      },
      expected: new Ruleset(tabcode, {
        notation: 'italian',
      }),
    }))(),
  'notation: french (from context)': (
    (tabcode = `{<rules></rules>}`) => ({
      token: new Token('RULESET', tabcode, 0, tabcode.length),
      context: {
        ruleset: new Ruleset('', {
          notation: 'french',
        }),
      },
      expected: new Ruleset(tabcode, {
        notation: 'french',
      }),
    }))(),
  'notation: italian (from context)': (
    (tabcode = `{<rules></rules>}`) => ({
      token: new Token('RULESET', tabcode, 0, tabcode.length),
      context: {
        ruleset: new Ruleset('', {
          notation: 'italian',
        }),
      },
      expected: new Ruleset(tabcode, {
        notation: 'italian',
      }),
    }))(),
};

function testRulesetsContext(tests) {
  Object.entries(tests).forEach(([name, params]) => {
    test(`test ${name}: ${params.tabcode}`, () => {
      const ruleset = parseRuleset(params.token, params.context);
      expect(ruleset).toEqual(params.expected);
    });
  });
}

testRulesetsContext(rulesetsContext);
