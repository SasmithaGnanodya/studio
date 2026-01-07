
import type { FieldLayout } from './types';

// src/lib/initialReportState.ts

export const initialReportState = {
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
  forcedSaleValue: "3,000,000",
  
  // --- Images (URLs from Firebase Storage) ---
  imgFront: null,
  imgRear: null,
};


export const initialLayout: FieldLayout[] = [
  // Header
  { id: 'reportNumber', label: 'Report No.', x: 160, y: 30, width: 40, height: 5, subFields: [{ id: 'reportNumber', label: 'Report No.', x: 0, y: 0, width: 40, height: 5 }] },
  { id: 'date', label: 'Date', x: 160, y: 35, width: 40, height: 5, subFields: [{ id: 'date', label: 'Date', x: 0, y: 0, width: 40, height: 5 }] },
  // Row 1
  { id: 'regNumber', label: 'Reg No.', x: 5, y: 52, width: 22, height: 5, subFields: [{ id: 'regNumber', label: 'Reg No.', x: 0, y: 0, width: 22, height: 5 }] },
  { id: 'manufacturer', label: 'Manufacturer', x: 27, y: 52, width: 34, height: 5, subFields: [{ id: 'manufacturer', label: 'Manufacturer', x: 0, y: 0, width: 34, height: 5 }] },
  { id: 'model', label: 'Model', x: 61, y: 52, width: 59, height: 5, subFields: [{ id: 'model', label: 'Model', x: 0, y: 0, width: 59, height: 5 }] },
  { id: 'fuelType', label: 'Fuel Type', x: 120, y: 52, width: 35, height: 5, subFields: [{ id: 'fuelType', label: 'Fuel Type', x: 0, y: 0, width: 35, height: 5 }] },
  { id: 'manufactureYear', label: 'Manuf. Year', x: 155, y: 52, width: 32, height: 5, subFields: [{ id: 'manufactureYear', label: 'Manuf. Year', x: 0, y: 0, width: 32, height: 5 }] },
  // Row 2
  { id: 'origin', label: 'Origin', x: 5, y: 62, width: 22, height: 5, subFields: [{ id: 'origin', label: 'Origin', x: 0, y: 0, width: 22, height: 5 }] },
  { id: 'engineNumber', label: 'Engine No.', x: 27, y: 62, width: 34, height: 5, subFields: [{ id: 'engineNumber', label: 'Engine No.', x: 0, y: 0, width: 34, height: 5 }] },
  { id: 'chassisNumber', label: 'Chassis No.', x: 61, y: 62, width: 59, height: 5, subFields: [{ id: 'chassisNumber', label: 'Chassis No.', x: 0, y: 0, width: 59, height: 5 }] },
  { id: 'vehicleClass', label: 'Class', x: 120, y: 62, width: 35, height: 5, subFields: [{ id: 'vehicleClass', label: 'Class', x: 0, y: 0, width: 35, height: 5 }] },
  // Body
  { id: 'bodyShape', label: 'Body Shape', x: 40, y: 90, width: 40, height: 5, subFields: [{ id: 'bodyShape', label: 'Body Shape', x: 0, y: 0, width: 40, height: 5 }] },
  { id: 'numberOfDoors', label: 'Doors', x: 40, y: 95, width: 40, height: 5, subFields: [{ id: 'numberOfDoors', label: 'Doors', x: 0, y: 0, width: 40, height: 5 }] },
  { id: 'roofType', label: 'Roof', x: 40, y: 100, width: 40, height: 5, subFields: [{ id: 'roofType', label: 'Roof', x: 0, y: 0, width: 40, height: 5 }] },
  { id: 'seatingCapacity', label: 'Seats', x: 40, y: 105, width: 40, height: 5, subFields: [{ id: 'seatingCapacity', label: 'Seats', x: 0, y: 0, width: 40, height: 5 }] },
  // Engine
  { id: 'displacement', label: 'Displacement (CC)', x: 25, y: 122, width: 40, height: 5, subFields: [{ id: 'displacement', label: 'Displacement (CC)', x: 0, y: 0, width: 40, height: 5 }] },
  { id: 'fuelSystem', label: 'Fuel System', x: 25, y: 127, width: 40, height: 5, subFields: [{ id: 'fuelSystem', label: 'Fuel System', x: 0, y: 0, width: 40, height: 5 }] },
  { id: 'engineType', label: 'Engine Type', x: 25, y: 132, width: 40, height: 5, subFields: [{ id: 'engineType', label: 'Engine Type', x: 0, y: 0, width: 40, height: 5 }] },
  { id: 'engineCondition', label: 'Engine Condition', x: 25, y: 142, width: 40, height: 5, subFields: [{ id: 'engineCondition', label: 'Engine Condition', x: 0, y: 0, width: 40, height: 5 }] },
  // Odometer
  { id: 'odometer', label: 'Odometer (KM)', x: 160, y: 125, width: 40, height: 5, subFields: [{ id: 'odometer', label: 'Odometer (KM)', x: 0, y: 0, width: 40, height: 5 }] },
  // Electrical
  { id: 'battery', label: 'Battery', x: 170, y: 135, width: 30, height: 5, className: 'small', subFields: [{ id: 'battery', label: 'Battery', x: 0, y: 0, width: 30, height: 5, className: 'small' }] },
  { id: 'starter', label: 'Starter', x: 170, y: 140, width: 30, height: 5, className: 'small', subFields: [{ id: 'starter', label: 'Starter', x: 0, y: 0, width: 30, height: 5, className: 'small' }] },
  { id: 'alternator', label: 'Alternator', x: 170, y: 145, width: 30, height: 5, className: 'small', subFields: [{ id: 'alternator', label: 'Alternator', x: 0, y: 0, width: 30, height: 5, className: 'small' }] },
  // Tyres
  { id: 'tyreSizeFront', label: 'Front Tyres', x: 30, y: 192, width: 20, height: 5, subFields: [{ id: 'tyreSizeFront', label: 'Front Tyres', x: 0, y: 0, width: 20, height: 5 }] },
  { id: 'tyreWasteFront', label: 'Front Tyre Waste', x: 50, y: 192, width: 20, height: 5, subFields: [{ id: 'tyreWasteFront', label: 'Front Tyre Waste', x: 0, y: 0, width: 20, height: 5 }] },
  { id: 'tyreSizeRear', label: 'Rear Tyres', x: 30, y: 198, width: 20, height: 5, subFields: [{ id: 'tyreSizeRear', label: 'Rear Tyres', x: 0, y: 0, width: 20, height: 5 }] },
  { id: 'tyreWasteRear', label: 'Rear Tyre Waste', x: 50, y: 198, width: 20, height: 5, subFields: [{ id: 'tyreWasteRear', label: 'Rear Tyre Waste', x: 0, y: 0, width: 20, height: 5 }] },
  // Valuation
  { id: 'marketValueNum', label: 'Market Value (Rs.)', x: 40, y: 275, width: 100, height: 5, className: 'large', subFields: [{ id: 'marketValueNum', label: 'Market Value (Rs.)', x: 0, y: 0, width: 100, height: 5, className: 'large' }] },
  { id: 'marketValueText', label: 'In Words', x: 40, y: 280, width: 150, height: 5, subFields: [{ id: 'marketValueText', label: 'In Words', x: 0, y: 0, width: 150, height: 5 }] },
  { id: 'forcedSaleValue', label: 'Forced Sale (Rs.)', x: 40, y: 285, width: 100, height: 5, subFields: [{ id: 'forcedSaleValue', label: 'Forced Sale (Rs.)', x: 0, y: 0, width: 100, height: 5 }] },
];
