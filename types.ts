export interface CalculationResult {
  value: string | number;
  unit?: string;
  formula?: string;
  steps?: string[];
  isError?: boolean;
}

export interface CalculatorProps {
  isOpen: boolean;
  onToggle: () => void;
  highlight?: boolean; // For search highlighting
}

export type CalculatorCategory = 'ALL' | 'MOTOR' | 'INVERTER' | 'SPEED';

export const PI = 3.14;