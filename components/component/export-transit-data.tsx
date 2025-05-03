// EXPORT TRANSIT DATA TO PDF
// This component allows the user to export transit data to a PDF file.

"use client"

import { useState } from 'react';
import { format, isAfter, isBefore } from 'date-fns';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const exportTransitToPDF = (transitData: TransitData[], resourceData: ResourcesData[], charityData: CharityData[], title: string, startDate: Date, endDate: Date) => {
  let filteredData = transitData;
  
  if (startDate || endDate) {
    filteredData = transitData.filter(transit => {
      const transitDate = transit.updated_at ? new Date(transit.updated_at) : null;
      
      if (!transitDate) return false;
      
      const afterStartDate = startDate ? isAfter(transitDate, startDate) || transitDate.getTime() === startDate.getTime() : true;
      const beforeEndDate = endDate ? isBefore(transitDate, endDate) || transitDate.getTime() === endDate.getTime() : true;
      
      return afterStartDate && beforeEndDate;
    });
  }
  
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(10);
  doc.setTextColor(100);
  
  if (startDate && endDate) {
    doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm')} | Date range: ${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`, 14, 30);
  } else if (startDate) {
    doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm')} | From: ${format(startDate, 'dd/MM/yyyy')}`, 14, 30);
  } else if (endDate) {
    doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm')} | Until: ${format(endDate, 'dd/MM/yyyy')}`, 14, 30);
  } else {
    doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);
  }
  
  const tableRows = filteredData.map(transit => {
    const resource = resourceData.find(r => r.id === transit.resource_id) || { name: 'Unknown', unit: '' };
    const charityId = title.includes("Sent To") ? transit.charity_to : transit.charity_from;
    const charity = charityData.find(c => c.id === charityId) || { name: 'Unknown' };
    
    return [
      resource.name,
      `${transit.quantity} ${resource.unit}`,
      charity.name,
      transit.status,
      transit.time_sent ? format(new Date(transit.time_sent), 'dd/MM/yyyy HH:mm') : 'N/A',
      transit.time_received ? format(new Date(transit.time_received), 'dd/MM/yyyy HH:mm') : 'N/A'
    ];
  });
  
  autoTable(doc, {
    head: [['Resource', 'Quantity', 'Charity', 'Status', 'Time Sent', 'Time Received']],
    body: tableRows,
    startY: 35,
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 240, 240] }
  });
  
  let filename = `${title.replace(/\s+/g, '-').toLowerCase()}`;
  if (startDate) filename += `-from-${format(startDate, 'yyyy-MM-dd')}`;
  if (endDate) filename += `-to-${format(endDate, 'yyyy-MM-dd')}`;
  
  doc.save(`${filename}.pdf`);
};

export function ExportTransit({ transitData, resourceData, charityData, title }: {transitData: TransitData[]; resourceData: ResourcesData[]; charityData: CharityData[]; title: string}) {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  
  const handleStartDateSelect = (date: Date | undefined) => setStartDate(date || new Date());
  const handleEndDateSelect = (date: Date | undefined) => setEndDate(date || new Date());
  
  const handleExport = () => {
    exportTransitToPDF(transitData, resourceData, charityData, title, startDate, endDate);
    setOpen(false);
  };
  
  const clearDates = () => {
    setStartDate(new Date());
    setEndDate(new Date());
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Export Date Range</h4>
            <p className="text-sm text-gray-500">Select a date range to filter the export</p>
          </div>
          
          <div className="grid gap-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <div className="mt-1">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={handleStartDateSelect}
                    className="rounded-md border"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="end-date">End Date</Label>
                <div className="mt-1">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={handleEndDateSelect}
                    className="rounded-md border"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" size="sm" onClick={clearDates}>
              Clear Dates
            </Button>
            <Button size="sm" onClick={handleExport}>
              Export PDF
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};