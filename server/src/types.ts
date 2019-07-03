export interface KeyItem<T> {
  value: T;
  key: string;
}

export type NumberItem = KeyItem<number>;

export interface ResponseMessage {
  id: number;
  result?: Record<string, any>;
}

export interface MethodMessage {
  id?: number;
  method: string;
  params?: Record<string, any>;
}
