
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
  editingOrderId: string | null; // ID of the order being edited
}

interface OrderWorkflowContextType extends OrderWorkflowState {
  setCustomer: (customer: Customer | null) => void;
  setMeasurements: (measurements: MeasurementFormValues | null) => void;
  setDesign: (design: DesignDetails | null) => void;
  setWorkflowReturnPath: (path: string | null) => void;
  setEditingOrderId: (orderId: string | null) => void;
  resetWorkflow: () => void;
}

const OrderWorkflowContext = createContext<OrderWorkflowContextType | undefined>(undefined);

const initialState: OrderWorkflowState = {
  currentCustomer: null,
  currentMeasurements: null,
  currentDesign: { // Initialize currentDesign to avoid issues with undefined
    fabric: null,
    color: null,
    style: null,
    notes: '',
    referenceImages: [],
  },
  workflowReturnPath: null,
  editingOrderId: null,
};

export function OrderWorkflowProvider({ children }: { children: ReactNode }) {
  const [workflowState, setWorkflowState] = useState<OrderWorkflowState>(initialState);

  const setCustomer = useCallback((customer: Customer | null) => {
    setWorkflowState(prevState => ({
      ...prevState,
      currentCustomer: customer,
      // If customer changes, reset measurements and design unless it's the same customer
      currentMeasurements: customer?.id === prevState.currentCustomer?.id ? prevState.currentMeasurements : (customer?.measurements || null),
      currentDesign: customer?.id === prevState.currentCustomer?.id ? prevState.currentDesign : initialState.currentDesign,
    }));
  }, []);

  const setMeasurements = useCallback((measurements: MeasurementFormValues | null) => {
    setWorkflowState(prevState => ({ ...prevState, currentMeasurements: measurements }));
  }, []);

  const setDesign = useCallback((design: DesignDetails | null) => {
    setWorkflowState(prevState => ({ ...prevState, currentDesign: design || initialState.currentDesign }));
  }, []);

  const setWorkflowReturnPath = useCallback((path: string | null) => {
    setWorkflowState(prevState => ({ ...prevState, workflowReturnPath: path }));
  }, []);

  const setEditingOrderId = useCallback((orderId: string | null) => {
    setWorkflowState(prevState => ({ ...prevState, editingOrderId: orderId }));
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
    setEditingOrderId,
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
