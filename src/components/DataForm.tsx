// src/components/DataForm.tsx

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type DataFormProps = {
  data: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

const FormField = ({ id, label, value, onChange }: { id: string, label: string, value: string, onChange: any }) => (
  <div className="grid grid-cols-3 items-center gap-4">
    <Label htmlFor={id} className="text-sm font-medium text-right">{label}</Label>
    <Input id={id} name={id} value={value} onChange={onChange} className="col-span-2" />
  </div>
);

export const DataForm = ({ data, onChange }: DataFormProps) => {
  return (
    <Accordion type="multiple" defaultValue={['header', 'identification']} className="w-full">
      <AccordionItem value="header">
        <AccordionTrigger>Header</AccordionTrigger>
        <AccordionContent className="space-y-4">
          <FormField id="reportNumber" label="Report No." value={data.reportNumber} onChange={onChange} />
          <FormField id="date" label="Date" value={data.date} onChange={onChange} />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="identification">
        <AccordionTrigger>Vehicle Identification</AccordionTrigger>
        <AccordionContent className="space-y-4">
          <FormField id="regNumber" label="Reg No." value={data.regNumber} onChange={onChange} />
          <FormField id="manufacturer" label="Manufacturer" value={data.manufacturer} onChange={onChange} />
          <FormField id="model" label="Model" value={data.model} onChange={onChange} />
          <FormField id="fuelType" label="Fuel Type" value={data.fuelType} onChange={onChange} />
          <FormField id="manufactureYear" label="Manuf. Year" value={data.manufactureYear} onChange={onChange} />
          <FormField id="origin" label="Origin" value={data.origin} onChange={onChange} />
          <FormField id="engineNumber" label="Engine No." value={data.engineNumber} onChange={onChange} />
          <FormField id="chassisNumber" label="Chassis No." value={data.chassisNumber} onChange={onChange} />
          <FormField id="vehicleClass" label="Class" value={data.vehicleClass} onChange={onChange} />
          <FormField id="firstRegDate" label="First Reg. Date" value={data.firstRegDate} onChange={onChange} />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="body">
        <AccordionTrigger>Body & Features</AccordionTrigger>
        <AccordionContent className="space-y-4">
            <FormField id="bodyShape" label="Body Shape" value={data.bodyShape} onChange={onChange} />
            <FormField id="numberOfDoors" label="Doors" value={data.numberOfDoors} onChange={onChange} />
            <FormField id="roofType" label="Roof" value={data.roofType} onChange={onChange} />
            <FormField id="seatingCapacity" label="Seats" value={data.seatingCapacity} onChange={onChange} />
            <FormField id="color" label="Color" value={data.color} onChange={onChange} />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="engine">
        <AccordionTrigger>Engine Specifications</AccordionTrigger>
        <AccordionContent className="space-y-4">
            <FormField id="displacement" label="Displacement (CC)" value={data.displacement} onChange={onChange} />
            <FormField id="fuelSystem" label="Fuel System" value={data.fuelSystem} onChange={onChange} />
            <FormField id="engineType" label="Engine Type" value={data.engineType} onChange={onChange} />
            <FormField id="engineCondition" label="Engine Condition" value={data.engineCondition} onChange={onChange} />
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="other">
        <AccordionTrigger>Odometer, Tyres & Electrical</AccordionTrigger>
        <AccordionContent className="space-y-4">
            <FormField id="odometer" label="Odometer (KM)" value={data.odometer} onChange={onChange} />
            <FormField id="tyreSizeFront" label="Front Tyres" value={data.tyreSizeFront} onChange={onChange} />
            <FormField id="tyreWasteFront" label="Front Tyre Waste" value={data.tyreWasteFront} onChange={onChange} />
            <FormField id="tyreSizeRear" label="Rear Tyres" value={data.tyreSizeRear} onChange={onChange} />
            <FormField id="tyreWasteRear" label="Rear Tyre Waste" value={data.tyreWasteRear} onChange={onChange} />
            <FormField id="battery" label="Battery" value={data.battery} onChange={onChange} />
            <FormField id="starter" label="Starter" value={data.starter} onChange={onChange} />
            <FormField id="alternator" label="Alternator" value={data.alternator} onChange={onChange} />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="valuation">
        <AccordionTrigger>Valuation</AccordionTrigger>
        <AccordionContent className="space-y-4">
            <FormField id="marketValueNum" label="Market Value (Rs.)" value={data.marketValueNum} onChange={onChange} />
            <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="marketValueText" className="text-sm font-medium text-right">In Words</Label>
                <Textarea id="marketValueText" name="marketValueText" value={data.marketValueText} onChange={onChange} className="col-span-2" />
            </div>
            <FormField id="forcedSaleValue" label="Forced Sale (Rs.)" value={data.forcedSaleValue} onChange={onChange} />
            <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="extras" className="text-sm font-medium text-right">Extras</Label>
                <Textarea id="extras" name="extras" value={data.extras} onChange={onChange} className="col-span-2" />
            </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
