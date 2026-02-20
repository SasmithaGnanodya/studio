export type FieldPart = {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isBold?: boolean;
  color?: string;
  fontSize?: number;
  inputType?: 'text' | 'dropdown';
  options?: string[];
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
};

export type FieldLayout = {
  id: string;
  fieldId: string;
  fieldType: 'text' | 'image' | 'staticText';
  label: FieldPart;
  value: FieldPart;
  placeholder?: FieldPart;
  isLocked?: boolean;
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
  reportData: { [key: string]: any };
  createdAt: { seconds: number, nanoseconds: number };
  updatedAt: { seconds: number, nanoseconds: number };
  layoutId?: string | null;
};
