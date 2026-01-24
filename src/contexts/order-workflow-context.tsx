
"use client";

import type { ReactNode } from 'react';
import { createContext, useState, useContext, useCallback } from 'react';
import type { Customer, OrderStatus, Order as FullOrderType } from '@/lib/mockData'; // Renamed Order to FullOrderType
import type { MeasurementFormValues } from '@/lib/schemas';

// Define the structure for blouse-specific details
export interface BlouseDetails {
  fl?: number;
  yoke?: string;
  sh?: number;
  cut?: string;
  sl?: number;
  neckType?: string;
  fn?: number;
  bn?: number;
  slit?: string;
  extra?: string;
  dt?: string;
}

// Define the structure for pant-specific details
export interface PantDetails {
  type?: string;
}

// Define the structure for skirt-specific details
export interface SkirtDetails {
  type?: string;
}

// Define the structure for design details of a single item
export interface DesignDetails {
  style: string | null;
  notes: string;
  referenceImages?: string[]; 
  blouseDetails?: Partial<BlouseDetails>;
  pantDetails?: Partial<PantDetails>;
  skirtDetails?: Partial<SkirtDetails>;
  // Fields below are more for overall order context during editing, might be moved
  status?: OrderStatus; 
  assignedTailorId?: string | null;
  assignedTailorName?: string | null;
  dueDate?: string | null; 
}

interface OrderWorkflowState {
  currentCustomer: Customer | null;
  activeDesign: DesignDetails | null; // Design for the item currently being configured
  orderItems: DesignDetails[]; // Array of designs for items added to the order
  editingItemIndex: number | null; // Index of the item being edited from orderItems
  workflowReturnPath: string | null; 
  editingOrderId: string | null; 
}

interface OrderWorkflowContextType extends OrderWorkflowState {
  setCustomer: (customer: Customer | null) => void;
  setActiveDesign: (design: DesignDetails | null) => void; // To set the design tool's current state
  addOrUpdateItemInOrder: (design: DesignDetails) => void;
  removeOrderItem: (index: number) => void;
  startEditingOrderItem: (index: number) => void;
  clearActiveDesign: () => void; // To reset design tool for a new item
  setWorkflowReturnPath: (path: string | null) => void;
  setEditingOrderId: (orderId: string | null) => void;
  resetWorkflow: () => void;
  loadOrderForEditing: (order: FullOrderType, customer: Customer) => void; // Use FullOrderType
}

const OrderWorkflowContext = createContext<OrderWorkflowContextType | undefined>(undefined);

export const initialSingleDesignState: DesignDetails = {
  style: null,
  notes: '',
  referenceImages: [],
  blouseDetails: {},
  pantDetails: {},
  skirtDetails: {},
  status: "Pending Assignment",
  assignedTailorId: null,
  assignedTailorName: null,
  dueDate: null,
};

const initialState: OrderWorkflowState = {
  currentCustomer: null,
  activeDesign: null, 
  orderItems: [],
  editingItemIndex: null,
  workflowReturnPath: null,
  editingOrderId: null,
};

export function OrderWorkflowProvider({ children }: { children: ReactNode }) {
  const [workflowState, setWorkflowState] = useState<OrderWorkflowState>({...initialState});

  const setCustomer = useCallback((customer: Customer | null) => {
    setWorkflowState(prevState => ({
      ...initialState, // Reset most of the workflow when customer changes, unless editing existing order
      currentCustomer: customer,
      // If editing an order, customer change shouldn't wipe items yet, handle in calling component
      editingOrderId: customer?.id === prevState.currentCustomer?.id ? prevState.editingOrderId : null,
      workflowReturnPath: customer?.id === prevState.currentCustomer?.id ? prevState.workflowReturnPath : null,
    }));
  }, []);

  const setActiveDesign = useCallback((design: DesignDetails | null) => {
    setWorkflowState(prevState => ({ ...prevState, activeDesign: design, editingItemIndex: null }));
  }, []);

  const clearActiveDesign = useCallback(() => {
    setWorkflowState(prevState => ({ ...prevState, activeDesign: { ...initialSingleDesignState }, editingItemIndex: null }));
  }, []);
  
  const addOrUpdateItemInOrder = useCallback((design: DesignDetails) => {
    setWorkflowState(prevState => {
      const newOrderItems = [...prevState.orderItems];
      if (prevState.editingItemIndex !== null) {
        newOrderItems[prevState.editingItemIndex] = design;
      } else {
        newOrderItems.push(design);
      }
      return {
        ...prevState,
        orderItems: newOrderItems,
        activeDesign: null, // Clear active design after adding/updating
        editingItemIndex: null,
      };
    });
  }, []);

  const removeOrderItem = useCallback((index: number) => {
    setWorkflowState(prevState => ({
      ...prevState,
      orderItems: prevState.orderItems.filter((_, i) => i !== index),
    }));
  }, []);

  const startEditingOrderItem = useCallback((index: number) => {
    setWorkflowState(prevState => ({
      ...prevState,
      activeDesign: { ...prevState.orderItems[index] },
      editingItemIndex: index,
    }));
  }, []);

  const setWorkflowReturnPath = useCallback((path: string | null) => {
    setWorkflowState(prevState => ({ ...prevState, workflowReturnPath: path }));
  }, []);

  const setEditingOrderId = useCallback((orderId: string | null) => {
    setWorkflowState(prevState => ({ 
      ...prevState, 
      editingOrderId: orderId,
      ...(orderId === null && !prevState.currentCustomer ? {...initialState} : {}), // Full reset only if no customer
      ...(orderId === null && prevState.currentCustomer ? { // Partial reset if customer exists
          ...initialState, 
          currentCustomer: prevState.currentCustomer, 
        } : {}) 
    }));
  }, []);

  const resetWorkflow = useCallback(() => {
    setWorkflowState({...initialState});
  }, []);

  const loadOrderForEditing = useCallback((order: FullOrderType, customer: Customer) => { // Use FullOrderType
    setWorkflowState({
      currentCustomer: customer,
      orderItems: order.detailedItems || [], 
      activeDesign: null, // No active design initially when loading an order for edit
      editingItemIndex: null,
      editingOrderId: order.id,
      workflowReturnPath: `/orders/${order.id}`, 
    });
  }, []);


  const contextValue: OrderWorkflowContextType = {
    ...workflowState,
    setCustomer,
    setActiveDesign,
    clearActiveDesign,
    addOrUpdateItemInOrder,
    removeOrderItem,
    startEditingOrderItem,
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
