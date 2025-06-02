
"use client";

import type { ReactNode } from 'react';
import { createContext, useState, useContext, useCallback } from 'react';
import type { Customer } from '@/lib/mockData';
import type { MeasurementFormValues } from '@/lib/schemas';

// Define the structure for design details
export interface DesignDetails {
  fabric: string | null;
  color: string | null;
  style: string | null;
  notes: string;
}

interface OrderWorkflowState {
  currentCustomer: Customer | null;
  currentMeasurements: MeasurementFormValues | null;
  currentDesign: DesignDetails | null; // Added currentDesign
}

interface OrderWorkflowContextType extends OrderWorkflowState {
  setCustomer: (customer: Customer | null) => void;
  setMeasurements: (measurements: MeasurementFormValues | null) => void;
  setDesign: (design: DesignDetails | null) => void; // Added setDesign
  resetWorkflow: () => void;
}

const OrderWorkflowContext = createContext<OrderWorkflowContextType | undefined>(undefined);

const initialState: OrderWorkflowState = {
  currentCustomer: null,
  currentMeasurements: null,
  currentDesign: null, // Initialize currentDesign
};

export function OrderWorkflowProvider({ children }: { children: ReactNode }) {
  const [workflowState, setWorkflowState] = useState<OrderWorkflowState>(initialState);

  const setCustomer = useCallback((customer: Customer | null) => {
    setWorkflowState(prevState => ({
      ...prevState,
      currentCustomer: customer,
      currentMeasurements: customer?.measurements || null,
      currentDesign: null, // Reset design when customer changes
    }));
  }, []);

  const setMeasurements = useCallback((measurements: MeasurementFormValues | null) => {
    setWorkflowState(prevState => ({ ...prevState, currentMeasurements: measurements }));
  }, []);

  const setDesign = useCallback((design: DesignDetails | null) => { // Implemented setDesign
    setWorkflowState(prevState => ({ ...prevState, currentDesign: design }));
  }, []);

  const resetWorkflow = useCallback(() => {
    setWorkflowState(initialState);
  }, []);

  const contextValue: OrderWorkflowContextType = {
    ...workflowState,
    setCustomer,
    setMeasurements,
    setDesign, // Added setDesign to context value
    resetWorkflow,
  };

  return (
    <OrderWorkflowContext.Provider value={contextValue}>
      {children}
    </OrderWorkflowContext.Provider>
  );
}

export function useOrderWorkflow() {
  const context = useContext(OrderWorkflowContext);
  if (context === undefined) {
    throw new Error('useOrderWorkflow must be used within an OrderWorkflowProvider');
  }
  return context;
}
