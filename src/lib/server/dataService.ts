
// src/lib/server/dataService.ts
'use server';

import { db } from '@/lib/firebase/config';
import { collection, doc, getDocs, setDoc, deleteDoc, addDoc, serverTimestamp, Timestamp, query, where, getDoc, updateDoc } from 'firebase/firestore';
import type { TailorFormData } from '@/lib/mockData';
import type { Tailor, Customer, Address } from '@/lib/mockData'; // Removed Order, OrderStatus for this file
import type { MeasurementFormValues } from '@/lib/schemas';

const TAILORS_COLLECTION = 'tailors';
const CUSTOMERS_COLLECTION = 'customers';
// const ORDERS_COLLECTION = 'orders'; // Will be used later

// --- Tailor Functions ---
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
        avatar: data.avatar || `https://placehold.co/100x100.png?text=${(data.name || 'N/A').substring(0,2).toUpperCase()}`,
        dataAiHint: data.dataAiHint || 'person portrait',
      } as Tailor;
    });
    return tailorsList;
  } catch (error) {
    console.error("Error fetching tailors from Firestore:", error);
    return [];
  }
}

export async function saveTailor(formData: TailorFormData, existingTailorId?: string): Promise<Tailor | null> {
  console.log(`DataService: Saving tailor to Firestore: ${existingTailorId ? 'Update ID ' + existingTailorId : 'New'}`, formData);
  try {
    const expertiseArray = formData.expertise.split(',').map(e => e.trim()).filter(e => e);
    
    const tailorDataForDb = {
      name: formData.name,
      mobile: formData.mobile,
      expertise: expertiseArray,
      updatedAt: serverTimestamp()
    };

    if (existingTailorId) {
      const tailorRef = doc(db, TAILORS_COLLECTION, existingTailorId);
      await setDoc(tailorRef, tailorDataForDb, { merge: true });
      
      const updatedDocSnap = await getDoc(tailorRef);
      if (!updatedDocSnap.exists()) return null;
      const updatedData = updatedDocSnap.data();
      // Explicitly map to Tailor type, excluding any raw Timestamps
      return {
        id: existingTailorId,
        name: updatedData.name || '',
        mobile: updatedData.mobile || '',
        expertise: Array.isArray(updatedData.expertise) ? updatedData.expertise : [],
        availability: updatedData.availability || 'Available', 
        avatar: updatedData.avatar || `https://placehold.co/100x100.png?text=${(updatedData.name || 'N/A').substring(0,2).toUpperCase()}`,
        dataAiHint: updatedData.dataAiHint || "person portrait",
      };

    } else {
      const newTailorPayloadForDb = {
        name: formData.name,
        mobile: formData.mobile,
        expertise: expertiseArray,
        availability: 'Available',
        avatar: `https://placehold.co/100x100.png?text=${formData.name.substring(0,2).toUpperCase()}`,
        dataAiHint: "person portrait",
        createdAt: serverTimestamp(), 
        updatedAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, TAILORS_COLLECTION), newTailorPayloadForDb);
      const newDocSnap = await getDoc(docRef);
      if (!newDocSnap.exists()) return null;
      const savedData = newDocSnap.data();
      // Explicitly map to Tailor type from savedData
      return {
        id: docRef.id,
        name: savedData.name || '',
        mobile: savedData.mobile || '',
        expertise: Array.isArray(savedData.expertise) ? savedData.expertise : [],
        availability: savedData.availability || 'Available',
        avatar: savedData.avatar || `https://placehold.co/100x100.png?text=${(savedData.name || 'N/A').substring(0,2).toUpperCase()}`,
        dataAiHint: savedData.dataAiHint || "person portrait",
      };
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

// --- Customer Functions ---
export async function getCustomers(): Promise<Customer[]> {
  console.log("DataService: Fetching customers from Firestore");
  try {
    const customersCollection = collection(db, CUSTOMERS_COLLECTION);
    const customerSnapshot = await getDocs(customersCollection);
    const customersList = customerSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || undefined, 
        measurements: data.measurements || undefined, 
      } as Customer;
    });
    return customersList;
  } catch (error) {
    console.error("Error fetching customers from Firestore:", error);
    return [];
  }
}

