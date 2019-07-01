import { ScriptSource, LineMapping } from '../types';

function findCode(source: string, sequences: string[]) {
  let pos = 0;
  const notFound = sequences.find((seq) => {
    pos = source.indexOf(seq, pos);
    return pos < 0;
  });
  return notFound ? null : pos;
}

const generateSubjectFinder = (subject: string, sequences: string[]) => (script: ScriptSource) => {
  const { source } = script;
  const pos = findCode(source, sequences);
  if (!pos) return null;

  let line = 0;
  Array.prototype.forEach.call(source.slice(0, pos), (c) => {
    if (c !== '\n') return;
    line += 1;
  });

  return { subject, line };
};

const subjectFinders = `
swap: function swap<T>
comparer: const comparer
`.trim().split('\n')
  .map((src) => {
    const [subject, code] = src.split(': ');
    return generateSubjectFinder(subject, [code, 'return']);
  });

const RE_WRITE = /items\[.+?\]\s*=/g;
const RE_READ = /=\s*items\[.+?\]/g;

const matchAll = (re: RegExp, str: string) => {
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

const getLineMap = (offsets: number[], source: string) => {
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

export function findAllBreakpoints(scripts: Record<string, ScriptSource>) {
  const breakpoints: Record<string, LineMapping> = {};
  let rwId = 0;

  Object.values(scripts).forEach((script) => {
    const { lineMappings: lms, url, scriptId } = script;
    const lineMappings = lms.map((mappings, line) => ({ mappings, line }))
      .filter(({ mappings }) => mappings && mappings.length);

    subjectFinders.forEach((search) => {
      const sub = search(script);
      if (!sub) return;

      const { subject, line } = sub;
      const item = lineMappings.find(({ mappings }) => mappings[0].sourceLine === line);
      if (item) {
        breakpoints[subject] = {
          line: item.line,
          mappings: [item.mappings[0], item.mappings[item.mappings.length - 1]],
          url,
          scriptId,
        };
      }
    });

    const read = matchAll(RE_READ, script.source);
    const write = matchAll(RE_WRITE, script.source);
    const rws = [...read, ...write];
    if (rws.length) {
      const offsetLineMap = getLineMap(rws.sort((a, b) => a - b), script.source);
      const lineBreakpointMap = new Map<number, Set<string>>();

      read.forEach((off) => {
        const line = offsetLineMap.get(off);
        lineBreakpointMap.set(line, new Set(['R']));
      });

      write.forEach((off) => {
        const line = offsetLineMap.get(off);
        const s = lineBreakpointMap.get(line);
        if (s) {
          s.add('W');
        } else {
          lineBreakpointMap.set(line, new Set(['W']));
        }
      });

      Array.from(lineBreakpointMap.entries()).sort(([a], [b]) => a - b).forEach(([line, s]) => {
        const item = lineMappings.find(({ mappings }) => mappings[0].sourceLine === line);
        if (!item) return;

        rwId += 1;
        let key: string;
        if (s.has('R')) {
          key = s.has('W') ? 'rw' : 'r';
        } else {
          key = 'w';
        }
        breakpoints[`items[${key}]${rwId}`] = {
          line: item.line,
          mappings: [item.mappings[0], item.mappings[item.mappings.length - 1]],
          url,
          scriptId,
        };
      });
    }
  });
  return breakpoints;
}

export default findAllBreakpoints;
