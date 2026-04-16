
// src/lib/server/dataService.ts
'use server';

import { db } from '@/lib/firebase/config';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  addDoc, 
  serverTimestamp, 
  Timestamp, 
  query, 
  where, 
  getDoc, 
  updateDoc, 
  orderBy, 
  limit, 
  writeBatch, 
  runTransaction, 
  type DocumentData 
} from 'firebase/firestore';
import type { Tailor, Customer, Address, Order, OrderStatus, GarmentStyle, DesignDetails, TailorFormData } from '@/lib/mockData';
import { format } from 'date-fns';

const TAILORS_COLLECTION = 'tailors';
const CUSTOMERS_COLLECTION = 'customers';
const ORDERS_COLLECTION = 'orders';
const COUNTERS_COLLECTION = 'counters';
const GARMENT_STYLES_COLLECTION = 'garmentStyles';

/**
 * Strips undefined values from an object recursively.
 * Firestore does not allow undefined values in documents.
 */
function deepClean(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Preserve Firestore Timestamps and Dates
  if (obj instanceof Date || (obj && typeof obj.toDate === 'function')) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(deepClean);
  }

  return Object.keys(obj).reduce((acc: any, key: string) => {
    const value = obj[key];
    if (value !== undefined) {
      acc[key] = deepClean(value);
    }
    return acc;
  }, {});
}

const safeToISOString = (value: any): string | undefined => {
  if (!value) return undefined;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  try {
    const date = new Date(value);
    if (!isNaN(date.getTime())) return date.toISOString();
  } catch (e) {}
  return undefined;
};

const safeToFormattedDate = (value: any): string | undefined => {
    const isoString = safeToISOString(value);
    if (!isoString) return undefined;
    return format(new Date(isoString), "yyyy-MM-dd");
};

const orderFromDoc = (docSnapshot: DocumentData | undefined, id: string): Order | null => {
    if (!docSnapshot) return null;
    const data = docSnapshot;
    try {
        return {
            id: id,
            orderNumber: data.orderNumber || 0,
            date: safeToFormattedDate(data.date) || format(new Date(), "yyyy-MM-dd"),
            status: data.status || 'Pending Assignment',
            total: data.total || "Pricing TBD",
            items: Array.isArray(data.items) ? data.items : [],
            customerId: data.customerId || '',
            customerName: data.customerName || '',
            detailedItems: Array.isArray(data.detailedItems) ? data.detailedItems as DesignDetails[] : undefined,
            assignedTailorId: data.assignedTailorId || null,
            assignedTailorName: data.assignedTailorName || null,
            dueDate: safeToFormattedDate(data.dueDate),
            shippingAddress: data.shippingAddress || undefined,
            isCourier: data.isCourier || false,
            notes: data.notes || '',
            assignmentInstructions: data.assignmentInstructions || '',
            assignmentImage: data.assignmentImage || '',
            createdAt: safeToISOString(data.createdAt),
            updatedAt: safeToISOString(data.updatedAt),
        } as Order;
    } catch (e) {
        console.error(`DataService: Failed to parse order ${id}`, e);
        return null;
    }
};

const customerFromDoc = (docSnapshot: DocumentData | undefined, id: string): Customer | null => {
  if (!docSnapshot) return null;
  const data = docSnapshot;
  return {
    id: id,
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    address: data.address || undefined,
    savedMeasurements: data.savedMeasurements || {},
  } as Customer;
};

const tailorFromDoc = (docSnapshot: DocumentData | undefined, id: string): Tailor | null => {
  if (!docSnapshot) return null;
  const data = docSnapshot;
  return {
    id: id,
    name: data.name || '',
    mobile: data.mobile || '',
    expertise: Array.isArray(data.expertise) ? data.expertise : [],
    availability: data.availability || 'Available',
    avatar: data.avatar || `https://placehold.co/100x100.png?text=${(data.name || 'N/A').substring(0,2).toUpperCase()}`,
    dataAiHint: data.dataAiHint || 'person portrait',
  } as Tailor;
};

// --- Tailor Functions ---
export async function getTailors(): Promise<Tailor[]> {
  try {
    const tailorSnapshot = await getDocs(collection(db, TAILORS_COLLECTION));
    return tailorSnapshot.docs.map(docSnap => tailorFromDoc(docSnap.data(), docSnap.id)).filter(t => t !== null) as Tailor[];
  } catch (error) {
    console.error("DataService: Error fetching tailors", error);
    return [];
  }
}

