import { readFileSync } from 'fs';
import { URL } from 'url';
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
  if (script.sourceMapURL && script.url && script.url.startsWith('file://')) {
    let mappingJson = '';
    const { sourceMapURL, scriptId, url } = script;

    if (sourceMapURL.startsWith('data:application/json')) {
      const [, b64Json] = sourceMapURL.split('base64,');
      mappingJson = Buffer.from(b64Json, 'base64').toString();
    } else if (sourceMapURL && /\bdist\b/.test(url) && !/\bnode_modules\b/.test(url)) {
      mappingJson = readFileSync(new URL(sourceMapURL, url), { encoding: 'utf8' });
    }
    if (!mappingJson) return null;

    const src = JSON.parse(mappingJson) as SourceMap;
    src.sourcesContent = src.sourcesContent || [
      readFileSync(new URL(src.sources[0], url), { encoding: 'utf8' }),
    ];
    return {
      scriptId,
      url,
      file: src.file,
      source: src.sourcesContent[0],
      lineMappings: decodeMappings(src.mappings),
    };
  }
  return null;
};

export default parseScript;
