export interface KeyItem<T> {
  value: T;
  key: string;
}

export type NumberItem = KeyItem<number>;

export interface ResponseMessage {
  id: number;
  result: Record<string, any>;
}

interface SortData {
  action: 'sort';
  subject: string;
  items: NumberItem[];
}

export interface MethodMessage {
  id: number;
  method: string;
  params?: Record<string, any>;
}
