
import { format, subDays, addDays } from "date-fns";

export type OrderStatus = "Pending Assignment" | "Assigned" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export interface Order {
  id: string;
  date: string; 
  status: OrderStatus;
  total: string;
  items: string[];
  customerName?: string;
  assignedTailorId?: string | null;
  assignedTailorName?: string | null;
  dueDate?: string | null;
  shippingAddress?: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
  notes?: string;
}

export const mockOrders: Order[] = [
  { 
    id: "ORD001", date: format(subDays(new Date(), 2), "yyyy-MM-dd"), status: "Processing", total: "$125.00", 
    items: ["Custom A-Line Dress", "Silk Scarf"], customerName: "Eleanor Vance",
    assignedTailorId: "T001", assignedTailorName: "Alice Wonderland", dueDate: format(addDays(new Date(), 5), "yyyy-MM-dd"),
    shippingAddress: { street: "123 Fashion Ave", city: "New York", zipCode: "10001", country: "USA" },
    notes: "Customer requested expedited processing if possible."
  },
  { 
    id: "ORD002", date: format(subDays(new Date(), 20), "yyyy-MM-dd"), status: "Shipped", total: "$75.00", 
    items: ["Fitted Blouse"], customerName: "Marcus Green",
    assignedTailorId: "T003", assignedTailorName: "Carol Danvers", dueDate: format(subDays(new Date(), 10), "yyyy-MM-dd"),
    shippingAddress: { street: "456 Style St", city: "Los Angeles", zipCode: "90001", country: "USA" },
    notes: "Standard shipping."
  },
  { 
    id: "ORD003", date: format(subDays(new Date(), 30), "yyyy-MM-dd"), status: "Delivered", total: "$210.00", 
    items: ["Wide-Leg Trousers", "Linen Shirt"], customerName: "Sarah Miller",
    assignedTailorId: "T001", assignedTailorName: "Alice Wonderland", dueDate: format(subDays(new Date(), 25), "yyyy-MM-dd"),
    shippingAddress: { street: "789 Chic Rd", city: "Chicago", zipCode: "60601", country: "USA" }
  },
  { 
    id: "ORD101", date: format(subDays(new Date(), 1), "yyyy-MM-dd"), status: "Assigned", total: "$95.00", 
    items: ["Custom Silk Blouse"], customerName: "John Doe",
    assignedTailorId: "T003", assignedTailorName: "Carol Danvers", dueDate: format(addDays(new Date(), 12), "yyyy-MM-dd"),
    shippingAddress: { street: "101 Design Dr", city: "Miami", zipCode: "33101", country: "USA" }
  },
   { 
    id: "ORD102", date: format(new Date(), "yyyy-MM-dd"), status: "Pending Assignment", total: "$150.00", 
    items: ["Evening Gown Alteration"], customerName: "Jane Smith",
    assignedTailorId: null, assignedTailorName: null, dueDate: null,
    shippingAddress: { street: "202 Pattern Pl", city: "Houston", zipCode: "77001", country: "USA" }
  },
  { 
    id: "ORD104", date: format(subDays(new Date(), 5), "yyyy-MM-dd"), status: "Processing", total: "$180.00", 
    items: ["Summer Dress"], customerName: "Emily White",
    assignedTailorId: "T002", assignedTailorName: "Bob The Builder", dueDate: format(addDays(new Date(), 8), "yyyy-MM-dd"),
    shippingAddress: { street: "303 Fabric Fwy", city: "Phoenix", zipCode: "85001", country: "USA" }
  },
  { 
    id: "ORD105", date: format(subDays(new Date(), 1), "yyyy-MM-dd"), status: "Pending Assignment", total: "$250.00", 
    items: ["Formal Suit"], customerName: "Robert Brown",
    assignedTailorId: null, assignedTailorName: null, dueDate: null,
    shippingAddress: { street: "404 Thread TRL", city: "Philadelphia", zipCode: "19101", country: "USA" }
  },
  { 
    id: "ORD106", date: format(subDays(new Date(), 60), "yyyy-MM-dd"), status: "Delivered", total: "$80.00", 
    items: ["Skirt Alteration"], customerName: "Linda Davis",
    assignedTailorId: "T002", assignedTailorName: "Bob The Builder", dueDate: format(subDays(new Date(), 50), "yyyy-MM-dd"),
    shippingAddress: { street: "505 Stitch St", city: "San Antonio", zipCode: "78201", country: "USA" }
  },
  { 
    id: "ORD201", date: format(subDays(new Date(), 3), "yyyy-MM-dd"), status: "Processing", total: "$110.00", 
    items: ["Casual Shirt"], customerName: "Chris Pine", 
    assignedTailorId: "T001", assignedTailorName: "Alice Wonderland", dueDate: format(addDays(new Date(), 7), "yyyy-MM-dd"),
    shippingAddress: { street: "606 Garment Grv", city: "San Diego", zipCode: "92101", country: "USA" }
  },
  { 
    id: "ORD202", date: format(subDays(new Date(), 4), "yyyy-MM-dd"), status: "Assigned", total: "$220.00", 
    items: ["Bespoke Jacket"], customerName: "Anna Kendrick", 
    assignedTailorId: "T002", assignedTailorName: "Bob The Builder", dueDate: format(addDays(new Date(), 10), "yyyy-MM-dd"),
    shippingAddress: { street: "707 Couture Ct", city: "Dallas", zipCode: "75201", country: "USA" }
  },
  { 
    id: "ORD203", date: format(subDays(new Date(), 6), "yyyy-MM-dd"), status: "Pending Assignment", total: "$130.00", 
    items: ["Dress Pants"], customerName: "Ryan Reynolds", 
    assignedTailorId: null, assignedTailorName: null, dueDate: null,
    shippingAddress: { street: "808 Tailor Ter", city: "San Jose", zipCode: "95101", country: "USA" }
  },
  { 
    id: "ORD204", date: format(subDays(new Date(), 7), "yyyy-MM-dd"), status: "Processing", total: "$140.00", 
    items: ["Custom Skirt"], customerName: "Gal Gadot", 
    assignedTailorId: "T003", assignedTailorName: "Carol Danvers", dueDate: format(addDays(new Date(), 6), "yyyy-MM-dd"),
    shippingAddress: { street: "909 Vogue Vly", city: "Austin", zipCode: "73301", country: "USA" }
  },
  { 
    id: "ORD205", date: format(subDays(new Date(), 8), "yyyy-MM-dd"), status: "Shipped", total: "$160.00", 
    items: ["Winter Coat"], customerName: "Tom Hardy", 
    assignedTailorId: "T001", assignedTailorName: "Alice Wonderland", dueDate: format(subDays(new Date(), 1), "yyyy-MM-dd"),
    shippingAddress: { street: "111 Loom Ln", city: "Jacksonville", zipCode: "32099", country: "USA" }
  },
  { 
    id: "ORD206", date: format(subDays(new Date(), 9), "yyyy-MM-dd"), status: "Delivered", total: "$170.00", 
    items: ["Formal Gown"], customerName: "Emma Stone", 
    assignedTailorId: "T002", assignedTailorName: "Bob The Builder", dueDate: format(subDays(new Date(), 3), "yyyy-MM-dd"),
    shippingAddress: { street: "222 Mannequin Mdw", city: "Fort Worth", zipCode: "76101", country: "USA" }
  },
  { 
    id: "ORD207", date: format(subDays(new Date(), 10), "yyyy-MM-dd"), status: "Processing", total: "$190.00", 
    items: ["Children's Outfit"], customerName: "Zoe Saldana", 
    assignedTailorId: "T003", assignedTailorName: "Carol Danvers", dueDate: format(addDays(new Date(), 4), "yyyy-MM-dd"),
    shippingAddress: { street: "333 Boutique Blvd", city: "Columbus", zipCode: "43085", country: "USA" }
  },
];

