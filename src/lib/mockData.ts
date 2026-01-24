
import { format, subDays, addDays } from "date-fns";

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
}

// --- New Garment Style Management Types ---

export const allPossibleMeasurements = [
    { id: 'type', label: 'Type' },
    { id: 'length', label: 'Length' },
    { id: 'upper_chest', label: 'Upper Chest' },
    { id: 'waist', label: 'Waist' },
    { id: 'shoulder', label: 'Shoulder' },
    { id: 'sleeve', label: 'Sleeve' },
    { id: 'front_neck', label: 'Front Neck' },
    { id: 'back_neck', label: 'Back Neck' },
    { id: 'dt', label: 'DT' },
    { id: 'pant_type', label: 'Pant Type' },
    { id: 'skirt_type', label: 'Skirt Type' },
    { id: 'fl', label: 'FL (Full Length)' },
    { id: 'yoke', label: 'Yoke' },
    { id: 'sh', label: 'SH (Shoulder)' },
    { id: 'cut', label: 'Cut' },
    { id: 'sl', label: 'SL (Sleeve Length)' },
    { id: 'fn', label: 'FN (Front Neck)' },
    { id: 'bn', label: 'BN (Back Neck)' },
    { id: 'slit', label: 'Slit' },
    { id: 'extra', label: 'Extra' },
];


export interface GarmentStyle {
  id: string;
  name: string;
  requiredMeasurements: string[]; // Array of measurement IDs from allPossibleMeasurements
}

// --- End New Garment Style Types ---

// Define the structure for design details of a single item
export interface DesignDetails {
  styleId: string;
  styleName: string;
  notes: string;
  referenceImages?: string[]; 
  measurements: { [key: string]: string | number | undefined };
  // Fields below are more for overall order context during editing
  status?: OrderStatus; 
  assignedTailorId?: string | null;
  assignedTailorName?: string | null;
  dueDate?: string | null; 
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
export const getDetailNameById = (id: string | null, options: Array<{id: string, name: string}>): string => {
    if (!id) return 'Not selected';
    return options.find(opt => opt.id === id)?.name || 'Unknown';
};

// Function to generate a summary string for a design
export const generateDesignSummary = (design: DesignDetails): string => {
  return design.styleName || 'N/A';
};
