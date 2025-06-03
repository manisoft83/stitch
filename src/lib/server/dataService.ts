
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
        // Timestamps are not part of the Tailor type, so not mapped here
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
      await updateDoc(tailorRef, tailorDataForDb); // Use updateDoc for existing, setDoc with merge for create/update
      console.log(`DataService: Successfully called updateDoc for tailor ${existingTailorId}`);
      
      const updatedDocSnap = await getDoc(tailorRef);
      if (!updatedDocSnap.exists()) {
        console.error(`DataService: Tailor document ${existingTailorId} not found after update attempt.`);
        return null;
      }
      const updatedData = updatedDocSnap.data();
      if (!updatedData) {
        console.error(`DataService: No data in tailor document ${existingTailorId} after update.`);
         return null;
      }
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
      if (!savedData) {
        console.error(`DataService: No data in newly created tailor document ${docRef.id}.`);
        return null;
      }
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
  console.log(`DataService: Saving customer to Firestore. Input: ${JSON.stringify(customerFormInput)}, ExistingID: ${existingCustomerId}`);
  try {
    const address: Address | undefined = (customerFormInput.street && customerFormInput.city && customerFormInput.zipCode && customerFormInput.country)
      ? { street: customerFormInput.street, city: customerFormInput.city, zipCode: customerFormInput.zipCode, country: customerFormInput.country }
      : undefined;

    const customerDataForDb: { name: string; email: string; phone: string; address?: Address; updatedAt: FieldValue; measurements?: MeasurementFormValues, createdAt?: FieldValue } = {
      name: customerFormInput.name,
      email: customerFormInput.email,
      phone: customerFormInput.phone,
      updatedAt: serverTimestamp(),
    };
    
    if (address) {
      customerDataForDb.address = address;
    } else {
      // If address is undefined, and we are updating, we might want to remove the field
      if (existingCustomerId) {
        // To remove a field, you use deleteField().
        // customerDataForDb.address = deleteField() as unknown as undefined; // Casting because type expects Address | undefined
        // For now, if address is not provided, it will just not be part of the update for that field.
        // If it was present and now it's not, it will remain unless explicitly deleted.
        // Let's assume for now that if no address is given on update, we don't change it unless it's an empty string scenario meaning clear.
        // The current logic implicitly sets customerDataForDb.address = undefined if address is not formed.
        // This is fine for addDoc. For updateDoc, it means 'address' won't be in the update payload unless it's a defined object.
        // This means existing address won't be cleared if no new address details are passed. This is probably desired.
        customerDataForDb.address = address; // This will be undefined if no address details
      }
    }

    if (existingCustomerId) {
      console.log(`DataService: Attempting to update customer ${existingCustomerId}`);
      const customerRef = doc(db, CUSTOMERS_COLLECTION, existingCustomerId);
      
      const docToUpdateSnap = await getDoc(customerRef);
      if (!docToUpdateSnap.exists()) {
          console.error(`DataService: Customer document ${existingCustomerId} does not exist. Cannot update.`);
          return null;
      }
      
      // For updates, we don't want to overwrite measurements unless they are explicitly part of this save operation (which they are not here)
      // So, customerDataForDb should not include 'measurements' field when updating general customer info.
      // 'measurements' are handled by updateCustomerMeasurements.
      // The definition of customerDataForDb already omits measurements for update, which is correct.

      await updateDoc(customerRef, customerDataForDb);
      console.log(`DataService: Successfully called updateDoc for customer ${existingCustomerId}`);

      const updatedDocSnap = await getDoc(customerRef);
      if (!updatedDocSnap.exists()) {
        console.error(`DataService: Customer document ${existingCustomerId} not found after update attempt.`);
        return null;
      }
      const updatedData = updatedDocSnap.data();
      if (!updatedData) {
        console.error(`DataService: No data in customer document ${existingCustomerId} after update.`);
         return null;
      }
      console.log(`DataService: Successfully fetched updated customer data for ${existingCustomerId}`);
      return {
        id: existingCustomerId,
        name: updatedData.name || '',
        email: updatedData.email || '',
        phone: updatedData.phone || '',
        address: updatedData.address || undefined,
        measurements: updatedData.measurements || undefined,
      };
    } else {
      console.log(`DataService: Attempting to add new customer`);
      customerDataForDb.createdAt = serverTimestamp();
      // New customers don't have measurements by default from this form.
      customerDataForDb.measurements = undefined; 

      const docRef = await addDoc(collection(db, CUSTOMERS_COLLECTION), customerDataForDb);
      console.log(`DataService: Successfully called addDoc, new customer ID: ${docRef.id}`);

      const newDocSnap = await getDoc(docRef);
      if (!newDocSnap.exists()) {
        console.error(`DataService: Newly created customer document ${docRef.id} not found.`);
        return null;
      }
      const savedData = newDocSnap.data();
      if (!savedData) {
        console.error(`DataService: No data in newly created customer document ${docRef.id}.`);
        return null;
      }
      console.log(`DataService: Successfully fetched new customer data for ${docRef.id}`);
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
    console.error("DataService: Error saving customer to Firestore:", error);
    if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
    }
    return null;
  }
}


export async function updateCustomerMeasurements(customerId: string, measurements: MeasurementFormValues): Promise<boolean> {
  console.log(`DataService: Updating measurements for customer ID ${customerId}`, measurements);
  try {
    const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
    await updateDoc(customerRef, {
      measurements: measurements, // measurements should be an object
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
// For orders, we'll keep using the mock data logic for now as it's more complex.
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
