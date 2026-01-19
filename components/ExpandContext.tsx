import { createContext, useContext } from 'react';

export interface ExpandContextType {
  trigger: number;
  shouldExpand: boolean;
}

export const ExpandContext = createContext<ExpandContextType>({
  trigger: 0,
  shouldExpand: true,
});

export const useExpandContext = () => useContext(ExpandContext);
