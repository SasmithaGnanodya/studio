// src/components/ReportPage.tsx

import React from 'react';

type ReportPageProps = {
  data: any;
  isCalibrating: boolean;
};

export const ReportPage = ({ data, isCalibrating }: ReportPageProps) => {

  const Y_HEADER = '38mm';
  const Y_ROW_1 = '52mm'; 
  const Y_ROW_2 = '62mm'; 
  const Y_CONVERT = '78mm';
  const Y_BODY = '90mm';
  const Y_ENGINE = '120mm';
  const Y_TYRES = '190mm';
  const Y_VALUATION = '275mm';

  const X_COL_1 = '5mm';
  const X_COL_2 = '27mm';
  const X_COL_3 = '61mm';
  const X_COL_4 = '120mm';
  const X_COL_5 = '155mm';

  return (
    <div className={`report-page ${isCalibrating ? 'calibration-mode' : ''}`}>

      {/* --- HEADER --- */}
      <div className="field" style={{ top: '30mm', left: '160mm', width: '40mm' }}>
        {data.reportNumber}
      </div>
      <div className="field" style={{ top: '35mm', left: '160mm', width: '40mm' }}>
        {data.date}
      </div>

      {/* --- ROW 1: REGISTRATION --- */}
      <div className="field" style={{ top: Y_ROW_1, left: X_COL_1, width: '22mm' }}>
        {data.regNumber}
      </div>
      <div className="field" style={{ top: Y_ROW_1, left: X_COL_2, width: '34mm' }}>
        {data.manufacturer}
      </div>
      <div className="field" style={{ top: Y_ROW_1, left: X_COL_3, width: '59mm' }}>
        {data.model}
      </div>
      <div className="field" style={{ top: Y_ROW_1, left: X_COL_4, width: '35mm' }}>
        {data.fuelType}
      </div>
      <div className="field" style={{ top: Y_ROW_1, left: X_COL_5, width: '32mm' }}>
        {data.manufactureYear}
      </div>

      {/* --- ROW 2: ORIGIN & NUMBERS --- */}
      <div className="field" style={{ top: Y_ROW_2, left: X_COL_1, width: '22mm' }}>
        {data.origin}
      </div>
      <div className="field" style={{ top: Y_ROW_2, left: X_COL_2, width: '34mm' }}>
        {data.engineNumber}
      </div>
      <div className="field" style={{ top: Y_ROW_2, left: X_COL_3, width: '59mm' }}>
        {data.chassisNumber}
      </div>
      <div className="field" style={{ top: Y_ROW_2, left: X_COL_4, width: '35mm' }}>
        {data.vehicleClass}
      </div>

      {/* --- BODY FEATURES GRID --- */}
      <div className="field" style={{ top: '90mm', left: '40mm' }}>{data.bodyShape}</div>
      <div className="field" style={{ top: '95mm', left: '40mm' }}>{data.numberOfDoors}</div>
      <div className="field" style={{ top: '100mm', left: '40mm' }}>{data.roofType}</div>
      <div className="field" style={{ top: '105mm', left: '40mm' }}>{data.seatingCapacity}</div>
      
      {/* --- ENGINE SPECS --- */}
      <div className="field" style={{ top: '122mm', left: '25mm' }}>{data.displacement}</div>
      <div className="field" style={{ top: '127mm', left: '25mm' }}>{data.fuelSystem}</div>
      <div className="field" style={{ top: '132mm', left: '25mm' }}>{data.engineType}</div>
      <div className="field" style={{ top: '142mm', left: '25mm' }}>{data.engineCondition}</div>

      {/* --- ODOMETER (Middle Right) --- */}
      <div className="field" style={{ top: '125mm', left: '160mm' }}>{data.odometer} KM</div>
      
      {/* --- ELECTRICAL --- */}
      <div className="field small" style={{ top: '135mm', left: '170mm' }}>{data.battery}</div>
      <div className="field small" style={{ top: '140mm', left: '170mm' }}>{data.starter}</div>
      <div className="field small" style={{ top: '145mm', left: '170mm' }}>{data.alternator}</div>

      {/* --- TYRES --- */}
      <div className="field" style={{ top: '192mm', left: '30mm' }}>{data.tyreSizeFront}</div>
      <div className="field" style={{ top: '192mm', left: '50mm' }}>{data.tyreWasteFront}</div>
      <div className="field" style={{ top: '198mm', left: '30mm' }}>{data.tyreSizeRear}</div>
      <div className="field" style={{ top: '198mm', left: '50mm' }}>{data.tyreWasteRear}</div>

      {/* --- VALUATION (Bottom) --- */}
      <div className="field large" style={{ top: '275mm', left: '40mm', fontWeight: 'bold' }}>
        Rs. {data.marketValueNum}
      </div>
      <div className="field" style={{ top: '280mm', left: '40mm' }}>
        {data.marketValueText}
      </div>
      <div className="field" style={{ top: '285mm', left: '40mm' }}>
        FSV: {data.forcedSaleValue}
      </div>

       {/* --- IMAGES --- */}
       {data.imgFront && (
        <img src={data.imgFront} 
             style={{ position: 'absolute', top: '10mm', left: '10mm', width: '40mm', height: '30mm', zIndex: 5 }} 
             alt="Front" />
       )}
       {data.imgRear && (
        <img src={data.imgRear} 
             style={{ position: 'absolute', top: '10mm', left: '160mm', width: '40mm', height: '30mm', zIndex: 5 }} 
             alt="Rear" />
       )}
    </div>
  );
};
