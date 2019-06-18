export interface KeyItem<T> {
  value: T;
  key: string;
}

export type NumberItem = KeyItem<number>;

export type StringItem = KeyItem<string>;
