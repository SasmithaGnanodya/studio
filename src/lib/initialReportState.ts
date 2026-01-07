
import type { FieldLayout } from './types';

// src/lib/initialReportState.ts

export const initialReportState: { [key: string]: any } = {
  // --- Header ---
  reportNumber: "V1234",
  date: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD format
  inspectionLocation: "Colombo",
  inspectionTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
  
  // --- Row 1: Identification ---
  regNumber: "ABC-1234",
  manufacturer: "Toyota",
  model: "Vitz",
  fuelType: "Petrol",
  manufactureYear: "2019",
  
  // --- Row 2: Identification Cont. ---
  origin: "Japan",
  engineNumber: "1KR-FE-123456",
  chassisNumber: "KSP130-1234567",
  vehicleClass: "Motor Car",
  firstRegDate: "2020-01-15",

  // --- Conversions & Drive Train ---
  conversions: "No",
  driveWheels: "FWD",
  gearBox: "Automatic",
  gearSelection: "Floor",
  
  // --- Body Features ---
  bodyShape: "Just Low",
  numberOfDoors: "5",
  roofType: "Std",
  bodyLength: "Std",
  seatingCapacity: "D+4",
  weight: "650kg",
  color: "White",

  // --- Engine Specs ---
  displacement: "1000",
  fuelSystem: "EFI",
  engineType: "3 Cylinder",
  layout: "Front Transverse",
  engineCondition: "Serviceable",
  engineReplaced: "No",

  // --- Odometer & Electrical ---
  odometer: "50000",
  internalTrim: "Cloth",
  voltage: "12V",
  battery: "Functioning",
  starter: "Functioning",
  alternator: "Functioning",
  horn: "Functioning",
  wipers: "Functioning",
  lights: "Functioning",

  // --- Tyres (Front/Rear) ---
  tyreSizeFront: "165/70R14",
  tyreWasteFront: "60%",
  tyreSizeRear: "165/70R14",
  tyreWasteRear: "60%",

  // --- Suspension / Brakes / Steering ---
  suspensionFront: "Coil/Serviceable",
  suspensionRear: "Coil/Serviceable",
  brakesService: "ABS/Serviceable",
  brakesParking: "Hand/Serviceable",
  steering: "EPS/Serviceable",

  // --- General Condition ---
  chassisCondition: "Serviceable",
  bodyCondition: "Serviceable",
  paintCondition: "Serviceable",
  mechanicalCondition: "Serviceable",
  
  // --- Footer / Valuation ---
  writeOff: "No",
  roadTest: "Done",
  fuelConsumption: "Average",
  importDate: "2019-12-01",
  bodyPartsAvail: "Fair",
  enginePartsAvail: "Fair",
  accessoriesAvail: "Fair",
  extras: "A/C, Power Steering, Airbags",
  marketValueNum: "3,500,000",
  marketValueText: "Three Million Five Hundred Thousand Rupees",
  
  // --- Images (URLs from Firebase Storage) ---
  image1: 'https://picsum.photos/seed/1/600/400',
  imgFront: null,
  imgRear: null,
};


export const initialLayout: FieldLayout[] = [
    {
      id: 'regNumber-layout',
      fieldId: 'regNumber',
      fieldType: 'text',
      label: { text: 'Reg No.', x: 10, y: 10, width: 50, height: 5, isBold: false, color: '#000000' },
      value: { text: 'regNumber', x: 65, y: 10, width: 50, height: 5, isBold: false, color: '#000000' }
    },
    {
      id: 'manufacturer-layout',
      fieldId: 'manufacturer',
      fieldType: 'text',
      label: { text: 'Manufacturer', x: 10, y: 20, width: 50, height: 5, isBold: false, color: '#000000' },
      value: { text: 'manufacturer', x: 65, y: 20, width: 50, height: 5, isBold: false, color: '#000000' }
    },
    {
      id: 'model-layout',
      fieldId: 'model',
      fieldType: 'text',
      label: { text: 'Model', x: 10, y: 30, width: 50, height: 5, isBold: false, color: '#000000' },
      value: { text: 'model', x: 65, y: 30, width: 50, height: 5, isBold: false, color: '#000000' }
    },
    {
      id: 'image1-layout',
      fieldId: 'image1',
      fieldType: 'image',
      placeholder: { text: 'image1', x: 10, y: 150, width: 90, height: 60, color: '#0000FF' },
      // label and value are not used for images, but need to be present to satisfy the type
      label: {} as any,
      value: {} as any,
    }
];
