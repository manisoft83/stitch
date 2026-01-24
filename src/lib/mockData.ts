
import { format, subDays, addDays } from "date-fns";
import type { MeasurementFormValues } from '@/lib/schemas';
import type { DesignDetails } from "@/contexts/order-workflow-context"; // Import DesignDetails

// Types related to mock data that were moved from dataService.ts
export type OrderStatus = "Pending Assignment" | "Assigned" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export interface Address {
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: Address; 
  // Optional: Timestamps if you want to track them on the client, though often managed by Firestore serverTimestamp
  // createdAt?: any; // Could be Firestore Timestamp or string/Date
  // updatedAt?: any;
}

export interface Order {
  id: string;
  date: string; // Should be string like "yyyy-MM-dd" for client, Firestore uses Timestamp
  status: OrderStatus;
  total: string; // Keep as string for now, can be number in Firestore if needed
  items: string[]; // Summarized descriptions of items for quick display
  customerId: string; 
  customerName?: string; // Denormalized for easy display
  
  // Store full design details for each item in the order
  detailedItems?: DesignDetails[]; 
  
  assignedTailorId?: string | null;
  assignedTailorName?: string | null; // Denormalized
  dueDate?: string | null; // Should be string like "yyyy-MM-dd" for client
  
  shippingAddress?: Address; 
  notes?: string; // General order notes
  assignmentInstructions?: string; // Specific instructions for the tailor for this assignment
  assignmentImage?: string; // A reference image Data URL for this assignment

  createdAt?: any; 
  updatedAt?: any; 
}

export interface Tailor {
  id: string;
  name: string;
  mobile: string;
  expertise: string[];
  availability: "Available" | "Busy";
  avatar: string;
  dataAiHint: string;
}

export interface TailorFormData {
  name: string;
  mobile: string;
  expertise: string; // Comma-separated string from form
}

// Order Statuses and Filter Options
export const allOrderStatuses: OrderStatus[] = ["Pending Assignment", "Assigned", "Processing", "Shipped", "Delivered", "Cancelled"];

export type StatusFilterValue = OrderStatus | "all" | "active_default";

export const statusFilterOptions: { value: StatusFilterValue; label: string }[] = [
  { value: "active_default", label: "Active Orders (Default)" },
  { value: "all", label: "All Statuses" },
  ...allOrderStatuses.map(status => ({ value: status, label: status }))
];

// Helper to get style/fabric/color names - used in summary, might be needed elsewhere
export const styleOptionsForDisplay = [
  { id: 'a-line-dress', name: 'A-Line Dress' },
  { id: 'fitted-blouse', name: 'Fitted Blouse' },
  { id: 'wide-leg-trousers', name: 'Wide-Leg Trousers' },
  { id: 'pencil-skirt', name: 'Pencil Skirt' },
];

export const getDetailNameById = (id: string | null, options: Array<{id: string, name: string}>): string => {
    if (!id) return 'Not selected';
    return options.find(opt => opt.id === id)?.name || 'Unknown';
};

// Function to generate a summary string for a design
export const generateDesignSummary = (design: DesignDetails): string => {
  const styleName = design.style ? getDetailNameById(design.style, styleOptionsForDisplay) : 'N/A';
  return styleName;
};