export interface Tailor {
  id: string;
  name: string;
  mobile: string;
  expertise: string[];
  availability: "Available" | "Busy";
  avatar: string;
  dataAiHint: string;
}

export const mockTailors: Tailor[] = [
  { id: "T001", name: "Alice Wonderland", mobile: "555-0101", expertise: ["Dresses", "Evening Wear"], availability: "Available", avatar: "https://placehold.co/100x100.png?text=AW", dataAiHint: "woman portrait" },
  { id: "T002", name: "Bob The Builder", mobile: "555-0102", expertise: ["Suits", "Formal Trousers"], availability: "Busy", avatar: "https://placehold.co/100x100.png?text=BB", dataAiHint: "man portrait" },
  { id: "T003", name: "Carol Danvers", mobile: "555-0103", expertise: ["Casual Wear", "Alterations"], availability: "Available", avatar: "https://placehold.co/100x100.png?text=CD", dataAiHint: "woman professional" },
];

export const allOrderStatuses: OrderStatus[] = ["Pending Assignment", "Assigned", "Processing", "Shipped", "Delivered", "Cancelled"];

export type StatusFilterValue = OrderStatus | "all" | "active_default";

export const statusFilterOptions: { value: StatusFilterValue; label: string }[] = [
  { value: "active_default", label: "Active Orders (Default)" },
  { value: "all", label: "All Statuses" },
  ...allOrderStatuses.map(status => ({ value: status, label: status }))
];
