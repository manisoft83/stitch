
// src/lib/server/dataService.ts
'use server';

import { db } from '@/lib/firebase/config';
import { collection, doc, getDocs, setDoc, deleteDoc, addDoc, serverTimestamp, Timestamp, query, where, getDoc, updateDoc, FieldValue, deleteField, orderBy, limit, writeBatch, runTransaction } from 'firebase/firestore';
import type { TailorFormData } from '@/lib/mockData'; // Using TailorFormData specifically for the form
import type { Tailor, Customer, Address, Order, OrderStatus, GarmentStyle, DesignDetails } from '@/lib/mockData';
import { format } from 'date-fns';


const TAILORS_COLLECTION = 'tailors';
const CUSTOMERS_COLLECTION = 'customers';
const ORDERS_COLLECTION = 'orders';
const GARMENT_STYLES_COLLECTION = 'garmentStyles';
const COUNTERS_COLLECTION = 'counters';

// --- Timestamp Converters ---
const fromFirestoreTimestamp = (timestamp: Timestamp | undefined | null): string | undefined => {
  return timestamp ? timestamp.toDate().toISOString() : undefined;
};

const orderFromDoc = (docSnapshot: ReturnType<typeof doc.data>, id: string): Order | null => {
    if (!docSnapshot) return null;
    const data = docSnapshot;

    let formattedDate: string;
    if (data.date) {
        if (data.date instanceof Timestamp) {
            formattedDate = format(data.date.toDate(), "yyyy-MM-dd");
        } else {
            // It's not a timestamp, could be a string. Let's try to parse it.
            try {
                // We'll re-format it to a consistent "yyyy-MM-dd" to ensure parseISO works on client
                formattedDate = format(new Date(data.date), "yyyy-MM-dd");
            } catch (e) {
                // If parsing fails, fallback to today's date
                console.warn(`Could not parse date "${data.date}" for order ${id}. Falling back to today.`);
                formattedDate = format(new Date(), "yyyy-MM-dd");
            }
        }
    } else {
        formattedDate = format(new Date(), "yyyy-MM-dd");
    }

    let formattedDueDate: string | null = null;
    if (data.dueDate) {
         if (data.dueDate instanceof Timestamp) {
            formattedDueDate = format(data.dueDate.toDate(), "yyyy-MM-dd");
        } else {
            try {
                formattedDueDate = format(new Date(data.dueDate), "yyyy-MM-dd");
            } catch (e) {
                console.warn(`Could not parse due date "${data.dueDate}" for order ${id}.`);
                formattedDueDate = null;
            }
        }
    }

    return {
        id: id,
        orderNumber: data.orderNumber || 0,
        date: formattedDate,
        status: data.status || 'Pending Assignment',
        total: data.total || "Pricing TBD",
        items: Array.isArray(data.items) ? data.items : [],
        customerId: data.customerId || '',
        customerName: data.customerName || '',
        detailedItems: Array.isArray(data.detailedItems) ? data.detailedItems as DesignDetails[] : undefined,
        assignedTailorId: data.assignedTailorId || null,
        assignedTailorName: data.assignedTailorName || null,
        dueDate: formattedDueDate,
        shippingAddress: data.shippingAddress || undefined,
        notes: data.notes || '',
        assignmentInstructions: data.assignmentInstructions || '',
        assignmentImage: data.assignmentImage || '',
        createdAt: data.createdAt ? fromFirestoreTimestamp(data.createdAt as Timestamp) : undefined,
        updatedAt: data.updatedAt ? fromFirestoreTimestamp(data.updatedAt as Timestamp) : undefined,
    } as Order;
};


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
        savedMeasurements: data.savedMeasurements || undefined,
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
        savedMeasurements: data.savedMeasurements || undefined,
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
      address?: Address | FieldValue;
  } = {
      name,
      email,
      phone,
      updatedAt: serverTimestamp(),
  };

  const allAddressFieldsPresentAndNonEmpty = street && city && zipCode && country;
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

  try {
    if (existingCustomerId) {
      console.log(`DataService: Attempting to update customer ${existingCustomerId}`);
      const customerRef = doc(db, CUSTOMERS_COLLECTION, existingCustomerId);

      const docToUpdateSnap = await getDoc(customerRef);
      if (!docToUpdateSnap.exists()) {
          console.error(`DataService: Customer document ${existingCustomerId} does not exist. Cannot update.`);
          return null;
      }
      await updateDoc(customerRef, customerDataForDb);
      console.log(`DataService: Successfully called updateDoc for customer ${existingCustomerId}`);

      const updatedDocSnap = await getDoc(customerRef);
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
        address: updatedData.address || undefined,
        savedMeasurements: updatedData.savedMeasurements || undefined,
      };
    } else {
      console.log(`DataService: Attempting to add new customer`);
      customerDataForDb.createdAt = serverTimestamp();

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
        address: savedData.address || undefined,
        savedMeasurements: savedData.savedMeasurements || undefined,
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

export async function saveMeasurementsForCustomer(customerId: string, styleId: string, measurements: { [key: string]: string | number }): Promise<boolean> {
  console.log(`DataService: Saving measurements for customer ${customerId}, style ${styleId}`);
  try {
    const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
    // Use dot notation to update a specific field within the 'savedMeasurements' map.
    const updatePath = `savedMeasurements.${styleId}`;
    await updateDoc(customerRef, {
      [updatePath]: measurements,
      updatedAt: serverTimestamp(),
    });
    console.log(`DataService: Successfully updated measurements for customer ${customerId}.`);
    return true;
  } catch (error) {
    console.error("DataService: Error saving customer measurements:", error);
    return false;
  }
}

// --- Order Functions ---

export async function saveOrderToDb(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'orderNumber'>, existingOrderId?: string): Promise<Order | null> {
  console.log(`DataService: Saving order to Firestore. Order ID: ${existingOrderId || 'NEW'}, Item count: ${orderData.items.length}`);

  // Storing dates as native Date objects so Firestore converts them to Timestamps for reliable sorting.
  const dataToSave: any = {
    ...orderData,
    date: orderData.date ? new Date(orderData.date) : new Date(), 
    dueDate: orderData.dueDate ? new Date(orderData.dueDate) : null,
    updatedAt: serverTimestamp(),
  };

  try {
    let savedOrder: Order | null = null;
    if (existingOrderId) {
      const orderRef = doc(db, ORDERS_COLLECTION, existingOrderId);
      await updateDoc(orderRef, dataToSave);
      console.log(`DataService: Successfully updated order ${existingOrderId}`);
      const updatedDocSnap = await getDoc(orderRef);
      savedOrder = orderFromDoc(updatedDocSnap.data(), existingOrderId);
    } else {
      // New order: generate incremental orderNumber
      const orderCounterRef = doc(db, COUNTERS_COLLECTION, 'orderCounter');
      
      const newOrderNumber = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(orderCounterRef);
        let nextNumber;
        if (!counterDoc.exists()) {
          nextNumber = 1001; // Start from 1001
        } else {
          nextNumber = (counterDoc.data().currentNumber || 1000) + 1;
        }
        transaction.set(orderCounterRef, { currentNumber: nextNumber }, { merge: true });
        return nextNumber;
      });

      console.log(`DataService: Generated new order number: ${newOrderNumber}`);

      dataToSave.orderNumber = newOrderNumber;
      dataToSave.createdAt = serverTimestamp();

      const docRef = await addDoc(collection(db, ORDERS_COLLECTION), dataToSave);
      console.log(`DataService: Successfully created new order with ID ${docRef.id}`);
      const newDocSnap = await getDoc(docRef);
      savedOrder = orderFromDoc(newDocSnap.data(), docRef.id);
    }

    // After order is saved, update customer's saved measurements
    if (savedOrder && dataToSave.customerId && dataToSave.detailedItems) {
      const customerRef = doc(db, CUSTOMERS_COLLECTION, dataToSave.customerId);
      
      const customerUpdates: { savedMeasurements: { [styleId: string]: any }, updatedAt: FieldValue } = {
        savedMeasurements: {},
        updatedAt: serverTimestamp(),
      };

      dataToSave.detailedItems.forEach((item: DesignDetails) => {
        if (item.styleId && item.measurements && Object.keys(item.measurements).length > 0) {
          const hasValues = Object.values(item.measurements).some(v => v !== '' && v !== null && v !== undefined);
          if (hasValues) {
            customerUpdates.savedMeasurements[item.styleId] = item.measurements;
          }
        }
      });
      
      if (Object.keys(customerUpdates.savedMeasurements).length > 0) {
        console.log(`DataService: Updating customer ${dataToSave.customerId} with new saved measurements.`);
        // Use setDoc with merge: true to safely create or update the nested map.
        // This is a non-critical background update. If it fails, the order is still saved.
        setDoc(customerRef, customerUpdates, { merge: true }).catch(err => {
            console.error(`DataService: Failed to save measurements to customer profile:`, err);
        });
      }
    }

    return savedOrder;

  } catch (error) {
    console.error(`DataService: Error saving order ${existingOrderId || 'NEW'} to Firestore:`, error);
    return null;
  }
}


