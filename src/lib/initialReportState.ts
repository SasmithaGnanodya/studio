import type { FieldLayout, ImageData } from './types';

export const initialReportState: { [key: string]: any } = {
  // Header Info
  reportNumber: "V" + Math.floor(1000 + Math.random() * 9000),
  date: new Date().toLocaleDateString('en-CA'),
  inspectionLocation: "Colombo",
  inspectionTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
  
  // Identification Section
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

  // Drive Train Section
  driveWheels: "FWD",
  gearBox: "Automatic",
  gearSelection: "Floor",
  clutch: "Serviceable",
  transferBox: "N/A",
  shafting: "Serviceable",
  differential: "Serviceable",
  
  // Body Section
  bodyShape: "Just Low",
  numberOfDoors: "5",
  roofType: "Std",
  bodyLength: "Std",
  seatingCapacity: "D+4",
  weight: "",
  color: "",

  // Engine Section
  displacement: "",
  fuelSystem: "EFI",
  engineType: "",
  engineLayout: "Front Transverse",
  engineCondition: "Serviceable",
  engineReplaced: "No",
  engineComments: "",

  // Condition & Electrical
  odometer: "",
  internalTrim: "Cloth",
  battery: "Good",
  starter: "Functioning",
  alternator: "Functioning",
  horn: "Functioning",
  wipers: "Functioning",
  lights: "Functioning",

  // Technical
  suspensionFront: "Good",
  suspensionRear: "Good",
  brakeService: "Good",
  brakeParking: "Good",
  steering: "Good",
  roadTest: "Satisfactory",
  
  // Valuation Section
  marketValueNum: "",
  marketValueText: "",
  forcedSaleValue: "",
  
  // Images
  image1: { url: '', scale: 1, x: 0, y: 0 } as ImageData,
};

