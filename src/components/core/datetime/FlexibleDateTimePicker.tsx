"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  IconButton,
  InputAdornment,
  Box,
  Tooltip,
  FormHelperText,
  Popover,
  Paper,
  Stack,
  Button,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  Clear as ClearIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { StaticDateTimePicker } from '@mui/x-date-pickers/StaticDateTimePicker';
import { format, parse, isValid } from 'date-fns';

interface FlexibleDateTimePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  format24h?: boolean;
  size?: 'small' | 'medium';
  variant?: 'outlined' | 'filled' | 'standard';
}

export function FlexibleDateTimePicker({
  label,
  value,
  onChange,
  error = false,
  helperText,
  fullWidth = true,
  disabled = false,
  required = false,
  placeholder = "DD/MM/YYYY HH:MM",
  format24h = true,
  size = 'medium',
  variant = 'outlined',
}: FlexibleDateTimePickerProps) {
  const [textValue, setTextValue] = useState('');
  const [textError, setTextError] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerValue, setPickerValue] = useState<Date | null>(value);
  const textFieldRef = useRef<HTMLDivElement>(null);

  // Date format patterns for parsing
  const displayFormat = format24h ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy hh:mm a';
  const parseFormats = [
    'dd/MM/yyyy HH:mm',
    'dd/MM/yyyy H:mm',
    'dd-MM-yyyy HH:mm',
    'dd-MM-yyyy H:mm',
    'yyyy-MM-dd HH:mm',
    'yyyy-MM-dd H:mm',
    'MM/dd/yyyy HH:mm',
    'MM/dd/yyyy H:mm',
    'dd/MM/yyyy HH:mm:ss',
    'dd/MM/yyyy H:mm:ss',
    'dd/MM/yyyy',
    'dd-MM-yyyy',
    'yyyy-MM-dd',
    'MM/dd/yyyy',
  ];

  // Update text value when prop value changes
  useEffect(() => {
    if (value && isValid(value)) {
      setTextValue(format(value, displayFormat));
      setPickerValue(value);
      setTextError(false);
    } else if (!value) {
      setTextValue('');
      setPickerValue(null);
      setTextError(false);
    }
  }, [value, displayFormat]);

  // Parse text input to date
  const parseTextToDate = (text: string): Date | null => {
    if (!text.trim()) return null;

    // Try exact format first
    for (const formatPattern of parseFormats) {
      try {
        const parsedDate = parse(text.trim(), formatPattern, new Date());
        if (isValid(parsedDate)) {
          return parsedDate;
        }
      } catch (error) {
        // Continue to next format
      }
    }

    // Try native Date parsing as fallback
    try {
      const nativeDate = new Date(text.trim());
      if (isValid(nativeDate) && nativeDate.getFullYear() > 1900) {
        return nativeDate;
      }
    } catch (error) {
      // Ignore
    }

    return null;
  };

  // Handle text input change
  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newText = event.target.value;
    setTextValue(newText);

    if (!newText.trim()) {
      setTextError(false);
      setPickerValue(null);
      onChange(null);
      return;
    }

    const parsedDate = parseTextToDate(newText);
    if (parsedDate) {
      setTextError(false);
      setPickerValue(parsedDate);
      onChange(parsedDate);
    } else {
      setTextError(true);
    }
  };

  // Handle text input blur (final validation)
  const handleTextBlur = () => {
    if (!textValue.trim()) {
      setTextError(false);
      return;
    }

    const parsedDate = parseTextToDate(textValue);
    if (parsedDate) {
      setTextError(false);
      // Update text to standard format
      const formattedText = format(parsedDate, displayFormat);
      setTextValue(formattedText);
      setPickerValue(parsedDate);
      onChange(parsedDate);
    } else {
      setTextError(true);
    }
  };

  // Handle picker change
  const handlePickerChange = (date: Date | null) => {
    setPickerValue(date);
    if (date && isValid(date)) {
      const formattedText = format(date, displayFormat);
      setTextValue(formattedText);
      setTextError(false);
      onChange(date);
    } else {
      setTextValue('');
      onChange(null);
    }
  };

  // Handle picker accept
  const handlePickerAccept = () => {
    if (pickerValue && isValid(pickerValue)) {
      handlePickerChange(pickerValue);
    }
    setPickerOpen(false);
  };

  // Handle picker cancel
  const handlePickerCancel = () => {
    setPickerValue(value); // Reset to original value
    setPickerOpen(false);
  };

  // Handle clear
  const handleClear = () => {
    setTextValue('');
    setPickerValue(null);
    setTextError(false);
    onChange(null);
    setPickerOpen(false);
  };

  // Open picker
  const openPicker = () => {
    if (!disabled) {
      setPickerOpen(true);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'F4' || (event.ctrlKey && event.key === ' ')) {
      event.preventDefault();
      openPicker();
    }
    if (event.key === 'Escape' && pickerOpen) {
      event.preventDefault();
      handlePickerCancel();
    }
  };

  return (
    <Box>
      <TextField
        ref={textFieldRef}
        label={label}
        value={textValue}
        onChange={handleTextChange}
        onBlur={handleTextBlur}
        onKeyDown={handleKeyDown}
        error={error || textError}
        fullWidth={fullWidth}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        size={size}
        variant={variant}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Stack direction="row" spacing={0.5}>
                {textValue && (
                  <Tooltip title="Clear">
                    <IconButton
                      onClick={handleClear}
                      edge="end"
                      disabled={disabled}
                      size="small"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Open date picker (F4 or Ctrl+Space)">
                  <IconButton
                    onClick={openPicker}
                    edge="end"
                    disabled={disabled}
                    size="small"
                  >
                    <CalendarIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </InputAdornment>
          ),
        }}
      />
      
      {/* Custom Popover with StaticDateTimePicker */}
      <Popover
        open={pickerOpen}
        anchorEl={textFieldRef.current}
        onClose={handlePickerCancel}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          elevation: 8,
          sx: {
            mt: 1,
            '& .MuiDateCalendar-root': {
              maxHeight: 'none',
            },
          },
        }}
      >
        <Paper sx={{ p: 1 }}>
          <StaticDateTimePicker
            value={pickerValue}
            onChange={setPickerValue}
            displayStaticWrapperAs="desktop"
            ampm={!format24h}
            slotProps={{
              toolbar: {
                hidden: false,
              },
              actionBar: {
                actions: [],
              },
            }}
          />
          
          {/* Custom Action Bar */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            gap: 1, 
            mt: 1,
            borderTop: 1,
            borderColor: 'divider',
            pt: 1,
          }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleClear}
              startIcon={<ClearIcon />}
            >
              Clear
            </Button>
            
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={handlePickerCancel}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handlePickerAccept}
                startIcon={<CheckIcon />}
              >
                Accept
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Popover>

      {/* Helper Text */}
      {(helperText || textError) && (
        <FormHelperText error={error || textError}>
          {textError 
            ? `Invalid date format. Try: ${placeholder} or use the picker` 
            : helperText
          }
        </FormHelperText>
      )}
    </Box>
  );
}

export default FlexibleDateTimePicker;