export async function getCustomerById(customerId: string): Promise<Customer | null> {
  console.log(`DataService: Fetching customer by ID ${customerId} from Firestore`);
  try {
    const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
    const docSnap = await getDoc(customerRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || undefined,
        measurements: data.measurements || undefined,
      } as Customer;
    } else {
      console.log(`Customer with ID ${customerId} not found.`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching customer ${customerId} from Firestore:`, error);
    return null;
  }
}

export interface CustomerFormInput {
  name: string;
  email: string;
  phone: string;
  street?: string;
  city?: string;
  zipCode?: string;
  country?: string;
}

export async function saveCustomer(customerFormInput: CustomerFormInput, existingCustomerId?: string): Promise<Customer | null> {
  console.log(`DataService: Saving customer to Firestore: ${existingCustomerId ? 'Update ID ' + existingCustomerId : 'New'}`, customerFormInput);
  try {
    const address: Address | undefined = (customerFormInput.street && customerFormInput.city && customerFormInput.zipCode && customerFormInput.country)
      ? { street: customerFormInput.street, city: customerFormInput.city, zipCode: customerFormInput.zipCode, country: customerFormInput.country }
      : undefined;

    const customerDataForDb = {
      name: customerFormInput.name,
      email: customerFormInput.email,
      phone: customerFormInput.phone,
      address: address, 
      updatedAt: serverTimestamp(),
    };

    if (existingCustomerId) {
      const customerRef = doc(db, CUSTOMERS_COLLECTION, existingCustomerId);
      await updateDoc(customerRef, customerDataForDb);
      
      const updatedDocSnap = await getDoc(customerRef); 
      if (!updatedDocSnap.exists()) return null;
      const updatedData = updatedDocSnap.data();
      // Explicitly map to Customer type
      return {
        id: existingCustomerId,
        name: updatedData.name || '',
        email: updatedData.email || '',
        phone: updatedData.phone || '',
        address: updatedData.address || undefined,
        measurements: updatedData.measurements || undefined, 
      };
    } else {
      const newCustomerPayloadForDb = {
        ...customerDataForDb,
        measurements: undefined, 
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, CUSTOMERS_COLLECTION), newCustomerPayloadForDb);
      const newDocSnap = await getDoc(docRef);
      if (!newDocSnap.exists()) return null;
      const savedData = newDocSnap.data();
      // Explicitly map to Customer type
      return {
        id: docRef.id,
        name: savedData.name || '',
        email: savedData.email || '',
        phone: savedData.phone || '',
        address: savedData.address || undefined,
        measurements: savedData.measurements || undefined,
      };
    }
  } catch (error) {
    console.error("Error saving customer to Firestore:", error);
    return null;
  }
}

export async function updateCustomerMeasurements(customerId: string, measurements: MeasurementFormValues): Promise<boolean> {
  console.log(`DataService: Updating measurements for customer ID ${customerId}`, measurements);
  try {
    const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
    await updateDoc(customerRef, {
      measurements: measurements,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error(`Error updating measurements for customer ${customerId}:`, error);
    return false;
  }
}

export async function deleteCustomerById(customerId: string): Promise<boolean> {
  console.log(`DataService: Deleting customer from Firestore: ID ${customerId}`);
  try {
    const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
    await deleteDoc(customerRef);
    return true;
  } catch (error) {
    console.error("Error deleting customer from Firestore:", error);
    return false;
  }
}

// --- Order Functions (Placeholders for now, to be implemented with Firestore) ---
// Re-importing Order and OrderStatus specifically for mock data usage below
import { type Order, type OrderStatus, mockOrders as MOCK_ORDERS_DB } from '@/lib/mockData'; 

export async function getOrders(): Promise<Order[]> {
  console.log("DataService: Fetching orders (using mock data)");
  await new Promise(resolve => setTimeout(resolve, 50));
  return Promise.resolve([...MOCK_ORDERS_DB]);
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  console.log(`DataService: Fetching order by ID ${orderId} (using mock data)`);
  await new Promise(resolve => setTimeout(resolve, 50));
  const order = MOCK_ORDERS_DB.find(o => o.id === orderId);
  return Promise.resolve(order || null);
}

export async function saveOrder(orderData: Order, existingOrderId?: string): Promise<Order | null> {
  console.log(`DataService: Saving order ${existingOrderId || 'new'} (using mock data)`);
  await new Promise(resolve => setTimeout(resolve, 50));
  if (existingOrderId) {
    const index = MOCK_ORDERS_DB.findIndex(o => o.id === existingOrderId);
    if (index !== -1) {
      MOCK_ORDERS_DB[index] = { ...MOCK_ORDERS_DB[index], ...orderData, id: existingOrderId };
      return Promise.resolve(MOCK_ORDERS_DB[index]);
    }
    return Promise.resolve(null);
  } else {
    const newOrder = { ...orderData, id: `ORD_MOCK_${Date.now()}` }; 
    MOCK_ORDERS_DB.unshift(newOrder);
    return Promise.resolve(newOrder);
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    console.log(`DataService: Updating order status for ${orderId} to ${status} (using mock data)`);
    await new Promise(resolve => setTimeout(resolve, 50));
    const orderIndex = MOCK_ORDERS_DB.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        MOCK_ORDERS_DB[orderIndex].status = status;
        return Promise.resolve(true);
    }
    return Promise.resolve(false);
}
