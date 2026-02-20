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
  // --- Header Info ---
  {
    id: 'reportNum-L',
    fieldId: 'reportNumber',
    fieldType: 'text',
    label: { text: 'Report Num:', x: 145, y: 15, width: 25, height: 5, fontSize: 9 },
    value: { text: 'reportNumber', x: 170, y: 15, width: 30, height: 6, fontSize: 10, isBold: true }
  },
  {
    id: 'date-L',
    fieldId: 'date',
    fieldType: 'text',
    label: { text: 'Date:', x: 145, y: 22, width: 25, height: 5, fontSize: 9 },
    value: { text: 'date', x: 170, y: 22, width: 30, height: 6, fontSize: 10 }
  },

  // --- Identification Section ---
  {
    id: 'reg-L',
    fieldId: 'regNumber',
    fieldType: 'text',
    label: { text: 'Reg. Number:', x: 15, y: 45, width: 25, height: 5, fontSize: 9 },
    value: { text: 'regNumber', x: 45, y: 45, width: 45, height: 6, fontSize: 11, isBold: true }
  },
  {
    id: 'manuf-L',
    fieldId: 'manufacturer',
    fieldType: 'text',
    label: { text: 'Manufacturer:', x: 105, y: 45, width: 25, height: 5, fontSize: 9 },
    value: { text: 'manufacturer', x: 135, y: 45, width: 45, height: 6, fontSize: 10 }
  },
  {
    id: 'model-L',
    fieldId: 'model',
    fieldType: 'text',
    label: { text: 'Model / Type:', x: 15, y: 52, width: 25, height: 5, fontSize: 9 },
    value: { text: 'model', x: 45, y: 52, width: 45, height: 6, fontSize: 10 }
  },
  {
    id: 'fuel-L',
    fieldId: 'fuelType',
    fieldType: 'text',
    label: { text: 'Type of Fuel:', x: 105, y: 52, width: 25, height: 5, fontSize: 9 },
    value: { text: 'fuelType', x: 135, y: 52, width: 45, height: 6, fontSize: 10, inputType: 'dropdown', options: ['Petrol', 'Diesel', 'Hybrid', 'Electric'] }
  },
  {
    id: 'year-L',
    fieldId: 'manufactureYear',
    fieldType: 'text',
    label: { text: 'Year:', x: 15, y: 59, width: 25, height: 5, fontSize: 9 },
    value: { text: 'manufactureYear', x: 45, y: 59, width: 45, height: 6, fontSize: 10 }
  },
  {
    id: 'origin-L',
    fieldId: 'origin',
    fieldType: 'text',
    label: { text: 'Origin:', x: 105, y: 59, width: 25, height: 5, fontSize: 9 },
    value: { text: 'origin', x: 135, y: 59, width: 45, height: 6, fontSize: 10 }
  },

  // --- Drive Train ---
  {
    id: 'drive-L',
    fieldId: 'driveWheels',
    fieldType: 'text',
    label: { text: 'Drive Wheels:', x: 15, y: 80, width: 25, height: 5, fontSize: 9 },
    value: { text: 'driveWheels', x: 45, y: 80, width: 45, height: 6, fontSize: 10 }
  },
  {
    id: 'gear-L',
    fieldId: 'gearBox',
    fieldType: 'text',
    label: { text: 'Gear Box:', x: 105, y: 80, width: 25, height: 5, fontSize: 9 },
    value: { text: 'gearBox', x: 135, y: 80, width: 45, height: 6, fontSize: 10 }
  },

  // --- Valuation ---
  {
    id: 'marketVal-L',
    fieldId: 'marketValueNum',
    fieldType: 'text',
    label: { text: 'Market Value Rs:', x: 15, y: 245, width: 45, height: 5, isBold: true, fontSize: 11 },
    value: { text: 'marketValueNum', x: 65, y: 245, width: 60, height: 8, fontSize: 14, isBold: true, color: '#DC2626' }
  },
  {
    id: 'marketValWords-L',
    fieldId: 'marketValueText',
    fieldType: 'text',
    label: { text: 'In Words:', x: 15, y: 255, width: 25, height: 5, fontSize: 9 },
    value: { text: 'marketValueText', x: 45, y: 255, width: 145, height: 6, fontSize: 10 }
  },

  // --- Main Image ---
  {
    id: 'mainImg-L',
    fieldId: 'image1',
    fieldType: 'image',
    placeholder: { text: 'Main Photo', x: 15, y: 110, width: 180, height: 110, objectFit: 'cover' },
    label: {} as any,
    value: {} as any,
  }
];

export const initialLayout = fixedLayout;
