export interface KeyItem<T> {
  value: T;
  key: string;
}

export type NumberItem = KeyItem<number>;

export interface ResponseMessage {
  id: number;
  result: Record<string, any>;
}

export interface MethodMessage {
  id: number;
  method: string;
  params?: Record<string, any>;
}

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
