// src/hooks/use-flexible-datetime.ts
"use client";

import { useState } from 'react';

export interface UseFlexibleDateTimeOptions {
  initialMode?: 'text' | 'picker';
  format24h?: boolean;
  allowModeSwitch?: boolean;
}

export function useFlexibleDateTime(options: UseFlexibleDateTimeOptions = {}) {
  const {
    initialMode = 'text',
    format24h = true,
    allowModeSwitch = true,
  } = options;

  const [inputMode, setInputMode] = useState<'text' | 'picker'>(initialMode);

  const toggleMode = () => {
    if (allowModeSwitch) {
      setInputMode(prev => prev === 'text' ? 'picker' : 'text');
    }
  };

  const setMode = (mode: 'text' | 'picker') => {
    if (allowModeSwitch) {
      setInputMode(mode);
    }
  };

  return {
    inputMode,
    toggleMode,
    setMode,
    format24h,
    allowModeSwitch,
  };
}