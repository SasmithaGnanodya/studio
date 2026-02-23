import type { FieldLayout, ImageData } from './types';

export const initialReportState: { [key: string]: any } = {
  reportNumber: "V-PENDING",
  valuationCode: "", // System generated on save
  date: "", // To be filled on client to avoid hydration mismatch
  inspectionLocation: "Colombo",
  regNumber: "",
  manufacturer: "",
  model: "",
  fuelType: "Petrol",
  manufactureYear: "",
  origin: "",
  engineNumber: "",
  chassisNumber: "",
  vehicleClass: "Motor Car",
  firstRegDate: "",
  conversions: "No",
  driveWheels: "FWD",
  gearBox: "Automatic",
  gearSelection: "Floor",
  clutch: "Serviceable",
  transferBox: "N/A",
  shafting: "Serviceable",
  differential: "Serviceable",
  bodyShape: "Just Low",
  numberOfDoors: "5",
  roofType: "Std",
  bodyLength: "Std",
  seatingCapacity: "D+4",
  weight: "",
  color: "",
  displacement: "",
  fuelSystem: "EFI",
  engineType: "",
  engineLayout: "Front Transverse",
  engineCondition: "Serviceable",
  engineReplaced: "No",
  engineComments: "",
  odometer: "",
  internalTrim: "Cloth",
  battery: "Good",
  starter: "Functioning",
  alternator: "Functioning",
  horn: "Functioning",
  wipers: "Functioning",
  lights: "Functioning",
  suspensionFront: "Good",
  suspensionRear: "Good",
  brakeService: "Good",
  brakeParking: "Good",
  steering: "Good",
  roadTest: "Satisfactory",
  marketValueNum: "",
  marketValueText: "",
  forcedSaleValue: "",
  conditionScore: "Excellent", // Default for scoring fields
  image1: { url: '', scale: 1, x: 0, y: 0 } as ImageData,
};

