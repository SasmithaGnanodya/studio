import type { FieldLayout, ImageData } from './types';

export const initialReportState: { [key: string]: any } = {
  // Header
  reportNumber: "V1234",
  date: new Date().toLocaleDateString('en-CA'),
  inspectionLocation: "Colombo",
  inspectionTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
  
  // Identification
  regNumber: "ABC-1234",
  manufacturer: "Toyota",
  model: "Vitz",
  fuelType: "Petrol",
  manufactureYear: "2019",
  origin: "Japan",
  engineNumber: "1KR-FE-123456",
  chassisNumber: "KSP130-1234567",
  vehicleClass: "Motor Car",
  firstRegDate: "2020-01-15",

  // Drive Train
  conversions: "No",
  driveWheels: "FWD",
  gearBox: "Automatic",
  gearSelection: "Floor",
  
  // Body
  bodyShape: "Just Low",
  numberOfDoors: "5",
  roofType: "Std",
  bodyLength: "Std",
  seatingCapacity: "D+4",
  weight: "650kg",
  color: "White",

  // Engine
  displacement: "1000",
  fuelSystem: "EFI",
  engineType: "3 Cylinder",
  layout: "Front Transverse",
  engineCondition: "Serviceable",
  engineReplaced: "No",

  // Condition
  odometer: "50000",
  internalTrim: "Cloth",
  battery: "Functioning",
  starter: "Functioning",
  alternator: "Functioning",
  horn: "Functioning",
  wipers: "Functioning",
  lights: "Functioning",

  // Valuation
  marketValueNum: "3,500,000",
  marketValueText: "Three Million Five Hundred Thousand Rupees",
  
  // Images
  image1: { url: 'https://picsum.photos/seed/1/600/400', scale: 1, x: 0, y: 0 } as ImageData,
};

export const fixedLayout: FieldLayout[] = [
  // --- ROW 1: Header Info ---
  {
    id: 'reportNum-L',
    fieldId: 'reportNumber',
    fieldType: 'text',
    label: { text: 'Report Num:', x: 10, y: 10, width: 30, height: 5, fontSize: 10 },
    value: { text: 'reportNumber', x: 40, y: 10, width: 40, height: 6, fontSize: 11, isBold: true }
  },
  {
    id: 'date-L',
    fieldId: 'date',
    fieldType: 'text',
    label: { text: 'Date:', x: 100, y: 10, width: 20, height: 5, fontSize: 10 },
    value: { text: 'date', x: 120, y: 10, width: 40, height: 6, fontSize: 11 }
  },

  // --- ROW 2: Identification ---
  {
    id: 'reg-L',
    fieldId: 'regNumber',
    fieldType: 'text',
    label: { text: 'Reg. Number:', x: 10, y: 25, width: 30, height: 5, fontSize: 10 },
    value: { text: 'regNumber', x: 40, y: 25, width: 40, height: 6, fontSize: 12, isBold: true }
  },
  {
    id: 'manuf-L',
    fieldId: 'manufacturer',
    fieldType: 'text',
    label: { text: 'Manufacturer:', x: 100, y: 25, width: 30, height: 5, fontSize: 10 },
    value: { text: 'manufacturer', x: 130, y: 25, width: 40, height: 6, fontSize: 11 }
  },

  // --- ROW 3: More Identification ---
  {
    id: 'model-L',
    fieldId: 'model',
    fieldType: 'text',
    label: { text: 'Model / Type:', x: 10, y: 35, width: 30, height: 5, fontSize: 10 },
    value: { text: 'model', x: 40, y: 35, width: 40, height: 6, fontSize: 11 }
  },
  {
    id: 'fuel-L',
    fieldId: 'fuelType',
    fieldType: 'text',
    label: { text: 'Type of Fuel:', x: 100, y: 35, width: 30, height: 5, fontSize: 10 },
    value: { text: 'fuelType', x: 130, y: 35, width: 40, height: 6, fontSize: 11, inputType: 'dropdown', options: ['Petrol', 'Diesel', 'Hybrid', 'Electric'] }
  },

  // --- ROW 4: Engine / Chassis ---
  {
    id: 'engineNum-L',
    fieldId: 'engineNumber',
    fieldType: 'text',
    label: { text: 'Engine Number:', x: 10, y: 45, width: 30, height: 5, fontSize: 10 },
    value: { text: 'engineNumber', x: 40, y: 45, width: 50, height: 6, fontSize: 11 }
  },
  {
    id: 'chassisNum-L',
    fieldId: 'chassisNumber',
    fieldType: 'text',
    label: { text: 'Chassis Number:', x: 100, y: 45, width: 30, height: 5, fontSize: 10 },
    value: { text: 'chassisNumber', x: 130, y: 45, width: 50, height: 6, fontSize: 11 }
  },

  // --- ROW 5: Condition ---
  {
    id: 'odo-L',
    fieldId: 'odometer',
    fieldType: 'text',
    label: { text: 'Odometer:', x: 10, y: 60, width: 30, height: 5, fontSize: 10 },
    value: { text: 'odometer', x: 40, y: 60, width: 30, height: 6, fontSize: 11 }
  },
  {
    id: 'color-L',
    fieldId: 'color',
    fieldType: 'text',
    label: { text: 'Color:', x: 100, y: 60, width: 30, height: 5, fontSize: 10 },
    value: { text: 'color', x: 130, y: 60, width: 40, height: 6, fontSize: 11 }
  },

  // --- Valuation ---
  {
    id: 'marketVal-L',
    fieldId: 'marketValueNum',
    fieldType: 'text',
    label: { text: 'Market Value Rs:', x: 10, y: 240, width: 40, height: 5, isBold: true, fontSize: 12 },
    value: { text: 'marketValueNum', x: 55, y: 240, width: 50, height: 8, fontSize: 14, isBold: true, color: '#FF0000' }
  },
  {
    id: 'marketValWords-L',
    fieldId: 'marketValueText',
    fieldType: 'text',
    label: { text: 'In Words:', x: 10, y: 250, width: 30, height: 5, fontSize: 10 },
    value: { text: 'marketValueText', x: 45, y: 250, width: 140, height: 6, fontSize: 11 }
  },

  // --- Main Image ---
  {
    id: 'mainImg-L',
    fieldId: 'image1',
    fieldType: 'image',
    placeholder: { text: 'Main Photo', x: 10, y: 100, width: 190, height: 120, objectFit: 'cover' },
    label: {} as any,
    value: {} as any,
  }
];