export async function getOrdersFromDb(limitCount: number = 50): Promise<Order[]> {
  console.log("DataService: Fetching orders from Firestore");
  try {
    // Sort by 'updatedAt' to show the most recently modified orders first.
    const ordersQuery = query(collection(db, ORDERS_COLLECTION), orderBy("updatedAt", "desc"), limit(limitCount));
    const orderSnapshot = await getDocs(ordersQuery);
    const ordersList = orderSnapshot.docs.map(docSnap => orderFromDoc(docSnap.data(), docSnap.id) as Order).filter(o => o !== null);
    console.log(`DataService: Successfully fetched ${ordersList.length} orders.`);
    return ordersList;
  } catch (error) {
    console.error("DataService: Error fetching orders from Firestore:", error);
    return [];
  }
}

export async function getOrdersForCustomer(customerId: string): Promise<Order[]> {
  console.log(`DataService: Fetching orders for customer ID ${customerId}`);
  try {
    const ordersQuery = query(
      collection(db, ORDERS_COLLECTION),
      where("customerId", "==", customerId),
      // Sort by 'updatedAt' to ensure all orders, new or edited, are included and sorted correctly.
      orderBy("updatedAt", "desc")
    );
    const orderSnapshot = await getDocs(ordersQuery);
    const ordersList = orderSnapshot.docs.map(docSnap => orderFromDoc(docSnap.data(), docSnap.id) as Order).filter(o => o !== null);
    console.log(`DataService: Successfully fetched ${ordersList.length} orders for customer ${customerId}.`);
    return ordersList;
  } catch (error) {
    console.error(`DataService: Error fetching orders for customer ${customerId}:`, error);
    return [];
  }
}

