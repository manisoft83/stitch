
"use client";

import type { ReactNode } from 'react';
import { createContext, useState, useContext, useCallback } from 'react';
import type { Customer, OrderStatus } from '@/lib/mockData';
import type { MeasurementFormValues } from '@/lib/schemas';

// Define the structure for design details
export interface DesignDetails {
  fabric: string | null;
  color: string | null;
  style: string | null;
  notes: string;
  referenceImages?: string[]; // Array of Data URLs for images
  status?: OrderStatus; // Used if editing an existing order to preserve its status
  assignedTailorId?: string | null;
  assignedTailorName?: string | null;
  dueDate?: string | null; // Stored as "yyyy-MM-dd" string
}

interface OrderWorkflowState {
  currentCustomer: Customer | null;
  currentMeasurements: MeasurementFormValues | null;
  currentDesign: DesignDetails | null;
  workflowReturnPath: string | null; 
  editingOrderId: string | null; 
}

interface OrderWorkflowContextType extends OrderWorkflowState {
  setCustomer: (customer: Customer | null) => void;
  setMeasurements: (measurements: MeasurementFormValues | null) => void;
  setDesign: (design: DesignDetails | null) => void;
  setWorkflowReturnPath: (path: string | null) => void;
  setEditingOrderId: (orderId: string | null) => void;
  resetWorkflow: () => void;
  loadOrderForEditing: (order: import('@/lib/mockData').Order, customer: Customer) => void;
}

const OrderWorkflowContext = createContext<OrderWorkflowContextType | undefined>(undefined);

const initialDesignState: DesignDetails = {
  fabric: null,
  color: null,
  style: null,
  notes: '',
  referenceImages: [],
  status: "Pending Assignment",
  assignedTailorId: null,
  assignedTailorName: null,
  dueDate: null,
};

const initialState: OrderWorkflowState = {
  currentCustomer: null,
  currentMeasurements: null,
  currentDesign: { ...initialDesignState }, // Ensure initialDesignState is fully populated
  workflowReturnPath: null,
  editingOrderId: null,
};

export function OrderWorkflowProvider({ children }: { children: ReactNode }) {
  const [workflowState, setWorkflowState] = useState<OrderWorkflowState>({...initialState});

  const setCustomer = useCallback((customer: Customer | null) => {
    setWorkflowState(prevState => ({
      ...prevState,
      currentCustomer: customer,
      currentMeasurements: customer?.id === prevState.currentCustomer?.id 
                            ? prevState.currentMeasurements 
                            : (customer?.measurements || null),
      currentDesign: prevState.editingOrderId && customer?.id === prevState.currentCustomer?.id
                            ? prevState.currentDesign // Keep existing design if same customer while editing
                            : { ...initialDesignState }, // Reset design for new customer or if not editing
    }));
  }, []);

  const setMeasurements = useCallback((measurements: MeasurementFormValues | null) => {
    setWorkflowState(prevState => ({ ...prevState, currentMeasurements: measurements }));
  }, []);

  const setDesign = useCallback((design: DesignDetails | null) => {
    setWorkflowState(prevState => ({ ...prevState, currentDesign: design ? { ...prevState.currentDesign, ...design } : { ...initialDesignState } }));
  }, []);

  const setWorkflowReturnPath = useCallback((path: string | null) => {
    setWorkflowState(prevState => ({ ...prevState, workflowReturnPath: path }));
  }, []);

  const setEditingOrderId = useCallback((orderId: string | null) => {
    setWorkflowState(prevState => ({ 
      ...prevState, 
      editingOrderId: orderId,
      ...(orderId === null ? {...initialState} : {}) 
    }));
  }, []);

  const resetWorkflow = useCallback(() => {
    setWorkflowState({...initialState});
  }, []);

  const loadOrderForEditing = useCallback((order: import('@/lib/mockData').Order, customer: Customer) => {
    setWorkflowState({
      currentCustomer: customer,
      currentMeasurements: customer.measurements || null,
      currentDesign: { // Populate all relevant fields from the order
        fabric: order.designDetails?.fabric || null,
        color: order.designDetails?.color || null,
        style: order.designDetails?.style || null,
        notes: order.designDetails?.notes || '',
        referenceImages: order.designDetails?.referenceImageUrls || [],
        status: order.status,
        assignedTailorId: order.assignedTailorId || null,
        assignedTailorName: order.assignedTailorName || null,
        dueDate: order.dueDate || null, // Ensure dueDate is a "yyyy-MM-dd" string or null
      },
      editingOrderId: order.id,
      workflowReturnPath: `/orders/${order.id}`, 
    });
  }, []);


  const contextValue: OrderWorkflowContextType = {
    ...workflowState,
    setCustomer,
    setMeasurements,
    setDesign,
    setWorkflowReturnPath,
    setEditingOrderId,
    resetWorkflow,
    loadOrderForEditing,
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
