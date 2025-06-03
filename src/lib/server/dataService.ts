// src/lib/server/dataService.ts
'use server';

import { db } from '@/lib/firebase/config';
import { collection, doc, getDocs, setDoc, deleteDoc, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { Tailor, TailorFormData } from '@/lib/mockData';

const TAILORS_COLLECTION = 'tailors';

export async function getTailors(): Promise<Tailor[]> {
  console.log("DataService: Fetching tailors from Firestore");
  try {
    const tailorsCollection = collection(db, TAILORS_COLLECTION);
    const tailorSnapshot = await getDocs(tailorsCollection);
    const tailorsList = tailorSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        mobile: data.mobile || '',
        expertise: Array.isArray(data.expertise) ? data.expertise : [],
        availability: data.availability || 'Available',
        avatar: data.avatar || '',
        dataAiHint: data.dataAiHint || 'person portrait',
        // Handle potential Firestore Timestamp for a createdAt/updatedAt field if you add it
        // createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
      } as Tailor;
    });
    return tailorsList;
  } catch (error) {
    console.error("Error fetching tailors from Firestore:", error);
    return []; // Return empty array on error
  }
}

export async function saveTailor(formData: TailorFormData, existingTailorId?: string): Promise<Tailor | null> {
  console.log(`DataService: Saving tailor to Firestore: ${existingTailorId ? 'Update ID ' + existingTailorId : 'New'}`, formData);
  try {
    const expertiseArray = formData.expertise.split(',').map(e => e.trim()).filter(e => e);
    
    const tailorData = {
      name: formData.name,
      mobile: formData.mobile,
      expertise: expertiseArray,
      // availability: 'Available', // Default for new, or retain existing for updates
      // avatar: `https://placehold.co/100x100.png?text=${formData.name.substring(0,2).toUpperCase()}`,
      // dataAiHint: "person portrait",
      // updatedAt: serverTimestamp() // Good practice to add timestamps
    };

    if (existingTailorId) {
      const tailorRef = doc(db, TAILORS_COLLECTION, existingTailorId);
      // To preserve existing fields like avatar, availability, etc., fetch first or merge.
      // For simplicity here, we're only setting fields from formData.
      // A more robust update might involve fetching the doc then merging.
      await setDoc(tailorRef, {
        ...tailorData, // formData fields
        // Retain other fields if necessary or update them specifically
        // For example, if availability or avatar are not part of TailorFormData
        // you might need to fetch the document first to merge, or handle this in the form
      }, { merge: true }); // merge:true is important to not overwrite fields not in tailorData
      
      // To return the full Tailor object, we'd ideally re-fetch or construct it with the ID.
      // For now, returning a constructed object:
      const updatedTailorDoc = (await getDocs(collection(db, TAILORS_COLLECTION))).docs.find(d => d.id === existingTailorId);
      if (!updatedTailorDoc) return null;
      const updatedData = updatedTailorDoc.data();
      return {
        id: existingTailorId,
        name: updatedData.name,
        mobile: updatedData.mobile,
        expertise: updatedData.expertise,
        availability: updatedData.availability || 'Available', // Default if not set
        avatar: updatedData.avatar || `https://placehold.co/100x100.png?text=${updatedData.name.substring(0,2).toUpperCase()}`,
        dataAiHint: updatedData.dataAiHint || "person portrait",
      };

    } else {
      // For new tailor, set default avatar and availability
      const newTailorPayload = {
        ...tailorData,
        availability: 'Available',
        avatar: `https://placehold.co/100x100.png?text=${formData.name.substring(0,2).toUpperCase()}`,
        dataAiHint: "person portrait",
        createdAt: serverTimestamp() // Good practice
      };
      const docRef = await addDoc(collection(db, TAILORS_COLLECTION), newTailorPayload);
      return {
        id: docRef.id,
        ...newTailorPayload,
        expertise: expertiseArray, // ensure this is the array form
        // createdAt will be a Timestamp, might need conversion if used directly in client
      } as Tailor; // Cast needed as createdAt is a Timestamp server-side
    }
  } catch (error) {
    console.error("Error saving tailor to Firestore:", error);
    return null;
  }
}

export async function deleteTailorById(tailorId: string): Promise<boolean> {
  console.log(`DataService: Deleting tailor from Firestore: ID ${tailorId}`);
  try {
    const tailorRef = doc(db, TAILORS_COLLECTION, tailorId);
    await deleteDoc(tailorRef);
    return true;
  } catch (error) {
    console.error("Error deleting tailor from Firestore:", error);
    return false;
  }
}

// --- Mock data for other entities - will be replaced later ---
// Keep the Customer and Order mock data and related functions for now
// so the rest of the app doesn't break.

export type OrderStatus = "Pending Assignment" | "Assigned" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export interface Address {
  street: string;
  city: string;
  zipCode: string;
  country: string;
}
export interface MeasurementFormValues {
  name?: string;
  bust: number;
  waist: number;
  hips: number;
  height: number;
}
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  measurements?: MeasurementFormValues; 
  address?: Address;
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
  shippingAddress?: Address;
  notes?: string;
  referenceImageUrls?: string[]; 
}

export const mockOrders: Order[] = [
    // ... (keep existing mock orders for now)
  {
    id: "ORD001", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: "Processing", total: "$125.00",
    items: ["Custom A-Line Dress", "Silk Scarf"], customerId: "CUST001", customerName: "Eleanor Vance",
    assignedTailorId: "T001", assignedTailorName: "Alice Wonderland", dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    shippingAddress: { street: "123 Fashion Ave", city: "New York", zipCode: "10001", country: "USA" },
    notes: "Customer requested expedited processing if possible."
  },
];