export async function getOrderByIdFromDb(orderId: string): Promise<Order | null> {
  console.log(`DataService: Fetching order by ID ${orderId} from Firestore`);
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const docSnap = await getDoc(orderRef);
    if (docSnap.exists()) {
      console.log(`DataService: Successfully fetched order ${orderId}.`);
      return orderFromDoc(docSnap.data(), orderId);
    } else {
      console.log(`DataService: Order with ID ${orderId} not found.`);
      return null;
    }
  } catch (error) {
    console.error(`DataService: Error fetching order ${orderId} from Firestore:`, error);
    return null;
  }
}

export async function updateOrderStatusInDb(orderId: string, status: OrderStatus): Promise<boolean> {
  console.log(`DataService: Updating status for order ID ${orderId} to ${status}`);
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, {
      status: status,
      updatedAt: serverTimestamp(),
    });
    console.log(`DataService: Successfully updated status for order ${orderId}`);
    return true;
  } catch (error) {
    console.error(`DataService: Error updating status for order ${orderId}:`, error);
    return false;
  }
}

export async function updateOrderPriceInDb(orderId: string, newPrice: string): Promise<boolean> {
  console.log(`DataService: Updating price for order ID ${orderId} to ${newPrice}`);
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, {
      total: newPrice,
      updatedAt: serverTimestamp(),
    });
    console.log(`DataService: Successfully updated price for order ${orderId}`);
    return true;
  } catch (error) {
    console.error(`DataService: Error updating price for order ${orderId}:`, error);
    return false;
  }
}

