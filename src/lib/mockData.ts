
import { format, subDays, addDays } from "date-fns";
import type { MeasurementFormValues } from '@/lib/schemas';

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
  measurements?: MeasurementFormValues; 
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
  items: string[]; // Descriptions of items
  customerId: string; 
  customerName?: string; // Denormalized for easy display
  
  // Measurement details - can be a summary string or a structured object
  // For now, we'll rely on notes and potentially a direct link to customer for full measurements
  measurementsSummary?: string; // e.g., "Bust: 34, Waist: 28, Hips: 38, Height: 65 (Profile: Casual Fit)"

  // Design details
  designDetails?: {
    fabric: string | null;
    color: string | null;
    style: string | null;
    notes: string;
    // TODO: Refactor referenceImageUrls to store Firebase Storage URLs instead of Data URLs
    referenceImageUrls?: string[]; // Array of Data URLs for images
  };
  
  assignedTailorId?: string | null;
  assignedTailorName?: string | null; // Denormalized
  dueDate?: string | null; // Should be string like "yyyy-MM-dd" for client
  
  shippingAddress?: Address; 
  notes?: string; // General order notes, can include summarized design/measurements if not structured separately

  // Timestamps - will be handled by Firestore serverTimestamp, but good to have in type
  createdAt?: any; // Firestore Timestamp on server, string/Date on client
  updatedAt?: any; // Firestore Timestamp on server, string/Date on client
}

// Customer data is now fetched from Firestore via src/lib/server/dataService.ts

// export const mockOrders: Order[] = [
//   {
//     id: "ORD001", date: format(subDays(new Date(), 2), "yyyy-MM-dd"), status: "Processing", total: "$125.00",
//     items: ["Custom A-Line Dress", "Silk Scarf"], customerId: "CUST001", customerName: "Eleanor Vance", // Ensure customerId matches a Firestore customer
//     assignedTailorId: "T001", assignedTailorName: "Alice Wonderland", dueDate: format(addDays(new Date(), 5), "yyyy-MM-dd"),
//     shippingAddress: { street: "123 Fashion Ave", city: "New York", zipCode: "10001", country: "USA" },
//     notes: "Customer requested expedited processing if possible. Design Notes: A-Line Dress (Silk, Red). Measurements Profile: Eleanor - Standard. Bust: 34, Waist: 28, Hips: 38, Height: 65"
//   },
//   {
//     id: "ORD002", date: format(subDays(new Date(), 20), "yyyy-MM-dd"), status: "Shipped", total: "$75.00",
//     items: ["Fitted Blouse"], customerId: "CUST002", customerName: "Marcus Green", // Ensure customerId matches a Firestore customer
//     assignedTailorId: "T003", assignedTailorName: "Carol Danvers", dueDate: format(subDays(new Date(), 10), "yyyy-MM-dd"),
//     shippingAddress: { street: "456 Style St", city: "Los Angeles", zipCode: "90001", country: "USA" },
//     notes: "Standard shipping. Design Notes: Fitted Blouse (Cotton, Blue). Measurements Profile: Default. Bust: 36, Waist: 30, Hips: 40, Height: 68",
//     referenceImageUrls: ["https://placehold.co/100x100.png?text=Ref1", "https://placehold.co/100x100.png?text=Ref2"]
//   },
// ];
// Order data is now fetched from Firestore via src/lib/server/dataService.ts


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
export const fabricOptionsForDisplay = [
  { id: 'cotton', name: 'Cotton' },
  { id: 'silk', name: 'Silk' },
  { id: 'linen', name: 'Linen' },
  { id: 'wool', name: 'Wool' },
];

export const colorOptionsForDisplay = [
  { id: 'red', name: 'Red', hex: '#FF0000' },
  { id: 'blue', name: 'Blue', hex: '#0000FF' },
  { id: 'green', name: 'Green', hex: '#00FF00' },
  { id: 'black', name: 'Black', hex: '#000000' },
  { id: 'white', name: 'White', hex: '#FFFFFF' },
];

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
