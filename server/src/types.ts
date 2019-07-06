export interface KeyItem<T> {
  value: T;
  key: string;
}

export type NumberItem = KeyItem<number>;

export interface ResponseMessage extends Record<string, unknown> {
  id: number;
  result?: Record<string, unknown>;
}

export interface MethodMessage extends Record<string, unknown> {
  id?: number;
  method: string;
  params?: Record<string, unknown>;
}

export interface AnyMessage extends Record<string, unknown> {
  id?: number;
  method?: string;
  result?: Record<string, unknown>;
  params?: Record<string, unknown>;
}
