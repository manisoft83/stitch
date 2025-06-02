
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
  referenceImages?: string[]; // Array of Data URLs for images
}

interface OrderWorkflowState {
  currentCustomer: Customer | null;
  currentMeasurements: MeasurementFormValues | null;
  currentDesign: DesignDetails | null;
  workflowReturnPath: string | null; // Path to return to after a sub-workflow
}

interface OrderWorkflowContextType extends OrderWorkflowState {
  setCustomer: (customer: Customer | null) => void;
  setMeasurements: (measurements: MeasurementFormValues | null) => void;
  setDesign: (design: DesignDetails | null) => void;
  setWorkflowReturnPath: (path: string | null) => void;
  resetWorkflow: () => void;
}

const OrderWorkflowContext = createContext<OrderWorkflowContextType | undefined>(undefined);

const initialState: OrderWorkflowState = {
  currentCustomer: null,
  currentMeasurements: null,
  currentDesign: null,
  workflowReturnPath: null,
};

export function OrderWorkflowProvider({ children }: { children: ReactNode }) {
  const [workflowState, setWorkflowState] = useState<OrderWorkflowState>(initialState);

  const setCustomer = useCallback((customer: Customer | null) => {
    setWorkflowState(prevState => ({
      ...prevState,
      currentCustomer: customer,
      currentMeasurements: customer?.measurements || null,
      currentDesign: prevState.currentCustomer?.id === customer?.id ? prevState.currentDesign : null,
    }));
  }, []);

  const setMeasurements = useCallback((measurements: MeasurementFormValues | null) => {
    setWorkflowState(prevState => ({ ...prevState, currentMeasurements: measurements }));
  }, []);

  const setDesign = useCallback((design: DesignDetails | null) => {
    setWorkflowState(prevState => ({ ...prevState, currentDesign: design }));
  }, []);

  const setWorkflowReturnPath = useCallback((path: string | null) => {
    setWorkflowState(prevState => ({ ...prevState, workflowReturnPath: path }));
  }, []);

  const resetWorkflow = useCallback(() => {
    setWorkflowState(initialState);
  }, []);

  const contextValue: OrderWorkflowContextType = {
    ...workflowState,
    setCustomer,
    setMeasurements,
    setDesign,
    setWorkflowReturnPath,
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

