export class TabCode {
  constructor(code) {
    this.code = code;
  }
}

export class Comment extends TabCode {
  constructor(code) {
    super(code);
    this.tType = 'Comment';
  }
}

export class StructuredComment extends TabCode {
  constructor(code) {
    super(code);
    this.tType = 'StructuredComment';
  }
}

export class PageBreak extends TabCode {
  constructor(code, pageNum) {
    super(code);
    this.tType = 'PageBreak';
    this.pageNum = pageNum;
  }
}

export class SystemBreak extends TabCode {
  constructor(code, sysNum) {
    super(code);
    this.tType = 'SystemBreak';
    this.sysNum = sysNum;
  }
}

export class Barline extends TabCode {
  constructor(
    code,
    barNum,
    {
      doubleBar = false,
      lRepeat = false,
      rRepeat = false,
      dashed = false,
      nonCounting = false,
      midDots = false,
    } = {},
  ) {
    super(code);
    this.tType = 'Barline';
    this.barNum = barNum;
    this.doubleBar = doubleBar;
    this.lRepeat = lRepeat;
    this.rRepeat = rRepeat;
    this.dashed = dashed;
    this.nonCounting = nonCounting;
    this.midDots = midDots;
  }
}

export class Metre extends TabCode {
  constructor(
    code,
    {
      components = [],
      vertical = false,
    } = {},
  ) {
    super(code);
    this.tType = 'Metre';
    this.components = components;
    this.vertical = vertical;
  }
}

export class Duration extends TabCode {
  constructor(code) {
    super(code);
    this.tType = 'Duration';
  }
}

export class MainCourseRef extends TabCode {
  constructor(code, course) {
    super(code);
    this.tType = 'MainCourseRef';
    this.course = course;
  }
}

export class Pitch extends TabCode {
  constructor(code, fret, course) {
    super(code);
    this.tType = 'Pitch';
    this.fret = fret;
    this.course = course;
  }
}

export class Fingering extends TabCode {
  constructor(code) {
    super(code);
    this.tType = 'Fingering';
  }
}

export class Ornament extends TabCode {
  constructor(code) {
    super(code);
    this.tType = 'Ornament';
  }
}

export class Line extends TabCode {
  constructor(code) {
    super(code);
    this.tType = 'Line';
  }
}

// Events.

export class Rest {
  constructor(duration) {
    this.tType = 'Rest';
    this.duration = duration;
  }
}

export class TabNote {
  constructor(pitch) {
    this.tType = 'TabNote';
    this.pitch = pitch;
  }
}

export class BassNote {
  constructor(pitch) {
    this.tType = 'BassNote';
    this.pitch = pitch;
  }
}

export class Chord {
  constructor(mainCourses, {
    duration = false,
    bassCourses = [],
  } = {}) {
    this.tType = 'Chord';
    this.duration = duration;
    this.mainCourses = mainCourses;
    this.bassCourses = bassCourses;
  }
}
