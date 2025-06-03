
// src/lib/server/dataService.ts
'use server';

import { db } from '@/lib/firebase/config';
import { collection, doc, getDocs, setDoc, deleteDoc, addDoc, serverTimestamp, Timestamp, query, where, getDoc, updateDoc } from 'firebase/firestore';
import type { TailorFormData } from '@/lib/mockData';
import type { Tailor, Customer, Order, OrderStatus, Address } from '@/lib/mockData'; // Added Customer, Order, OrderStatus, Address
import type { MeasurementFormValues } from '@/lib/schemas'; // For Customer's measurements

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
    
    const tailorData = {
      name: formData.name,
      mobile: formData.mobile,
      expertise: expertiseArray,
      updatedAt: serverTimestamp()
    };

    if (existingTailorId) {
      const tailorRef = doc(db, TAILORS_COLLECTION, existingTailorId);
      // For update, we might want to merge to not overwrite fields like avatar, availability, createdAt
      await setDoc(tailorRef, tailorData, { merge: true });
      
      const updatedDocSnap = await getDoc(tailorRef);
      if (!updatedDocSnap.exists()) return null;
      const updatedData = updatedDocSnap.data();
      return {
        id: existingTailorId,
        name: updatedData.name,
        mobile: updatedData.mobile,
        expertise: updatedData.expertise,
        availability: updatedData.availability || 'Available', 
        avatar: updatedData.avatar || `https://placehold.co/100x100.png?text=${(updatedData.name || 'N/A').substring(0,2).toUpperCase()}`,
        dataAiHint: updatedData.dataAiHint || "person portrait",
      };

    } else {
      const newTailorPayload: Omit<Tailor, 'id'> & { createdAt: Timestamp, updatedAt: Timestamp } = {
        name: formData.name,
        mobile: formData.mobile,
        expertise: expertiseArray,
        availability: 'Available', // Default for new tailors
        avatar: `https://placehold.co/100x100.png?text=${formData.name.substring(0,2).toUpperCase()}`,
        dataAiHint: "person portrait", // Default hint
        createdAt: serverTimestamp() as Timestamp, // Cast because serverTimestamp() is a sentinel
        updatedAt: serverTimestamp() as Timestamp,
      };
      const docRef = await addDoc(collection(db, TAILORS_COLLECTION), newTailorPayload);
      return {
        id: docRef.id,
        ...newTailorPayload,
        // Convert server timestamps to something if needed, or ensure Tailor type expects sentinel/Timestamp
      } as Tailor;
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
        address: data.address || undefined, // Ensure address is optional
        measurements: data.measurements || undefined, // Ensure measurements are optional
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

// This is the type for data coming from the customer form in customer-step
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

    const customerDataToSave = {
      name: customerFormInput.name,
      email: customerFormInput.email,
      phone: customerFormInput.phone,
      address: address, // This will be undefined if address fields are not filled
      updatedAt: serverTimestamp(),
    };

    if (existingCustomerId) {
      const customerRef = doc(db, CUSTOMERS_COLLECTION, existingCustomerId);
      // Using updateDoc to only change specified fields and not overwrite e.g. measurements if they exist
      await updateDoc(customerRef, customerDataToSave);
      
      const updatedDocSnap = await getDoc(customerRef); // Re-fetch to get merged data
      if (!updatedDocSnap.exists()) return null;
      const updatedData = updatedDocSnap.data();
      return {
        id: existingCustomerId,
        name: updatedData.name,
        email: updatedData.email,
        phone: updatedData.phone,
        address: updatedData.address,
        measurements: updatedData.measurements, // Preserve existing measurements
      } as Customer;
    } else {
      const newCustomerPayload = {
        ...customerDataToSave,
        measurements: undefined, // New customers don't have measurements from this form
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, CUSTOMERS_COLLECTION), newCustomerPayload);
      // Fetch the newly created document to get its data including server-generated timestamps
      const newDocSnap = await getDoc(docRef);
      if (!newDocSnap.exists()) return null;
      const savedData = newDocSnap.data();
      return {
        id: docRef.id,
        name: savedData.name,
        email: savedData.email,
        phone: savedData.phone,
        address: savedData.address,
        measurements: savedData.measurements,
        // Timestamps are part of savedData if needed by Customer type explicitly
      } as Customer;
    }
  } catch (error) {
    console.error("Error saving customer to Firestore:", error);
    return null;
  }
}

// Note: When saving measurements in measurement-step, we'll need a separate function like updateCustomerMeasurements
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
    // Consider implications: what happens to orders associated with this customer?
    // For now, we just delete the customer.
    return true;
  } catch (error) {
    console.error("Error deleting customer from Firestore:", error);
    return false;
  }
}


// --- Order Functions (Placeholders for now, to be implemented with Firestore) ---
// Using mock data for orders temporarily until Firestore integration for orders
import { mockOrders as MOCK_ORDERS_DB } from '@/lib/mockData'; // Keep this for now for Orders

export async function getOrders(): Promise<Order[]> {
  console.log("DataService: Fetching orders (using mock data)");
  // Simulate async
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
    const newOrder = { ...orderData, id: `ORD_MOCK_${Date.now()}` }; // Ensure ID is unique for mock
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
// End of mock data section for Orders
