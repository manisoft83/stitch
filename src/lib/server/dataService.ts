
// src/lib/server/dataService.ts
'use server';

import { db } from '@/lib/firebase/config';
import { collection, doc, getDocs, setDoc, deleteDoc, addDoc, serverTimestamp, Timestamp, query, where, getDoc, updateDoc, FieldValue, deleteField, orderBy, limit, writeBatch, runTransaction, type DocumentData } from 'firebase/firestore';
import type { TailorFormData } from '@/lib/mockData'; 
import type { Tailor, Customer, Address, Order, OrderStatus, GarmentStyle, DesignDetails } from '@/lib/mockData';
import { format } from 'date-fns';

const TAILORS_COLLECTION = 'tailors';
const CUSTOMERS_COLLECTION = 'customers';
const ORDERS_COLLECTION = 'orders';
const COUNTERS_COLLECTION = 'counters';
const GARMENT_STYLES_COLLECTION = 'garmentStyles';

const safeToISOString = (value: any): string | undefined => {
  if (!value) return undefined;
  if (value instanceof Timestamp) return value.toDate().toISOString();
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

const orderFromDoc = (docSnapshot: DocumentData, id: string): Order | null => {
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

// --- Tailor Functions ---
export async function getTailors(): Promise<Tailor[]> {
  try {
    const tailorSnapshot = await getDocs(collection(db, TAILORS_COLLECTION));
    return tailorSnapshot.docs.map(docSnap => {
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
  } catch (error) {
    return [];
  }
}

export async function saveTailor(formData: TailorFormData, existingTailorId?: string): Promise<Tailor | null> {
  try {
    const expertiseArray = formData.expertise.split(',').map(e => e.trim()).filter(e => e);
    const tailorDataForDb: any = {
      name: formData.name,
      mobile: formData.mobile,
      expertise: expertiseArray,
      updatedAt: serverTimestamp()
    };
    if (existingTailorId) {
      const tailorRef = doc(db, TAILORS_COLLECTION, existingTailorId);
      await updateDoc(tailorRef, tailorDataForDb);
      const updatedDocSnap = await getDoc(tailorRef);
      const updatedData = updatedDocSnap.data()!;
      return { id: existingTailorId, ...updatedData } as Tailor;
    } else {
      tailorDataForDb.availability = 'Available';
      tailorDataForDb.avatar = `https://placehold.co/100x100.png?text=${formData.name.substring(0,2).toUpperCase()}`;
      tailorDataForDb.createdAt = serverTimestamp();
      const docRef = await addDoc(collection(db, TAILORS_COLLECTION), tailorDataForDb);
      const newDocSnap = await getDoc(docRef);
      return { id: docRef.id, ...newDocSnap.data() } as Tailor;
    }
  } catch (error) { return null; }
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
    return customerSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Customer));
  } catch (error) { return []; }
}

export async function getCustomerById(customerId: string): Promise<Customer | null> {
  try {
    const docSnap = await getDoc(doc(db, CUSTOMERS_COLLECTION, customerId));
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Customer) : null;
  } catch (error) { return null; }
}

export async function saveCustomer(input: any, existingCustomerId?: string): Promise<Customer | null> {
  const { name, email, phone, street, city, zipCode, country } = input;
  const customerData: any = { name, email, phone, updatedAt: serverTimestamp() };
  if (street && city) customerData.address = { street, city, zipCode, country };

  try {
    if (existingCustomerId) {
      const customerRef = doc(db, CUSTOMERS_COLLECTION, existingCustomerId);
      await updateDoc(customerRef, customerData);
      const snap = await getDoc(customerRef);
      return { id: existingCustomerId, ...snap.data() } as Customer;
    } else {
      customerData.createdAt = serverTimestamp();
      const docRef = await addDoc(collection(db, CUSTOMERS_COLLECTION), customerData);
      const snap = await getDoc(docRef);
      return { id: docRef.id, ...snap.data() } as Customer;
    }
  } catch (error) { return null; }
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
      [`savedMeasurements.${styleId}`]: measurements,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) { return false; }
}

// --- Order Functions ---

export async function saveOrderToDb(orderData: any, existingOrderId?: string): Promise<Order | null> {
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
      const updatedDocSnap = await getDoc(orderRef);
      savedOrder = orderFromDoc(updatedDocSnap.data(), existingOrderId);
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
      const docRef = await addDoc(collection(db, ORDERS_COLLECTION), dataToSave);
      const newDocSnap = await getDoc(docRef);
      savedOrder = orderFromDoc(newDocSnap.data(), docRef.id);
    }

    if (savedOrder && dataToSave.customerId && dataToSave.detailedItems) {
      const customerRef = doc(db, CUSTOMERS_COLLECTION, dataToSave.customerId);
      const measurements: any = {};
      dataToSave.detailedItems.forEach((item: any) => {
        if (item.styleId && item.measurements) measurements[item.styleId] = item.measurements;
      });
      if (Object.keys(measurements).length > 0) {
        setDoc(customerRef, { savedMeasurements: measurements, updatedAt: serverTimestamp() }, { merge: true });
      }
    }
    return savedOrder;
  } catch (error) { return null; }
}

export async function getOrdersFromDb(): Promise<Order[]> {
  try {
    const ordersQuery = query(collection(db, ORDERS_COLLECTION), orderBy("updatedAt", "desc"), limit(50));
    const snapshot = await getDocs(ordersQuery);
    return snapshot.docs.map(docSnap => orderFromDoc(docSnap.data(), docSnap.id)).filter(o => o !== null) as Order[];
  } catch (error) { return []; }
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
  } catch (error) { return []; }
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
  const batch = writeBatch(db);
  batch.update(doc(db, ORDERS_COLLECTION, orderId), {
    status: 'Assigned',
    assignedTailorId: details.tailorId,
    assignedTailorName: details.tailorName,
    dueDate: format(details.dueDate, "yyyy-MM-dd"),
    assignmentInstructions: details.instructions || '',
    assignmentImage: details.imageDataUrl || '',
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(db, TAILORS_COLLECTION, details.tailorId), { availability: 'Busy', updatedAt: serverTimestamp() });
  try {
    await batch.commit();
    return true;
  } catch (error) { return false; }
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
      await updateDoc(doc(db, GARMENT_STYLES_COLLECTION, existingStyleId), dataToSave);
      const snap = await getDoc(doc(db, GARMENT_STYLES_COLLECTION, existingStyleId));
      return { id: snap.id, ...snap.data() } as GarmentStyle;
    } else {
      const docRef = await addDoc(collection(db, GARMENT_STYLES_COLLECTION), { ...dataToSave, createdAt: serverTimestamp() });
      const snap = await getDoc(docRef);
      return { id: snap.id, ...snap.data() } as GarmentStyle;
    }
  } catch (error) { return null; }
}

export async function deleteGarmentStyle(styleId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, GARMENT_STYLES_COLLECTION, styleId));
    return true;
  } catch (error) { return false; }
}
