import type { FieldLayout, ImageData } from './types';

export const initialReportState: { [key: string]: any } = {
  // Common fields derived from the requested layout
  reportNumber: "V" + Math.floor(1000 + Math.random() * 9000),
  date: new Date().toLocaleDateString('en-CA'),
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
  image1: { url: '', scale: 1, x: 0, y: 0 } as ImageData,
};

// This is the baseline layout. It will be used if no layout is found in Firestore.
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

  // --- Identification ---
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
    id: 'marketVal-L',
    fieldId: 'marketValueNum',
    fieldType: 'text',
    label: { text: 'Market Value Rs:', x: 15, y: 255, width: 45, height: 5, isBold: true, fontSize: 11 },
    value: { text: 'marketValueNum', x: 65, y: 255, width: 60, height: 8, fontSize: 14, isBold: true, color: '#DC2626' }
  }
];

export const initialLayout = fixedLayout;
