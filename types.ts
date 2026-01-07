// Added React import to provide access to the React namespace for React.ReactNode
import React from 'react';

export interface CalculationResult {
  value: number | string;
  formula: string;
  steps: string;
  extra?: React.ReactNode;
}

export enum CalculatorType {
  POLE_ANGLE = 'POLE_ANGLE',
  CURRENT_LIMIT = 'CURRENT_LIMIT',
  RPM_CALC = 'RPM_CALC',
  DIVIDER_CALC = 'DIVIDER_CALC',
}