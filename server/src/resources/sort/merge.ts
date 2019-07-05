import { ScriptSource, LineMappings } from '../types';
import { findAllSubStr, getLineMap } from '../helpers';

function findMergeAssignments({ source, url, scriptId }: ScriptSource, lineMappings: LineMappings) {
  if (!url.endsWith('MergeSort.ts')) return;

  const offsets = [...findAllSubStr(source, 'result ='), ...findAllSubStr(source, 'result[')];
  if (!offsets.length) return;

  const offsetLineMap = getLineMap(offsets, source);
  offsets.forEach((off) => {
    const line = offsetLineMap.get(off);
    const item = lineMappings.find(({ mappings }) => mappings[0].sourceLine === line);
    this[`merge:${line}`] = {
      line: item.line,
      mappings: [item.mappings[0], item.mappings[item.mappings.length - 1]],
      url,
      scriptId,
    };
  });
}

export default findMergeAssignments;
