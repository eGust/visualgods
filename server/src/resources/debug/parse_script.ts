import { decode as decodeVlq } from 'vlq';

import {
  ParsedScript, SourceMap, MappingItem, ScriptSource,
} from '../types';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const toLineObj = ([col, indexSource, sourceLine, sourceCol, indexName]: number[]) => ({
  col,
  sourceLine,
  sourceCol,
  indexName,
  indexSource,
});

const formatLine = (line: string, vlqState: number[]): MappingItem[] => line.split(',').map((seg) => {
  if (!seg) return null;

  const decoded = decodeVlq(seg);
  for (let i = 0; i < 5; i += 1) {
    if (typeof decoded[i] === 'number') {
      vlqState[i] += decoded[i]; // eslint-disable-line no-param-reassign
    }
  }
  return toLineObj(vlqState);
}).filter(x => x);

const decodeMappings = (mappings: string): MappingItem[][] => {
  const vlqState = [0, 0, 0, 0, 0];
  const result = [];
  mappings.split(';').forEach((line, i) => {
    const items = formatLine(line, vlqState);
    if (items.length) result[i] = items;
    vlqState[0] = 0;
  });

  return result;
};

const parseScript = (script: ParsedScript): ScriptSource => {
  if (script.sourceMapURL && script.url
    && script.url.startsWith('file://')
    && script.sourceMapURL.startsWith('data:application/json')) {
    const [, b64Json] = script.sourceMapURL.split('base64,');
    const src = JSON.parse(Buffer.from(b64Json, 'base64').toString()) as SourceMap;
    return {
      scriptId: script.scriptId,
      url: script.url,
      file: src.file,
      source: src.sourcesContent[0],
      lineMappings: decodeMappings(src.mappings),
    };
  }
  return null;
};

export default parseScript;
