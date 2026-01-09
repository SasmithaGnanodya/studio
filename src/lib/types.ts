

export type FieldPart = {
  text: string; // The static text for a label, or the data ID for a value
  x: number;
  y: number;
  width: number;
  height: number;
  isBold?: boolean;
  color?: string;
  fontSize?: number; // Added font size property
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

// New type for a complete layout document
export type LayoutDocument = {
  id: string;
  fields: FieldLayout[];
  version: number;
  createdAt: { seconds: number; nanoseconds: number; };
}

export type ImageData = {
  url: string;
  scale: number;
  x: number;
  y: number;
};

export type Report = {
  id:string;
  vehicleId: string; // e.g. registration number
  userId: string;
  userName?: string; // Add userName to the report
  reportData: { [key: string]: any };
  createdAt: { seconds: number, nanoseconds: number };
  updatedAt: { seconds: number, nanoseconds: number };
  layoutId: string; // <-- Link to the layout version
};

