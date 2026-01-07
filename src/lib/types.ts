
export type SubField = {
  id: string;
  label: string;
  x: number; // relative to parent, in mm
  y: number; // relative to parent, in mm
  width: number;
  height: number;
  className?: string;
  displayMode?: 'inline' | 'block';
};

export type FieldLayout = {
  id: string;
  label: string;
  x: number; // absolute, in mm
  y: number; // absolute, in mm
  width: number; // in mm
  height: number; // in mm
  className?: string;
  subFields: SubField[];
};
