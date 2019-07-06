import { ScriptSource, LineMappings } from '../types';
import { matchAllRegEx, getLineMap } from '../helpers';

const RE_WRITE = /items\[.+?\]\s*=/g;
const RE_READ = /=\s*items\[.+?\]/g;

function findHeapItemsOperations(scriptSrc: ScriptSource, lineMappings: LineMappings): void {
  const { source, url, scriptId } = scriptSrc;
  const read = matchAllRegEx(source, RE_READ);
  const write = matchAllRegEx(source, RE_WRITE);
  const rws = [...read, ...write];
  if (!rws.length) return;

  const offsetLineMap = getLineMap(rws.sort((a, b) => a - b), source);
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

  [...lineBreakpointMap.entries()].sort(([a], [b]) => a - b).forEach(([line, s]) => {
    const item = lineMappings.find(({ mappings }) => mappings[0].sourceLine === line);
    if (!item) return;

    let key: string;
    if (s.has('R')) {
      key = s.has('W') ? 'rw' : 'r';
    } else {
      key = 'w';
    }

    this[`items@${scriptId}:${line}[${key}]`] = {
      line: item.line,
      mappings: [item.mappings[0], item.mappings[item.mappings.length - 1]],
      url,
      scriptId,
    };
  });
}

export default findHeapItemsOperations;
