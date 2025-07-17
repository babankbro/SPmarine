// src/components/core/datetime/HybridDateTimePicker.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { format, parse, isValid } from 'date-fns';

interface HybridDateTimePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  required?: boolean;
  format24h?: boolean;
}

export function HybridDateTimePicker({
  label,
  value,
  onChange,
  error = false,
  helperText,
  fullWidth = true,
  disabled = false,
  required = false,
  format24h = true,
}: HybridDateTimePickerProps) {
  const [textError, setTextError] = useState(false);
  
  const displayFormat = format24h ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy hh:mm a';
  
  const parseFormats = [
    'dd/MM/yyyy HH:mm',
    'dd/MM/yyyy H:mm',
    'dd-MM-yyyy HH:mm',
    'yyyy-MM-dd HH:mm',
    'MM/dd/yyyy HH:mm',
  ];

  const parseTextToDate = (text: string): Date | null => {
    if (!text.trim()) return null;

    for (const formatPattern of parseFormats) {
      try {
        const parsedDate = parse(text.trim(), formatPattern, new Date());
        if (isValid(parsedDate)) {
          return parsedDate;
        }
      } catch (error) {
        continue;
      }
    }
    return null;
  };

  return (
    <DateTimePicker
      label={label}
      value={value}
      onChange={onChange}
      disabled={disabled}
      format={displayFormat}
      ampm={!format24h}
      slotProps={{
        textField: {
          fullWidth,
          error: error || textError,
          helperText: textError ? "Invalid date format" : helperText,
          required,
          onBlur: (event) => {
            const text = event.target.value;
            if (text && !value) {
              const parsed = parseTextToDate(text);
              if (parsed) {
                onChange(parsed);
                setTextError(false);
              } else {
                setTextError(true);
              }
            } else {
              setTextError(false);
            }
          },
        },
        actionBar: {
          actions: ['accept', 'cancel', 'clear'],
        },
        popper: {
          placement: 'bottom-start',
        },
      }}
    />
  );
}

export default HybridDateTimePicker;