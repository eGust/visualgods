export enum ItemStatus {
  Normal = 'Normal',
  Creating = 'Creating',
  Deleting = 'Deleting',
  Updating = 'Updating',
  Selected = 'Selected',
}

export enum ItemHighlight {
  Dimer3x = 'Dimer3x',
  Dimer2x = 'Dimer2x',
  Dimer1x = 'Dimer1x',
  Medium = 'Medium',
  Lighter1x = 'Lighter1x',
  Lighter2x = 'Lighter2x',
  Lighter3x = 'Lighter3x',
}

export type ValueType = number | string | object;

export interface ValueRecord<T extends ValueType> {
  value: T;
  status?: ItemStatus;
  highlight?: ItemHighlight;
}