export const fixedLayout: FieldLayout[] = [
  // --- Header ---
  {
    id: 'bank-name',
    fieldId: 'static_bank',
    fieldType: 'staticText',
    label: { text: 'Seylan Bank PLC', x: 80, y: 10, width: 50, height: 10, fontSize: 16, isBold: true, color: '#000080' },
    value: {} as any
  },
  {
    id: 'inspection-done',
    fieldId: 'static_inspection',
    fieldType: 'staticText',
    label: { text: 'Inspection Done at', x: 15, y: 25, width: 40, height: 5, fontSize: 9 },
    value: {} as any
  },
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
    id: 'id-title',
    fieldId: 'static_id_title',
    fieldType: 'staticText',
    label: { text: 'IDENTIFICATION', x: 15, y: 38, width: 50, height: 5, fontSize: 10, isBold: true },
    value: {} as any
  },
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
    label: { text: 'Manufactured Year:', x: 15, y: 59, width: 30, height: 5, fontSize: 9 },
    value: { text: 'manufactureYear', x: 45, y: 59, width: 45, height: 6, fontSize: 10 }
  },
  {
    id: 'origin-L',
    fieldId: 'origin',
    fieldType: 'text',
    label: { text: 'Country of Origin:', x: 105, y: 59, width: 30, height: 5, fontSize: 9 },
    value: { text: 'origin', x: 135, y: 59, width: 45, height: 6, fontSize: 10 }
  },
  {
    id: 'engineNum-L',
    fieldId: 'engineNumber',
    fieldType: 'text',
    label: { text: 'Engine Number:', x: 15, y: 66, width: 30, height: 5, fontSize: 9 },
    value: { text: 'engineNumber', x: 45, y: 66, width: 45, height: 6, fontSize: 10 }
  },
  {
    id: 'chassisNum-L',
    fieldId: 'chassisNumber',
    fieldType: 'text',
    label: { text: 'Chassis / Serial:', x: 105, y: 66, width: 30, height: 5, fontSize: 9 },
    value: { text: 'chassisNumber', x: 135, y: 66, width: 45, height: 6, fontSize: 10 }
  },

  // --- Drive Train ---
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
    value: { text: 'gearBox', x: 135, y: 82, width: 45, height: 6, fontSize: 10, inputType: 'dropdown', options: ['Automatic', 'Manual', 'CVT', 'AMT'] }
  },
  {
    id: 'gearsel-L',
    fieldId: 'gearSelection',
    fieldType: 'text',
    label: { text: 'Gear Selection:', x: 15, y: 89, width: 25, height: 5, fontSize: 9 },
    value: { text: 'gearSelection', x: 45, y: 89, width: 45, height: 6, fontSize: 10, inputType: 'dropdown', options: ['Floor', 'Column', 'Dial', 'Button'] }
  },

  // --- Body Features ---
  {
    id: 'body-title',
    fieldId: 'static_body_title',
    fieldType: 'staticText',
    label: { text: 'BODY FEATURES', x: 15, y: 98, width: 70, height: 5, fontSize: 10, isBold: true },
    value: {} as any
  },
  {
    id: 'shape-L',
    fieldId: 'bodyShape',
    fieldType: 'text',
    label: { text: 'Body Shape:', x: 15, y: 105, width: 25, height: 5, fontSize: 9 },
    value: { text: 'bodyShape', x: 45, y: 105, width: 45, height: 6, fontSize: 10 }
  },
  {
    id: 'doors-L',
    fieldId: 'numberOfDoors',
    fieldType: 'text',
    label: { text: 'No. of Doors:', x: 105, y: 105, width: 25, height: 5, fontSize: 9 },
    value: { text: 'numberOfDoors', x: 135, y: 105, width: 45, height: 6, fontSize: 10 }
  },
  {
    id: 'color-L',
    fieldId: 'color',
    fieldType: 'text',
    label: { text: 'Body Colour:', x: 15, y: 112, width: 25, height: 5, fontSize: 9 },
    value: { text: 'color', x: 45, y: 112, width: 45, height: 6, fontSize: 10 }
  },

  // --- Main Image ---
  {
    id: 'mainImg-L',
    fieldId: 'image1',
    fieldType: 'image',
    placeholder: { text: 'Main Photo', x: 15, y: 125, width: 180, height: 100, objectFit: 'cover' },
    label: {} as any,
    value: {} as any,
  },

  // --- Condition & Technical ---
  {
    id: 'cond-title',
    fieldId: 'static_cond_title',
    fieldType: 'staticText',
    label: { text: 'CONDITION AND TECHNICAL', x: 15, y: 230, width: 70, height: 5, fontSize: 10, isBold: true },
    value: {} as any
  },
  {
    id: 'odo-L',
    fieldId: 'odometer',
    fieldType: 'text',
    label: { text: 'Odometer:', x: 15, y: 237, width: 25, height: 5, fontSize: 9 },
    value: { text: 'odometer', x: 45, y: 237, width: 45, height: 6, fontSize: 10 }
  },
  {
    id: 'road-L',
    fieldId: 'roadTest',
    fieldType: 'text',
    label: { text: 'Road Test:', x: 105, y: 237, width: 25, height: 5, fontSize: 9 },
    value: { text: 'roadTest', x: 135, y: 237, width: 45, height: 6, fontSize: 10 }
  },

  // --- Valuation ---
  {
    id: 'marketVal-L',
    fieldId: 'marketValueNum',
    fieldType: 'text',
    label: { text: 'Market Value Rs:', x: 15, y: 255, width: 45, height: 5, isBold: true, fontSize: 11 },
    value: { text: 'marketValueNum', x: 65, y: 255, width: 60, height: 8, fontSize: 14, isBold: true, color: '#DC2626' }
  },
  {
    id: 'marketValWords-L',
    fieldId: 'marketValueText',
    fieldType: 'text',
    label: { text: 'In Words:', x: 15, y: 265, width: 25, height: 5, fontSize: 9 },
    value: { text: 'marketValueText', x: 45, y: 265, width: 145, height: 6, fontSize: 10 }
  },
  {
    id: 'forced-L',
    fieldId: 'forcedSaleValue',
    fieldType: 'text',
    label: { text: 'Forced Sale Value:', x: 15, y: 275, width: 45, height: 5, fontSize: 9, isBold: true },
    value: { text: 'forcedSaleValue', x: 65, y: 275, width: 60, height: 6, fontSize: 11 }
  }
];

export const initialLayout = fixedLayout;