export interface AssignmentDetails {
  tailorId: string;
  tailorName: string;
  dueDate: Date;
  instructions?: string;
  imageDataUrl?: string;
}

export async function assignTailorToOrderInDb(orderId: string, details: AssignmentDetails): Promise<boolean> {
  console.log(`DataService: Assigning tailor ${details.tailorId} to order ${orderId}`);
  const batch = writeBatch(db);

  // 1. Update the order
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  batch.update(orderRef, {
    status: 'Assigned',
    assignedTailorId: details.tailorId,
    assignedTailorName: details.tailorName,
    dueDate: format(details.dueDate, "yyyy-MM-dd"),
    assignmentInstructions: details.instructions || '',
    assignmentImage: details.imageDataUrl || '',
    updatedAt: serverTimestamp(),
  });

  // 2. Update the tailor's availability
  const tailorRef = doc(db, TAILORS_COLLECTION, details.tailorId);
  batch.update(tailorRef, {
    availability: 'Busy',
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
    console.log(`DataService: Successfully committed batch write for order assignment.`);
    return true;
  } catch (error) {
    console.error(`DataService: Error assigning tailor to order:`, error);
    return false;
  }
}

// --- Garment Style Functions ---

export async function getGarmentStyles(): Promise<GarmentStyle[]> {
  console.log("DataService: Fetching garment styles from Firestore");
  try {
    const stylesCollection = collection(db, GARMENT_STYLES_COLLECTION);
    const styleSnapshot = await getDocs(query(stylesCollection, orderBy("name")));
    const stylesList = styleSnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || '',
        requiredMeasurements: data.requiredMeasurements || [],
      } as GarmentStyle;
    });
    console.log(`DataService: Successfully fetched ${stylesList.length} garment styles.`);
    return stylesList;
  } catch (error) {
    console.error("DataService: Error fetching garment styles:", error);
    return [];
  }
}

export async function saveGarmentStyle(
  data: { name: string; requiredMeasurements: string[] },
  existingStyleId?: string
): Promise<GarmentStyle | null> {
  console.log(`DataService: Saving garment style. StyleID: ${existingStyleId}`);
  const dataToSave = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  try {
    if (existingStyleId) {
      const styleRef = doc(db, GARMENT_STYLES_COLLECTION, existingStyleId);
      await updateDoc(styleRef, dataToSave);
      const updatedDoc = await getDoc(styleRef);
      return { id: updatedDoc.id, name: updatedDoc.data()?.name, requiredMeasurements: updatedDoc.data()?.requiredMeasurements } as GarmentStyle;
    } else {
      const docRef = await addDoc(collection(db, GARMENT_STYLES_COLLECTION), {
        ...dataToSave,
        createdAt: serverTimestamp(),
      });
      const newDoc = await getDoc(docRef);
      return { id: newDoc.id, name: newDoc.data()?.name, requiredMeasurements: newDoc.data()?.requiredMeasurements } as GarmentStyle;
    }
  } catch (error) {
    console.error(`DataService: Error saving garment style:`, error);
    return null;
  }
}

export async function deleteGarmentStyle(styleId: string): Promise<boolean> {
  console.log(`DataService: Deleting garment style ${styleId}`);
  try {
    await deleteDoc(doc(db, GARMENT_STYLES_COLLECTION, styleId));
    return true;
  } catch (error) {
    console.error(`DataService: Error deleting garment style:`, error);
    return false;
  }
}
