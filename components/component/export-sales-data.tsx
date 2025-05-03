// EXPORT SALES DATA TO PDF
// This component allows the user to export sales data to a PDF file.

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

const exportSalesToPDF = (salesData: Sales[], charity: CharityData, startDate: Date | null, endDate: Date | null) => {
  let filteredData = salesData;
  
  if (startDate || endDate) {
    filteredData = salesData.filter(sale => {
      const saleStartDate = sale.date_from ? new Date(sale.date_from) : null;
      
      if (!saleStartDate) return false;
      
      const afterStartDate = startDate ? 
        (isAfter(saleStartDate, startDate) || saleStartDate.getTime() === startDate.getTime()) : true;
      
      const beforeEndDate = endDate ? 
        (isBefore(saleStartDate, endDate) || saleStartDate.getTime() === endDate.getTime()) : true;
      
      return afterStartDate && beforeEndDate;
    });
  }
  
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text("Sales History Report", 14, 22);
  
  doc.setFontSize(12);
  doc.text(`Charity: ${charity.name}`, 14, 30);
  doc.setFontSize(10);
  doc.setTextColor(100);
  
  if (startDate && endDate) {
    doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm')} | Date range: ${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`, 14, 36);
  } else if (startDate) {
    doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm')} | From: ${format(startDate, 'dd/MM/yyyy')}`, 14, 36);
  } else if (endDate) {
    doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm')} | Until: ${format(endDate, 'dd/MM/yyyy')}`, 14, 36);
  } else {
    doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 36);
  }
  
  const categoryTotals: Record<string, number> = {};
  let grandTotal = 0;
  
  filteredData.forEach(sale => {
    sale.sales_data?.forEach(item => {
      if (!categoryTotals[item.category]) {
        categoryTotals[item.category] = 0;
      }
      categoryTotals[item.category] += item.amount;
      grandTotal += item.amount;
    });
  });
  
  const categoryRows = Object.entries(categoryTotals).map(([category, amount]) => [
    category, 
    `£${amount.toFixed(2)}`,
    `${((amount / grandTotal) * 100).toFixed(1)}%`
  ]);
  
  autoTable(doc, {
    head: [['Category', 'Total Amount', 'Percentage']],
    body: categoryRows,
    startY: 45,
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [46, 139, 87], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 240, 240] }
  });
  
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  const salesRows = filteredData.map(sale => {
    const saleTotal = sale.sales_data?.reduce((sum, item) => sum + item.amount, 0) || 0;
    return [
      format(new Date(sale.date_from), 'dd/MM/yyyy'),
      format(new Date(sale.date_to), 'dd/MM/yyyy'),
      `£${saleTotal.toFixed(2)}`,
      sale.sales_data?.length || 0
    ];
  });
  
  autoTable(doc, {
    head: [['Date From', 'Date To', 'Total Amount', 'Number of Items']],
    body: salesRows,
    startY: finalY,
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [46, 139, 87], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 240, 240] }
  });
  
  const finalY2 = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Grand Total: £${grandTotal.toFixed(2)}`, 14, finalY2);
  
  let filename = `sales-history-${charity.name.replace(/\s+/g, '-').toLowerCase()}`;
  if (startDate) filename += `-from-${format(startDate, 'yyyy-MM-dd')}`;
  if (endDate) filename += `-to-${format(endDate, 'yyyy-MM-dd')}`;
  doc.save(`${filename}.pdf`);
};

export function ExportSales({ salesData, charity }: {salesData: Sales[]; charity: CharityData}) {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  
  const handleStartDateSelect = (date: Date | undefined) => setStartDate(date || new Date());
  const handleEndDateSelect = (date: Date | undefined) => setEndDate(date || new Date());
  
  const handleExport = () => {
    exportSalesToPDF(salesData, charity, startDate, endDate);
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