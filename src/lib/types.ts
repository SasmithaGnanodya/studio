
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
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
};

export type FieldLayout = {
  id: string;
  fieldId: string; // Connects to the key in initialReportState
  fieldType: 'text' | 'image';
  label: FieldPart; // Used for text fields
  value: FieldPart; // Used for text fields
  placeholder?: FieldPart; // Used for image fields
};

export type ImageData = {
  url: string;
  scale: number;
  x: number;
  y: number;
};
