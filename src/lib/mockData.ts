
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
  total: string;
  items: string[];
  customerId: string; 
  customerName?: string; 
  assignedTailorId?: string | null;
  assignedTailorName?: string | null;
  dueDate?: string | null; // Should be string like "yyyy-MM-dd" for client
  shippingAddress?: Address; 
  notes?: string;
  referenceImageUrls?: string[]; 
  // Optional: Timestamps
  // createdAt?: any;
  // updatedAt?: any;
}

// Mock Data Arrays
// export const mockCustomers: Customer[] = [
//   { 
//     id: "CUST001", 
//     name: "Eleanor Vance", 
//     email: "eleanor@example.com", 
//     phone: "555-0101",
//     measurements: { name: "Eleanor - Standard", bust: 34, waist: 28, hips: 38, height: 65 },
//     address: { street: "123 Fashion Ave", city: "New York", zipCode: "10001", country: "USA" }
//   },
//   { 
//     id: "CUST002", 
//     name: "Marcus Green", 
//     email: "marcus@example.com", 
//     phone: "555-0102",
//     address: { street: "456 Style St", city: "Los Angeles", zipCode: "90001", country: "USA" }
//   },
//   { 
//     id: "CUST003", 
//     name: "Sarah Miller", 
//     email: "sarah@example.com", 
//     phone: "555-0103",
//     address: { street: "789 Chic Rd", city: "Chicago", zipCode: "60601", country: "USA" }
//   },
// ];
// Customer data is now fetched from Firestore via src/lib/server/dataService.ts

export const mockOrders: Order[] = [
  {
    id: "ORD001", date: format(subDays(new Date(), 2), "yyyy-MM-dd"), status: "Processing", total: "$125.00",
    items: ["Custom A-Line Dress", "Silk Scarf"], customerId: "CUST001", customerName: "Eleanor Vance", // Ensure customerId matches a Firestore customer
    assignedTailorId: "T001", assignedTailorName: "Alice Wonderland", dueDate: format(addDays(new Date(), 5), "yyyy-MM-dd"),
    shippingAddress: { street: "123 Fashion Ave", city: "New York", zipCode: "10001", country: "USA" },
    notes: "Customer requested expedited processing if possible."
  },
  {
    id: "ORD002", date: format(subDays(new Date(), 20), "yyyy-MM-dd"), status: "Shipped", total: "$75.00",
    items: ["Fitted Blouse"], customerId: "CUST002", customerName: "Marcus Green", // Ensure customerId matches a Firestore customer
    assignedTailorId: "T003", assignedTailorName: "Carol Danvers", dueDate: format(subDays(new Date(), 10), "yyyy-MM-dd"),
    shippingAddress: { street: "456 Style St", city: "Los Angeles", zipCode: "90001", country: "USA" },
    notes: "Standard shipping."
  },
  // ... other mock orders, ensure their customerId fields are valid if you test with them.
];
// Order data is still mocked for now. Firestore integration for orders is pending.


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
