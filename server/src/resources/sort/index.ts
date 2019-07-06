import { ScriptSource, LineMapping, DebugCallFrame } from '../types';
import findSubjects from './subjects';
import findItemsOperations from './items';
import findMergeAssignments from './merge';

export const findBreakpoints = (scripts: Record<string, ScriptSource>): Record<string, LineMapping> => {
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
};

export const filterCallFrames = (name: string, callFrames: DebugCallFrame[]): DebugCallFrame[] => {
  if (name === 'comparer') {
    const sortIndex = callFrames.findIndex(({ functionName }) => functionName === 'sort');
    return callFrames.slice(0, sortIndex);
  }

  if (name === 'swap') return callFrames.slice(0, 2);
  if (name.startsWith('merge:') || name.startsWith('items@')) return [callFrames[0]];

  console.error('Unknown:', name);
  return null;
};

export default {
  findBreakpoints,
  filterCallFrames,
};
