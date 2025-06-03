
import { format, subDays, addDays } from "date-fns";
import type { MeasurementFormValues } from '@/lib/schemas';

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
  address?: Address; // Added address field
}

export const mockCustomers: Customer[] = [
  { 
    id: "CUST001", 
    name: "Eleanor Vance", 
    email: "eleanor@example.com", 
    phone: "555-0101",
    measurements: { name: "Eleanor - Standard", bust: 34, waist: 28, hips: 38, height: 65 },
    address: { street: "123 Fashion Ave", city: "New York", zipCode: "10001", country: "USA" }
  },
  { 
    id: "CUST002", 
    name: "Marcus Green", 
    email: "marcus@example.com", 
    phone: "555-0102",
    address: { street: "456 Style St", city: "Los Angeles", zipCode: "90001", country: "USA" }
  },
  { 
    id: "CUST003", 
    name: "Sarah Miller", 
    email: "sarah@example.com", 
    phone: "555-0103",
    address: { street: "789 Chic Rd", city: "Chicago", zipCode: "60601", country: "USA" }
  },
];

export interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  total: string;
  items: string[];
  customerId: string; 
  customerName?: string; 
  assignedTailorId?: string | null;
  assignedTailorName?: string | null;
  dueDate?: string | null;
  shippingAddress?: Address; // Uses Address interface
  notes?: string;
  referenceImageUrls?: string[]; 
}

export const mockOrders: Order[] = [
  {
    id: "ORD001", date: format(subDays(new Date(), 2), "yyyy-MM-dd"), status: "Processing", total: "$125.00",
    items: ["Custom A-Line Dress", "Silk Scarf"], customerId: "CUST001", customerName: "Eleanor Vance",
    assignedTailorId: "T001", assignedTailorName: "Alice Wonderland", dueDate: format(addDays(new Date(), 5), "yyyy-MM-dd"),
    shippingAddress: { street: "123 Fashion Ave", city: "New York", zipCode: "10001", country: "USA" },
    notes: "Customer requested expedited processing if possible."
  },
  {
    id: "ORD002", date: format(subDays(new Date(), 20), "yyyy-MM-dd"), status: "Shipped", total: "$75.00",
    items: ["Fitted Blouse"], customerId: "CUST002", customerName: "Marcus Green",
    assignedTailorId: "T003", assignedTailorName: "Carol Danvers", dueDate: format(subDays(new Date(), 10), "yyyy-MM-dd"),
    shippingAddress: { street: "456 Style St", city: "Los Angeles", zipCode: "90001", country: "USA" },
    notes: "Standard shipping."
  },
  {
    id: "ORD003", date: format(subDays(new Date(), 30), "yyyy-MM-dd"), status: "Delivered", total: "$210.00",
    items: ["Wide-Leg Trousers", "Linen Shirt"], customerId: "CUST003", customerName: "Sarah Miller",
    assignedTailorId: "T001", assignedTailorName: "Alice Wonderland", dueDate: format(subDays(new Date(), 25), "yyyy-MM-dd"),
    shippingAddress: { street: "789 Chic Rd", city: "Chicago", zipCode: "60601", country: "USA" }
  },
  {
    id: "ORD101", date: format(subDays(new Date(), 1), "yyyy-MM-dd"), status: "Assigned", total: "$95.00",
    items: ["Custom Silk Blouse"], customerId: "CUST001", customerName: "Eleanor Vance",
    assignedTailorId: "T003", assignedTailorName: "Carol Danvers", dueDate: format(addDays(new Date(), 12), "yyyy-MM-dd"),
    shippingAddress: { street: "101 Design Dr", city: "Miami", zipCode: "33101", country: "USA" }
  },
   {
    id: "ORD102", date: format(new Date(), "yyyy-MM-dd"), status: "Pending Assignment", total: "$150.00",
    items: ["Evening Gown Alteration"], customerId: "CUST002", customerName: "Marcus Green",
    assignedTailorId: null, assignedTailorName: null, dueDate: null,
    shippingAddress: { street: "202 Pattern Pl", city: "Houston", zipCode: "77001", country: "USA" }
  },
  {
    id: "ORD104", date: format(subDays(new Date(), 5), "yyyy-MM-dd"), status: "Processing", total: "$180.00",
    items: ["Summer Dress"], customerId: "CUST003", customerName: "Sarah Miller",
    assignedTailorId: "T002", assignedTailorName: "Bob The Builder", dueDate: format(addDays(new Date(), 8), "yyyy-MM-dd"),
    shippingAddress: { street: "303 Fabric Fwy", city: "Phoenix", zipCode: "85001", country: "USA" }
  },
  {
    id: "ORD105", date: format(subDays(new Date(), 1), "yyyy-MM-dd"), status: "Pending Assignment", total: "$250.00",
    items: ["Formal Suit"], customerId: "CUST_NEW_RBrown", customerName: "Robert Brown", 
    assignedTailorId: null, assignedTailorName: null, dueDate: null,
    shippingAddress: { street: "404 Thread TRL", city: "Philadelphia", zipCode: "19101", country: "USA" }
  },
  {
    id: "ORD106", date: format(subDays(new Date(), 60), "yyyy-MM-dd"), status: "Delivered", total: "$80.00",
    items: ["Skirt Alteration"], customerId: "CUST_NEW_LDavis", customerName: "Linda Davis",
    assignedTailorId: "T002", assignedTailorName: "Bob The Builder", dueDate: format(subDays(new Date(), 50), "yyyy-MM-dd"),
    shippingAddress: { street: "505 Stitch St", city: "San Antonio", zipCode: "78201", country: "USA" }
  },
  {
    id: "ORD201", date: format(subDays(new Date(), 3), "yyyy-MM-dd"), status: "Processing", total: "$110.00",
    items: ["Casual Shirt"], customerId: "CUST001", customerName: "Eleanor Vance",
    assignedTailorId: "T001", assignedTailorName: "Alice Wonderland", dueDate: format(addDays(new Date(), 7), "yyyy-MM-dd"),
    shippingAddress: { street: "606 Garment Grv", city: "San Diego", zipCode: "92101", country: "USA" }
  },
  {
    id: "ORD202", date: format(subDays(new Date(), 4), "yyyy-MM-dd"), status: "Assigned", total: "$220.00",
    items: ["Bespoke Jacket"], customerId: "CUST002", customerName: "Marcus Green",
    assignedTailorId: "T002", assignedTailorName: "Bob The Builder", dueDate: format(addDays(new Date(), 10), "yyyy-MM-dd"),
    shippingAddress: { street: "707 Couture Ct", city: "Dallas", zipCode: "75201", country: "USA" }
  },
];

