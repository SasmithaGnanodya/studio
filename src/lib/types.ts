export type FieldPart = {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isBold?: boolean;
  color?: string;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  inputType?: 'text' | 'dropdown' | 'combobox';
  options?: string[];
  optionWeights?: Record<string, number>; // Mapping option label to a numeric value for calculations
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  isPriceFormat?: boolean; // New: Enforce comma-separated currency with .00 suffix
};

export type FieldLayout = {
  id: string;
  fieldId: string;
  fieldType: 'text' | 'image' | 'staticText';
  label: FieldPart;
  value: FieldPart;
  placeholder?: FieldPart;
  isLocked?: boolean;
  autoFillType?: 'numberToWords' | 'none';
  autoFillSource?: string; // fieldId of the numeric source
};

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
  fit?: 'cover' | 'contain';
};

export type Report = {
  id: string;
  vehicleId: string; // Registration Number
  engineNumber?: string;
  chassisNumber?: string;
  reportNumber?: string;
  reportDate?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  reportData: { [key: string]: any };
  createdAt: { seconds: number, nanoseconds: number };
  updatedAt: { seconds: number, nanoseconds: number };
  layoutId?: string | null;
};

export type ReportHistory = Report & {
  reportId: string;
  savedAt: { seconds: number, nanoseconds: number };
};
