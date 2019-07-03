import { ScriptSource, LineMapping } from '../types';
import findSubjects from './subjects';
import findItemsOperations from './items';
import findMergeAssignments from './merge';

export function findAllBreakpoints(scripts: Record<string, ScriptSource>) {
  const breakpoints: Record<string, LineMapping> = {};
  const resolveSubjects = findSubjects.bind(breakpoints);
  const resolveItems = findItemsOperations.bind(breakpoints);
  const resolveMergeAssignments = findMergeAssignments.bind(breakpoints);

  Object.values(scripts).forEach((script) => {
    const lineMappings = script.lineMappings
      .map((mappings, line) => ({ mappings, line }))
      .filter(({ mappings }) => mappings && mappings.length);

    resolveSubjects(script, lineMappings);
    resolveItems(script, lineMappings);
    resolveMergeAssignments(script, lineMappings);
  });
  return breakpoints;
}

export default findAllBreakpoints;