export async function saveTailor(formData: TailorFormData, existingTailorId?: string): Promise<Tailor | null> {
  try {
    const expertiseArray = formData.expertise.split(',').map(e => e.trim()).filter(e => e);
    let tailorDataForDb: any = {
      name: formData.name,
      mobile: formData.mobile,
      expertise: expertiseArray,
      updatedAt: serverTimestamp()
    };
    
    if (existingTailorId) {
      const tailorRef = doc(db, TAILORS_COLLECTION, existingTailorId);
      await updateDoc(tailorRef, deepClean(tailorDataForDb));
      const updatedDocSnap = await getDoc(tailorRef);
      return tailorFromDoc(updatedDocSnap.data()!, existingTailorId);
    } else {
      tailorDataForDb.availability = 'Available';
      tailorDataForDb.avatar = `https://placehold.co/100x100.png?text=${formData.name.substring(0,2).toUpperCase()}`;
      tailorDataForDb.createdAt = serverTimestamp();
      const docRef = await addDoc(collection(db, TAILORS_COLLECTION), deepClean(tailorDataForDb));
      const newDocSnap = await getDoc(docRef);
      return tailorFromDoc(newDocSnap.data()!, docRef.id);
    }
  } catch (error) { 
    console.error("DataService: Error saving tailor", error);
    return null; 
  }
}

export async function deleteTailorById(tailorId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, TAILORS_COLLECTION, tailorId));
    return true;
  } catch (error) { return false; }
}

// --- Customer Functions ---
export async function getCustomers(): Promise<Customer[]> {
  try {
    const customerSnapshot = await getDocs(collection(db, CUSTOMERS_COLLECTION));
    return customerSnapshot.docs.map(docSnap => customerFromDoc(docSnapshot.data(), docSnap.id)).filter(c => c !== null) as Customer[];
  } catch (error) { 
    console.error("DataService: Error fetching customers", error);
    return []; 
  }
}

export async function getCustomerById(customerId: string): Promise<Customer | null> {
  try {
    const docSnap = await getDoc(doc(db, CUSTOMERS_COLLECTION, customerId));
    return docSnap.exists() ? customerFromDoc(docSnap.data(), docSnap.id) : null;
  } catch (error) { return null; }
}

export async function saveCustomer(input: any, existingCustomerId?: string): Promise<Customer | null> {
  const { name, email, phone, street, city, zipCode, country } = input;
  let customerData: any = { name, email, phone, updatedAt: serverTimestamp() };
  if (street && city) customerData.address = { street, city, zipCode, country };

  try {
    if (existingCustomerId) {
      const customerRef = doc(db, CUSTOMERS_COLLECTION, existingCustomerId);
      await updateDoc(customerRef, deepClean(customerData));
      const snap = await getDoc(customerRef);
      return customerFromDoc(snap.data()!, existingCustomerId);
    } else {
      customerData.createdAt = serverTimestamp();
      const docRef = await addDoc(collection(db, CUSTOMERS_COLLECTION), deepClean(customerData));
      const snap = await getDoc(docRef);
      return customerFromDoc(snap.data()!, docRef.id);
    }
  } catch (error) { 
    console.error("DataService: Error saving customer", error);
    return null; 
  }
}

export async function deleteCustomerById(customerId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, CUSTOMERS_COLLECTION, customerId));
    return true;
  } catch (error) { return false; }
}

export async function saveMeasurementsForCustomer(customerId: string, styleId: string, measurements: any): Promise<boolean> {
  try {
    await updateDoc(doc(db, CUSTOMERS_COLLECTION, customerId), {
      [`savedMeasurements.${styleId}`]: deepClean(measurements),
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) { return false; }
}

// --- Order Functions ---

export async function saveOrderToDb(orderData: any, existingOrderId?: string): Promise<{ success: boolean; data?: Order; error?: string }> {
  try {
    let dataToSave: any = {
      ...orderData,
      date: orderData.date ? new Date(orderData.date) : new Date(), 
      dueDate: orderData.dueDate ? new Date(orderData.dueDate) : null,
      updatedAt: serverTimestamp(),
    };

    let resultOrder: Order | null = null;
    if (existingOrderId) {
      const orderRef = doc(db, ORDERS_COLLECTION, existingOrderId);
      const cleanedData = deepClean(dataToSave);
      
      // Remove fields that should not be updated in the document body
      delete cleanedData.id;
      delete cleanedData.createdAt;

      await updateDoc(orderRef, cleanedData);
      const updatedDocSnap = await getDoc(orderRef);
      resultOrder = orderFromDoc(updatedDocSnap.data(), existingOrderId);
    } else {
      const orderCounterRef = doc(db, COUNTERS_COLLECTION, 'orderCounter');
      const newOrderNumber = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(orderCounterRef);
        const nextNumber = (counterDoc.exists() ? (counterDoc.data().currentNumber || 1000) : 1000) + 1;
        transaction.set(orderCounterRef, { currentNumber: nextNumber }, { merge: true });
        return nextNumber;
      });
      dataToSave.orderNumber = newOrderNumber;
      dataToSave.createdAt = serverTimestamp();
      const docRef = await addDoc(collection(db, ORDERS_COLLECTION), deepClean(dataToSave));
      const newDocSnap = await getDoc(docRef);
      resultOrder = orderFromDoc(newDocSnap.data(), docRef.id);
    }

    // Sync measurements back to customer profile
    if (resultOrder && dataToSave.customerId && dataToSave.detailedItems) {
      const customerRef = doc(db, CUSTOMERS_COLLECTION, dataToSave.customerId);
      const measurements: any = {};
      dataToSave.detailedItems.forEach((item: any) => {
        if (item.styleId && item.measurements) {
            measurements[item.styleId] = item.measurements;
        }
      });
      
      if (Object.keys(measurements).length > 0) {
        await setDoc(customerRef, { 
          savedMeasurements: deepClean(measurements), 
          updatedAt: serverTimestamp() 
        }, { merge: true });
      }
    }
    
    if (resultOrder) {
        return { success: true, data: resultOrder };
    }
    return { success: false, error: "Failed to retrieve saved order." };
  } catch (error: any) { 
    console.error("DataService: Firestore Save Error:", error);
    return { success: false, error: error.message || "Unknown database error." }; 
  }
}

