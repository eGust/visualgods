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

type RuntimeType = 'object' | 'function' | 'undefined' | 'string' | 'number'
| 'boolean' | 'symbol' | 'bigint';

type RuntimeSubType = 'array' | 'null' | 'node' | 'regexp' | 'date' | 'map'
| 'set' | 'weakmap' | 'weakset' | 'iterator' | 'generator' | 'error';

interface RuntimePropertyPreview {
  name: string;
  type: RuntimeType;
  value?: string;
  valuePreview?: RuntimeObjectPreview;
  subtype?: RuntimeSubType;
}

export interface RuntimeObjectPreview {
  type: RuntimeType;
  overflow: boolean;
  properties: RuntimePropertyPreview[];

  subtype?: RuntimeSubType;
  description?: string;
  entries?: { key?: RuntimeObjectPreview; value: RuntimeObjectPreview }[];
}

export interface RuntimeRemoteObject {
  type: RuntimeType;
  subtype?: RuntimeSubType | 'proxy' | 'promise' | 'typedarray' | 'arraybuffer' | 'dataview';
  className?: string;
  value?: any;
  description?: string;
  objectId?: string;
  unserializableValue?: string;
  preview?: RuntimeObjectPreview;
}

export interface RtPropertyDescriptor {
  name: string;
  value?: RuntimeRemoteObject;
  get?: RuntimeRemoteObject;
  set?: RuntimeRemoteObject;
  symbol?: RuntimeRemoteObject;

  configurable: boolean;
  enumerable: boolean;
  writable?: boolean;
  wasThrown?: boolean;
  isOwn?: boolean;
}

export interface StackFrame {
  functionName: string;
  location: DebugLocation;
  scope: Record<string, any>;
}

export type CallFramesFilter = (name: string, callFrames: DebugCallFrame[]) =>
DebugCallFrame[];

export type BreakpointsFinder = (scripts: Record<string, ScriptSource>) =>
Record<string, LineMapping>;

export interface DebuggerPlugin {
  filterCallFrames: CallFramesFilter;
  findBreakpoints: BreakpointsFinder;
}
