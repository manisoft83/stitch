
// src/lib/server/dataService.ts
'use server';

import { db } from '@/lib/firebase/config';
import { collection, doc, getDocs, setDoc, deleteDoc, addDoc, serverTimestamp, Timestamp, query, where, getDoc, updateDoc, FieldValue, deleteField } from 'firebase/firestore';
import type { TailorFormData } from '@/lib/mockData'; // Using TailorFormData specifically for the form
import type { Tailor, Customer, Address, Order, OrderStatus } from '@/lib/mockData'; // Keep general types
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
    const tailorsList = tailorSnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || '',
        mobile: data.mobile || '',
        expertise: Array.isArray(data.expertise) ? data.expertise : [],
        availability: data.availability || 'Available',
        avatar: data.avatar || `https://placehold.co/100x100.png?text=${(data.name || 'N/A').substring(0,2).toUpperCase()}`,
        dataAiHint: data.dataAiHint || 'person portrait',
      } as Tailor;
    });
    console.log(`DataService: Successfully fetched ${tailorsList.length} tailors.`);
    return tailorsList;
  } catch (error) {
    console.error("DataService: Error fetching tailors from Firestore:", error);
    return [];
  }
}

export async function saveTailor(formData: TailorFormData, existingTailorId?: string): Promise<Tailor | null> {
  console.log(`DataService: Saving tailor to Firestore. Input: ${JSON.stringify(formData)}, ExistingID: ${existingTailorId}`);
  try {
    const expertiseArray = formData.expertise.split(',').map(e => e.trim()).filter(e => e);
    
    const tailorDataForDb: {name: string; mobile: string; expertise: string[]; updatedAt: FieldValue, avatar?: string, dataAiHint?: string, availability?: string, createdAt?: FieldValue} = {
      name: formData.name,
      mobile: formData.mobile,
      expertise: expertiseArray,
      updatedAt: serverTimestamp()
    };

    if (existingTailorId) {
      console.log(`DataService: Attempting to update tailor ${existingTailorId}`);
      const tailorRef = doc(db, TAILORS_COLLECTION, existingTailorId);
      await updateDoc(tailorRef, tailorDataForDb);
      console.log(`DataService: Successfully called updateDoc for tailor ${existingTailorId}`);
      
      const updatedDocSnap = await getDoc(tailorRef);
      if (!updatedDocSnap.exists()) {
        console.error(`DataService: Tailor document ${existingTailorId} not found after update attempt.`);
        return null;
      }
      const updatedData = updatedDocSnap.data();
      console.log(`DataService: Successfully fetched updated tailor data for ${existingTailorId}`);
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
      console.log(`DataService: Attempting to add new tailor`);
      tailorDataForDb.availability = 'Available';
      tailorDataForDb.avatar = `https://placehold.co/100x100.png?text=${formData.name.substring(0,2).toUpperCase()}`;
      tailorDataForDb.dataAiHint = "person portrait";
      tailorDataForDb.createdAt = serverTimestamp();
      
      const docRef = await addDoc(collection(db, TAILORS_COLLECTION), tailorDataForDb);
      console.log(`DataService: Successfully called addDoc, new tailor ID: ${docRef.id}`);
      const newDocSnap = await getDoc(docRef);
      if (!newDocSnap.exists()) {
        console.error(`DataService: Newly created tailor document ${docRef.id} not found.`);
        return null;
      }
      const savedData = newDocSnap.data();
       console.log(`DataService: Successfully fetched new tailor data for ${docRef.id}`);
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
    console.error("DataService: Error saving tailor to Firestore:", error);
    if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
    }
    return null;
  }
}

