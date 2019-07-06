export interface Breakpoint {
  scriptId: string;
  line: number;
}

export interface NumberItem {
  value: number;
  key: string;
}

export interface Message {
  method: string;
  id?: number;
  params?: Record<string, unknown>;
}

export interface SourceScript {
  file: string;
  source: string;
  lines: string[];
}
