"use client";

import { useState } from "react";
import { format, subDays } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";
import { t } from "@/lib/i18n";

interface DateRangePickerProps {
  value: { from: Date; to: Date };
  onChange: (range: { from: Date; to: Date }) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const { language } = useLanguage();

  const presets = [
    { labelKey: "last7Days" as const, days: 7 },
    { labelKey: "last30Days" as const, days: 30 },
    { labelKey: "last90Days" as const, days: 90 },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value.from && value.to ? (
            <>
              {format(value.from, "MMM dd, yyyy")} -{" "}
              {format(value.to, "MMM dd, yyyy")}
            </>
          ) : (
            <span>{t(language, "pickDateRange")}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex gap-2 border-b p-3">
          {presets.map((preset) => (
            <Button
              key={preset.labelKey}
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                onChange({
                  from: subDays(today, preset.days),
                  to: today,
                });
                setOpen(false);
              }}
            >
              {t(language, preset.labelKey)}
            </Button>
          ))}
        </div>
        <Calendar
          mode="range"
          selected={{ from: value.from, to: value.to }}
          onSelect={(range) => {
            if (range?.from && range?.to) {
              onChange({ from: range.from, to: range.to });
              setOpen(false);
            } else if (range?.from) {
              onChange({ from: range.from, to: range.from });
            }
          }}
          numberOfMonths={2}
          defaultMonth={value.from}
          disabled={{ after: new Date() }}
        />
      </PopoverContent>
    </Popover>
  );
}