export async function deleteTailorById(tailorId: string): Promise<boolean> {
  console.log(`DataService: Deleting tailor from Firestore: ID ${tailorId}`);
  try {
    const tailorRef = doc(db, TAILORS_COLLECTION, tailorId);
    await deleteDoc(tailorRef);
    console.log(`DataService: Successfully deleted tailor ${tailorId}`);
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
    const customersList = customerSnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || undefined, 
        measurements: data.measurements || undefined, 
      } as Customer;
    });
    console.log(`DataService: Successfully fetched ${customersList.length} customers.`);
    return customersList;
  } catch (error) {
    console.error("DataService: Error fetching customers from Firestore:", error);
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
      console.log(`DataService: Successfully fetched customer ${customerId}.`);
      return {
        id: docSnap.id,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || undefined,
        measurements: data.measurements || undefined,
      } as Customer;
    } else {
      console.log(`DataService: Customer with ID ${customerId} not found.`);
      return null;
    }
  } catch (error) {
    console.error(`DataService: Error fetching customer ${customerId} from Firestore:`, error);
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
  console.log(`DataService: Saving customer. Input: ${JSON.stringify(customerFormInput)}, ExistingID: ${existingCustomerId}`);
  
  const { name, email, phone, street, city, zipCode, country } = customerFormInput;

  const customerDataForDb: {
      name: string;
      email: string;
      phone: string;
      updatedAt: FieldValue;
      createdAt?: FieldValue;
      address?: Address | FieldValue; // Allows Address object or deleteField()
      measurements?: MeasurementFormValues; // Measurements are handled by a separate function for updates
  } = {
      name,
      email,
      phone,
      updatedAt: serverTimestamp(),
  };

  // Address handling
  const allAddressFieldsPresentAndNonEmpty = street && city && zipCode && country;
  // Check if the intent is to clear the address by submitting all address fields as empty strings.
  const intentToClearAddress =
    (customerFormInput.hasOwnProperty('street') && street === '') &&
    (customerFormInput.hasOwnProperty('city') && city === '') &&
    (customerFormInput.hasOwnProperty('zipCode') && zipCode === '') &&
    (customerFormInput.hasOwnProperty('country') && country === '');

  if (allAddressFieldsPresentAndNonEmpty) {
    customerDataForDb.address = { street, city, zipCode, country };
    console.log(`DataService: Complete address provided. Setting/updating address field.`);
  } else if (existingCustomerId && intentToClearAddress) {
    customerDataForDb.address = deleteField();
    console.log(`DataService: All address fields submitted as empty for update. Deleting address field.`);
  }
  // If it's a new customer and address is not complete, customerDataForDb.address remains undefined, so no address field is created.
  // If it's an update, and the address is not complete AND it's not an intentToClearAddress,
  // customerDataForDb.address remains undefined, so the existing address field in Firestore is not touched by updateDoc.

  try {
    if (existingCustomerId) {
      console.log(`DataService: Attempting to update customer ${existingCustomerId}`);
      const customerRef = doc(db, CUSTOMERS_COLLECTION, existingCustomerId);
      
      const docToUpdateSnap = await getDoc(customerRef);
      if (!docToUpdateSnap.exists()) {
          console.error(`DataService: Customer document ${existingCustomerId} does not exist. Cannot update.`);
          return null;
      }
      // Note: measurements are not set here; they are updated by updateCustomerMeasurements
      await updateDoc(customerRef, customerDataForDb);
      console.log(`DataService: Successfully called updateDoc for customer ${existingCustomerId}`);

      const updatedDocSnap = await getDoc(customerRef); // Re-fetch to get the latest state including server timestamps
      if (!updatedDocSnap.exists()) {
        console.error(`DataService: Customer document ${existingCustomerId} not found after update attempt.`);
        return null;
      }
      const updatedData = updatedDocSnap.data();
      console.log(`DataService: Successfully fetched updated customer data for ${existingCustomerId}`);
      return {
        id: existingCustomerId,
        name: updatedData.name || '',
        email: updatedData.email || '',
        phone: updatedData.phone || '',
        address: updatedData.address || undefined, // Will be undefined if deletedField() was used and field removed
        measurements: updatedData.measurements || undefined,
      };
    } else {
      console.log(`DataService: Attempting to add new customer`);
      customerDataForDb.createdAt = serverTimestamp();
      // New customers don't have measurements by default from this form; set explicitly if needed
      // customerDataForDb.measurements = undefined; // Or some default empty MeasurementFormValues

      const docRef = await addDoc(collection(db, CUSTOMERS_COLLECTION), customerDataForDb);
      console.log(`DataService: Successfully called addDoc, new customer ID: ${docRef.id}`);

      const newDocSnap = await getDoc(docRef);
      if (!newDocSnap.exists()) {
        console.error(`DataService: Newly created customer document ${docRef.id} not found.`);
        return null;
      }
      const savedData = newDocSnap.data();
      console.log(`DataService: Successfully fetched new customer data for ${docRef.id}`);
      return {
        id: docRef.id,
        name: savedData.name || '',
        email: savedData.email || '',
        phone: savedData.phone || '',
        address: savedData.address || undefined, // Will be undefined if not set during creation
        measurements: savedData.measurements || undefined,
      };
    }
  } catch (error) {
    console.error("DataService: Error saving customer to Firestore:", error);
    if (error instanceof Error) {
        console.error("Error name:", error.name, "Message:", error.message, "Stack:", error.stack);
    }
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
    console.log(`DataService: Successfully updated measurements for customer ${customerId}`);
    return true;
  } catch (error) {
    console.error(`DataService: Error updating measurements for customer ${customerId}:`, error);
    return false;
  }
}

export async function deleteCustomerById(customerId: string): Promise<boolean> {
  console.log(`DataService: Deleting customer from Firestore: ID ${customerId}`);
  try {
    const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
    await deleteDoc(customerRef);
    console.log(`DataService: Successfully deleted customer ${customerId}`);
    return true;
  } catch (error)
 {
    console.error("DataService: Error deleting customer from Firestore:", error);
    return false;
  }
}

// --- Order Functions (Still using mock data) ---
import { mockOrders as MOCK_ORDERS_DB } from '@/lib/mockData'; 

export async function getOrders(): Promise<Order[]> {
  console.log("DataService: Fetching orders (using mock data)");
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async
  return Promise.resolve([...MOCK_ORDERS_DB]);
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  console.log(`DataService: Fetching order by ID ${orderId} (using mock data)`);
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async
  const order = MOCK_ORDERS_DB.find(o => o.id === orderId);
  return Promise.resolve(order || null);
}

export async function saveOrder(orderData: Order, existingOrderId?: string): Promise<Order | null> {
  console.log(`DataService: Saving order ${existingOrderId || 'new'} (using mock data)`);
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async
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
    await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async
    const orderIndex = MOCK_ORDERS_DB.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        MOCK_ORDERS_DB[orderIndex].status = status;
        return Promise.resolve(true);
    }
    return Promise.resolve(false);
}

