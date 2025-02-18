import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimeRangeSelectorProps {
  day: string;
  isOpen: boolean;
  start: string;
  end: string;
  onChange: (day: string, isOpen: boolean, start: string, end: string) => void;
}

export function TimeRangeSelector({ day, isOpen: initialIsOpen, start: initialStart, end: initialEnd, onChange }: TimeRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [startTime, setStartTime] = useState(initialStart);
  const [endTime, setEndTime] = useState(initialEnd);

  const handleToggleChange = (checked: boolean) => {
    setIsOpen(checked)
    onChange(day, checked, startTime, endTime)
  }

  const handleStartTimeChange = (value: string) => {
    setStartTime(value)
    onChange(day, isOpen, value, endTime)
  }

  const handleEndTimeChange = (value: string) => {
    setEndTime(value)
    onChange(day, isOpen, startTime, value)
  }

  return (
    <div className="grid sm:grid-cols-2 grid-cols-1">
      <div className="flex items-center space-x-2">
        <Label className="w-24">{day}</Label>
        <Switch checked={isOpen} onCheckedChange={handleToggleChange} />
      </div>
      {isOpen && (
        <>
          <div className="flex items-center space-x-2">
            <Select value={startTime} onValueChange={handleStartTimeChange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Start time" />
              </SelectTrigger>
              <SelectContent>{generateTimeOptions()}</SelectContent>
            </Select>
            <span>to</span>
            <Select value={endTime} onValueChange={handleEndTimeChange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="End time" />
              </SelectTrigger>
              <SelectContent>{generateTimeOptions()}</SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  )
}

function generateTimeOptions() {
  const options = []
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 30) {
      const hour = i.toString().padStart(2, "0")
      const minute = j.toString().padStart(2, "0")
      options.push(
        <SelectItem key={`${hour}:${minute}`} value={`${hour}:${minute}`}>
          {`${hour}:${minute}`}
        </SelectItem>,
      )
    }
  }
  return options
}