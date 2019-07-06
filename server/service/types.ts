export interface KeyItem<T> {
  value: T;
  key: string;
}

export type NumberItem = KeyItem<number>;

export interface ResponseMessage {
  id: number;
  result: Record<string, unknown>;
}

export interface MethodMessage {
  id: number;
  method: string;
  params?: Record<string, unknown>;
}
