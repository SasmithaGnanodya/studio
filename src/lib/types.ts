
export type FieldPart = {
  text: string; // The static text for a label, or the data ID for a value
  x: number;
  y: number;
  width: number;
  height: number;
  isBold?: boolean;
  color?: string;
  inputType?: 'text' | 'dropdown';
  options?: string[];
};

export type FieldLayout = {
  id: string;
  fieldId: string; // Connects to the key in initialReportState
  label: FieldPart;
  value: FieldPart;
};