export async function getOrdersFromDb(): Promise<Order[]> {
  try {
    const ordersQuery = query(collection(db, ORDERS_COLLECTION), orderBy("updatedAt", "desc"), limit(50));
    const snapshot = await getDocs(ordersQuery);
    return snapshot.docs.map(docSnap => orderFromDoc(docSnap.data(), docSnap.id)).filter(o => o !== null) as Order[];
  } catch (error) { 
    console.error("DataService: Error fetching orders", error);
    return []; 
  }
}

export async function getOrdersForCustomer(customerId: string): Promise<Order[]> {
  try {
    const ordersQuery = query(collection(db, ORDERS_COLLECTION), where("customerId", "==", customerId));
    const snapshot = await getDocs(ordersQuery);
    const list = snapshot.docs.map(docSnap => orderFromDoc(docSnap.data(), docSnap.id)).filter(o => o !== null) as Order[];
    list.sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA;
    });
    return list;
  } catch (error) { 
    console.error("DataService: Error fetching customer orders", error);
    return []; 
  }
}

export async function getOrderByIdFromDb(orderId: string): Promise<Order | null> {
  try {
    const docSnap = await getDoc(doc(db, ORDERS_COLLECTION, orderId));
    return docSnap.exists() ? orderFromDoc(docSnap.data(), orderId) : null;
  } catch (error) { return null; }
}

export async function updateOrderStatusInDb(orderId: string, status: OrderStatus): Promise<boolean> {
  try {
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), { status, updatedAt: serverTimestamp() });
    return true;
  } catch (error) { return false; }
}

export async function updateOrderPriceInDb(orderId: string, newPrice: string): Promise<boolean> {
  try {
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), { total: newPrice, updatedAt: serverTimestamp() });
    return true;
  } catch (error) { return false; }
}

export async function assignTailorToOrderInDb(orderId: string, details: any): Promise<boolean> {
  try {
    const batch = writeBatch(db);
    batch.update(doc(db, ORDERS_COLLECTION, orderId), deepClean({
      status: 'Assigned',
      assignedTailorId: details.tailorId,
      assignedTailorName: details.tailorName,
      dueDate: format(details.dueDate, "yyyy-MM-dd"),
      assignmentInstructions: details.instructions || '',
      assignmentImage: details.imageDataUrl || '',
      updatedAt: serverTimestamp(),
    }));
    batch.update(doc(db, TAILORS_COLLECTION, details.tailorId), { availability: 'Busy', updatedAt: serverTimestamp() });
    await batch.commit();
    return true;
  } catch (error) { 
    console.error("DataService: Error assigning tailor", error);
    return false; 
  }
}

// --- Garment Style Functions ---

export async function getGarmentStyles(): Promise<GarmentStyle[]> {
  try {
    const styleSnapshot = await getDocs(query(collection(db, GARMENT_STYLES_COLLECTION), orderBy("name")));
    return styleSnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return { id: docSnap.id, name: data.name || '', requiredMeasurements: data.requiredMeasurements || [] } as GarmentStyle;
    });
  } catch (error) { return []; }
}

export async function saveGarmentStyle(data: any, existingStyleId?: string): Promise<GarmentStyle | null> {
  try {
    const dataToSave = { ...data, updatedAt: serverTimestamp() };
    if (existingStyleId) {
      await updateDoc(doc(db, GARMENT_STYLES_COLLECTION, existingStyleId), deepClean(dataToSave));
      const snap = await getDoc(doc(db, GARMENT_STYLES_COLLECTION, existingStyleId));
      return { id: snap.id, ...snap.data() } as GarmentStyle;
    } else {
      const docRef = await addDoc(collection(db, GARMENT_STYLES_COLLECTION), deepClean({ ...dataToSave, createdAt: serverTimestamp() }));
      const snap = await getDoc(docRef);
      return { id: snap.id, ...snap.data() } as GarmentStyle;
    }
  } catch (error) { 
    console.error("DataService: Error saving garment style", error);
    return null; 
  }
}

export async function deleteGarmentStyle(styleId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, GARMENT_STYLES_COLLECTION, styleId));
    return true;
  } catch (error) { return false; }
}
