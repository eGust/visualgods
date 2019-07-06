export const findCode = (source: string, sequences: string[]): number => {
  let pos = 0;
  const notFound = sequences.find((seq) => {
    pos = source.indexOf(seq, pos);
    return pos < 0;
  });
  return notFound ? null : pos;
};

export const generateSubjectFinder = (subject: string, sequences: string[]) => (source: string) => {
  const pos = findCode(source, sequences);
  if (!pos) return null;

  let line = 0;
  Array.prototype.forEach.call(source.slice(0, pos), (c) => {
    if (c !== '\n') return;
    line += 1;
  });

  return { subject, line };
};

export const matchAllRegEx = (str: string, re: RegExp): number[] => {
  const matches: number[] = [];
  let m: RegExpExecArray = null;
  do {
    m = re.exec(str);
    if (m) {
      matches.push(m.index);
    }
  } while (m);
  return matches;
};

export const findAllSubStr = (str: string, sub: string): number[] => {
  const matches: number[] = [];
  let pos = 0;
  for (;;) {
    pos = str.indexOf(sub, pos);
    if (pos < 0) break;
    matches.push(pos);
    pos += sub.length;
  }
  return matches;
};

export const getLineMap = (offsets: number[], source: string): Map<number, number> => {
  const map = new Map<number, number>();
  let line = 0;
  let offIndex = 0;
  let offset = offsets[offIndex];
  Array.prototype.find.call(source, (c, index) => {
    if (c !== '\n') return false;
    line += 1;

    while (index > offset) {
      map.set(offset, line - 1);
      offIndex += 1;
      if (offIndex >= offsets.length) return true;

      offset = offsets[offIndex];
    }
    return false;
  });

  if (offIndex < offsets.length) {
    map.set(offset, line);
  }
  return map;
};
