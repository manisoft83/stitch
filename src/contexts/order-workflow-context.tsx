
"use client";

import type { ReactNode } from 'react';
import { createContext, useState, useContext, useCallback } from 'react';
import type { Customer } from '@/lib/mockData';
import type { MeasurementFormValues } from '@/lib/schemas';

interface OrderWorkflowState {
  currentCustomer: Customer | null;
  currentMeasurements: (MeasurementFormValues & {profileName?: string}) | null; // Allow profileName
}

interface OrderWorkflowContextType extends OrderWorkflowState {
  setCustomer: (customer: Customer | null) => void;
  setMeasurements: (measurements: (MeasurementFormValues & {profileName?: string}) | null) => void;
  resetWorkflow: () => void;
}

const OrderWorkflowContext = createContext<OrderWorkflowContextType | undefined>(undefined);

const initialState: OrderWorkflowState = {
  currentCustomer: null,
  currentMeasurements: null,
};

export function OrderWorkflowProvider({ children }: { children: ReactNode }) {
  const [workflowState, setWorkflowState] = useState<OrderWorkflowState>(initialState);

  const setCustomer = useCallback((customer: Customer | null) => {
    setWorkflowState(prevState => ({ ...prevState, currentCustomer: customer, currentMeasurements: customer?.measurements || null }));
  }, []);

  const setMeasurements = useCallback((measurements: (MeasurementFormValues & {profileName?: string}) | null) => {
    setWorkflowState(prevState => ({ ...prevState, currentMeasurements: measurements }));
  }, []);

  const resetWorkflow = useCallback(() => {
    setWorkflowState(initialState);
  }, []);

  const contextValue: OrderWorkflowContextType = {
    ...workflowState,
    setCustomer,
    setMeasurements,
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
