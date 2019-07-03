export interface ParsedScript {
  scriptId: string;
  url: string;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
  executionContextId: number;
  hash: string;
  executionContextAuxData: object;
  sourceMapURL: string;
  hasSourceURL: boolean;
  isModule: boolean;
  length: number;
}

export interface SourceMap {
  scriptId: string;
  file: string;
  mappings: string;
  names: string[];
  sources: string[];
  sourcesContent: string[];
  version: 3;
}

export interface MappingItem {
  col: number;
  sourceLine: number;
  sourceCol: number;
  indexName: number;
  indexSource: number;
}

export interface ScriptSource {
  scriptId: string;
  file: string;
  url: string;
  source: string;
  lineMappings: MappingItem[][];
}

export interface LineMapping {
  line: number;
  mappings: MappingItem[];
  url: string;
  scriptId: string;
}

export interface Breakpoint {
  lineNumber: number;
  columnNumber: number;
  url: string;
  name: string;
}

export interface DebugLocation {
  scriptId: string;
  lineNumber: number;
  columnNumber: number;
}

export interface DebugScope {
  type: 'global' | 'local' | 'with' | 'closure' | 'catch' | 'block' | 'script' | 'eval' | 'module';
  object: Record<string, any>;
  name?: string;
  startLocation?: DebugLocation;
  endLocation?: DebugLocation;
}

export interface DebugCallFrame {
  callFrameId: string;
  scopeChain: DebugScope[];
  functionName: string;
  location: DebugLocation;
  this: Record<string, any>;
  url: string;

  functionLocation?: DebugLocation;
  returnValue?: Record<string, any>;
}

export interface DebugPaused {
  callFrames: DebugCallFrame[];
  reason: string;

  data?: Record<string, any>;
  hitBreakpoints?: string[];
  asyncStackTrace?: {
    callFrames: DebugCallFrame[];
    description?: string;
  };
}

export type LineMappings = {
  mappings: MappingItem[];
  line: number;
}[];
