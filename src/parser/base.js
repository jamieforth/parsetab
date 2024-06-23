// Constants.

export const fullTunings = {
  'Renaissance (G)': [67, 62, 57, 53, 48, 43, 41, 40, 38, 36, 35, 33, 31],
  'Renaissance abzug (G)': [67, 62, 57, 53, 48, 41, 40, 38, 38, 36, 35, 33, 31],
  'Renaissance (A)': [69, 64, 59, 55, 50, 45, 43, 42, 40, 38, 37, 35, 33],
  'Renaissance guitar': [67, 62, 58, 65, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  'Baroque D minor': [65, 62, 57, 53, 50, 45, 43, 41, 40, 38, 36, 34, 33],
  'Baroque D minor 415': [64, 61, 56, 52, 49, 44, 42, 40, 39, 37, 35, 33, 31],
  'Bandora': [57, 52, 48, 43, 38, 36, 31, 26, 24, 23, 21, 19, 17, 16],
};
export const ticksPerCrotchet = 128;
export const durationLetters = 'ZYTSEQHWB';
export const rhythmFlags = durationLetters + 'F';
export const tabLetters = 'abcdefghijklmnopqrstuvwxyz';

// Defaults.

export const defaultMainCourseCount = 6;
export const defaultPitch = 67;
export const defaultNotation = 'French';
export const defaultFullTuning = fullTunings['Renaissance (G)'];

// Helper functions.

export function flagDur(rhythm) {
  // Return a duration in multiples of crotchets given a flag
  // FIXME: add scaling factor?
  let pos = rhythmFlags.indexOf(rhythm);
  if (pos > 7) {
    pos--;
  }
  return Math.pow(2, (pos - 5));
}

export function letterPitch(fretChar) {
  let pos = tabLetters.indexOf(fretChar);
  if (pos > 20) {
    pos -= 2;
  }
  else if (pos > 8) {
    pos--;
  }
  return pos;
}