export const fixedLayout: FieldLayout[] = [
  // --- Header ---
  {
    id: 'bank-name',
    fieldId: 'static_bank',
    fieldType: 'staticText',
    label: { text: 'Seylan Bank PLC', x: 80, y: 10, width: 50, height: 10, fontSize: 16, isBold: true, color: '#000080' },
    value: {} as any,
    isLocked: true
  },
  {
    id: 'inspection-loc',
    fieldId: 'inspectionLocation',
    fieldType: 'text',
    label: { text: 'Inspection Done at:', x: 15, y: 15, width: 35, height: 5, fontSize: 9 },
    value: { text: 'inspectionLocation', x: 50, y: 15, width: 45, height: 6, fontSize: 10 }
  },
  {
    id: 'reportNum-L',
    fieldId: 'reportNumber',
    fieldType: 'text',
    label: { text: 'Report Num:', x: 145, y: 15, width: 25, height: 5, fontSize: 9 },
    value: { text: 'reportNumber', x: 170, y: 15, width: 30, height: 6, fontSize: 10, isBold: true },
    isLocked: true
  },
  {
    id: 'date-L',
    fieldId: 'date',
    fieldType: 'text',
    label: { text: 'Date:', x: 145, y: 22, width: 25, height: 5, fontSize: 9 },
    value: { text: 'date', x: 170, y: 22, width: 30, height: 6, fontSize: 10 },
    isLocked: true
  },

  // --- Identification ---
  {
    id: 'reg-L',
    fieldId: 'regNumber',
    fieldType: 'text',
    label: { text: 'Reg. Number:', x: 15, y: 40, width: 25, height: 5, fontSize: 9 },
    value: { text: 'regNumber', x: 45, y: 40, width: 45, height: 6, fontSize: 11, isBold: true },
    isLocked: true
  },
  {
    id: 'manuf-L',
    fieldId: 'manufacturer',
    fieldType: 'text',
    label: { text: 'Manufacturer:', x: 105, y: 40, width: 25, height: 5, fontSize: 9 },
    value: { text: 'manufacturer', x: 135, y: 40, width: 45, height: 6, fontSize: 10 }
  },
  {
    id: 'model-L',
    fieldId: 'model',
    fieldType: 'text',
    label: { text: 'Model / Type:', x: 15, y: 47, width: 25, height: 5, fontSize: 9 },
    value: { text: 'model', x: 45, y: 47, width: 45, height: 6, fontSize: 10 }
  },
  {
    id: 'fuel-L',
    fieldId: 'fuelType',
    fieldType: 'text',
    label: { text: 'Type of Fuel:', x: 105, y: 47, width: 25, height: 5, fontSize: 9 },
    value: { text: 'fuelType', x: 135, y: 47, width: 45, height: 6, fontSize: 10, inputType: 'dropdown', options: ['Petrol', 'Diesel', 'Hybrid', 'Electric'] }
  },
  {
    id: 'year-L',
    fieldId: 'manufactureYear',
    fieldType: 'text',
    label: { text: 'Manufactured Year:', x: 15, y: 54, width: 30, height: 5, fontSize: 9 },
    value: { text: 'manufactureYear', x: 45, y: 54, width: 45, height: 6, fontSize: 10 }
  },
  {
    id: 'origin-L',
    fieldId: 'origin',
    fieldType: 'text',
    label: { text: 'Country of Origin:', x: 105, y: 54, width: 30, height: 5, fontSize: 9 },
    value: { text: 'origin', x: 135, y: 54, width: 45, height: 6, fontSize: 10 }
  },

  // --- Technical ---
  {
    id: 'engNum-L',
    fieldId: 'engineNumber',
    fieldType: 'text',
    label: { text: 'Engine Number:', x: 15, y: 61, width: 25, height: 5, fontSize: 9 },
    value: { text: 'engineNumber', x: 45, y: 61, width: 45, height: 6, fontSize: 10 },
    isLocked: true
  },
  {
    id: 'chassis-L',
    fieldId: 'chassisNumber',
    fieldType: 'text',
    label: { text: 'Chassis Number:', x: 105, y: 61, width: 30, height: 5, fontSize: 9 },
    value: { text: 'chassisNumber', x: 135, y: 61, width: 45, height: 6, fontSize: 10 },
    isLocked: true
  },

  // --- Drive Train Title ---
  {
    id: 'dt-title',
    fieldId: 'static_dt_title',
    fieldType: 'staticText',
    label: { text: 'DRIVE TRAIN AND TRANSMISSION', x: 15, y: 75, width: 70, height: 5, fontSize: 10, isBold: true },
    value: {} as any
  },
  {
    id: 'drive-L',
    fieldId: 'driveWheels',
    fieldType: 'text',
    label: { text: 'Drive Wheels:', x: 15, y: 82, width: 25, height: 5, fontSize: 9 },
    value: { text: 'driveWheels', x: 45, y: 82, width: 45, height: 6, fontSize: 10, inputType: 'dropdown', options: ['FWD', 'RWD', '4WD', 'AWD'] }
  },
  {
    id: 'gear-L',
    fieldId: 'gearBox',
    fieldType: 'text',
    label: { text: 'Gear Box:', x: 105, y: 82, width: 25, height: 5, fontSize: 9 },
    value: { text: 'gearBox', x: 135, y: 82, width: 45, height: 6, fontSize: 10, inputType: 'dropdown', options: ['Manual', 'Automatic', 'CVT'] }
  },

  // --- Body Features ---
  {
    id: 'body-title',
    fieldId: 'static_body_title',
    fieldType: 'staticText',
    label: { text: 'BODY FEATURES', x: 15, y: 95, width: 70, height: 5, fontSize: 10, isBold: true },
    value: {} as any
  },
  {
    id: 'doors-L',
    fieldId: 'numberOfDoors',
    fieldType: 'text',
    label: { text: 'Number of Doors:', x: 15, y: 102, width: 30, height: 5, fontSize: 9 },
    value: { text: 'numberOfDoors', x: 45, y: 102, width: 45, height: 6, fontSize: 10 }
  },
  {
    id: 'color-L',
    fieldId: 'color',
    fieldType: 'text',
    label: { text: 'Body Colour:', x: 105, y: 102, width: 25, height: 5, fontSize: 9 },
    value: { text: 'color', x: 135, y: 102, width: 45, height: 6, fontSize: 10 }
  },

  // --- Image ---
  {
    id: 'mainImg-L',
    fieldId: 'image1',
    fieldType: 'image',
    placeholder: { text: 'Main Photo', x: 15, y: 125, width: 180, height: 100, objectFit: 'cover' },
    label: {} as any,
    value: {} as any,
  },

  // --- Valuation ---
  {
    id: 'val-title',
    fieldId: 'static_val_title',
    fieldType: 'staticText',
    label: { text: 'VALUATION DETAILS', x: 15, y: 240, width: 70, height: 5, fontSize: 10, isBold: true },
    value: {} as any
  },
  {
    id: 'marketVal-L',
    fieldId: 'marketValueNum',
    fieldType: 'text',
    label: { text: 'Market Value Rs:', x: 15, y: 255, width: 45, height: 5, isBold: true, fontSize: 11 },
    value: { text: 'marketValueNum', x: 65, y: 255, width: 60, height: 8, fontSize: 14, isBold: true, color: '#DC2626' }
  },
  {
    id: 'marketValText-L',
    fieldId: 'marketValueText',
    fieldType: 'text',
    label: { text: 'In Words:', x: 15, y: 265, width: 35, height: 5, fontSize: 9 },
    value: { text: 'marketValueText', x: 50, y: 265, width: 145, height: 6, fontSize: 10 },
    autoFillType: 'numberToWords',
    autoFillSource: 'marketValueNum'
  },
  {
    id: 'forcedVal-L',
    fieldId: 'forcedSaleValue',
    fieldType: 'text',
    label: { text: 'Forced Sale Value Rs:', x: 15, y: 275, width: 45, height: 5, fontSize: 10 },
    value: { text: 'forcedSaleValue', x: 65, y: 275, width: 60, height: 6, fontSize: 11 }
  }
];

export const initialLayout = fixedLayout;