// Tailor interface and data are now primarily managed by dataService.ts
// This is kept for type reference if needed elsewhere, but dataService is the source of truth.
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

/*
// This is now sourced from dataService.ts
export const mockTailors: Tailor[] = [
  { id: "T001", name: "Alice Wonderland", mobile: "555-0101", expertise: ["Dresses", "Evening Wear"], availability: "Available", avatar: "https://placehold.co/100x100.png?text=AW", dataAiHint: "woman portrait" },
  { id: "T002", name: "Bob The Builder", mobile: "555-0102", expertise: ["Suits", "Formal Trousers"], availability: "Busy", avatar: "https://placehold.co/100x100.png?text=BB", dataAiHint: "man portrait" },
  { id: "T003", name: "Carol Danvers", mobile: "555-0103", expertise: ["Casual Wear", "Alterations"], availability: "Available", avatar: "https://placehold.co/100x100.png?text=CD", dataAiHint: "woman professional" },
];
*/

export const allOrderStatuses: OrderStatus[] = ["Pending Assignment", "Assigned", "Processing", "Shipped", "Delivered", "Cancelled"];

export type StatusFilterValue = OrderStatus | "all" | "active_default";

export const statusFilterOptions: { value: StatusFilterValue; label: string }[] = [
  { value: "active_default", label: "Active Orders (Default)" },
  { value: "all", label: "All Statuses" },
  ...allOrderStatuses.map(status => ({ value: status, label: status }))
];
