import { ScriptSource, LineMappings } from '../types';
import { generateSubjectFinder } from '../helpers';

const subjectFinders = `
swap: function swap<T>
comparer: const comparer
`.trim().split('\n')
  .map((src) => {
    const [subject, code] = src.split(': ');
    return generateSubjectFinder(subject, [code, 'return']);
  });

function findSubjects({ source, url, scriptId }: ScriptSource, lineMappings: LineMappings) {
  subjectFinders.forEach((search) => {
    const sub = search(source);
    if (!sub) return;

    const { subject, line } = sub;
    const item = lineMappings.find(({ mappings }) => mappings[0].sourceLine === line);
    this[subject] = {
      line: item.line,
      mappings: [item.mappings[0], item.mappings[item.mappings.length - 1]],
      url,
      scriptId,
    };
  });
}

export default findSubjects;
