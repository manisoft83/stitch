
// src/lib/server/dataService.ts
'use server';

import { db } from '@/lib/firebase/config';
import { collection, doc, getDocs, setDoc, deleteDoc, addDoc, serverTimestamp, Timestamp, query, where, getDoc } from 'firebase/firestore';
import type { TailorFormData } from '@/lib/mockData'; // Use TailorFormData from mockData for consistency if needed by TailorFormDialog
import type { Tailor } from '@/lib/mockData'; // Re-import Tailor from mockData if it's the canonical type source

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
    
    const tailorDataToSave = { // Renamed to avoid conflict with Tailor type if imported
      name: formData.name,
      mobile: formData.mobile,
      expertise: expertiseArray,
      updatedAt: serverTimestamp() 
    };

    if (existingTailorId) {
      const tailorRef = doc(db, TAILORS_COLLECTION, existingTailorId);
      await setDoc(tailorRef, tailorDataToSave, { merge: true });
      
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
      const newTailorPayload = {
        ...tailorDataToSave,
        availability: 'Available',
        avatar: `https://placehold.co/100x100.png?text=${formData.name.substring(0,2).toUpperCase()}`,
        dataAiHint: "person portrait",
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, TAILORS_COLLECTION), newTailorPayload);
      // Firestore returns a DocumentReference. To get the full object, we need the ID and data.
      // The newTailorPayload is client-side, createdAt and updatedAt would be Timestamps.
      // For returning a Tailor object, we'd ideally fetch it or trust the payload shape.
      return {
        id: docRef.id,
        name: newTailorPayload.name,
        mobile: newTailorPayload.mobile,
        expertise: newTailorPayload.expertise,
        availability: newTailorPayload.availability,
        avatar: newTailorPayload.avatar,
        dataAiHint: newTailorPayload.dataAiHint,
      } as Tailor; // Cast assumes client-side Timestamps are not expected by Tailor type here.
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

// Removed mock data definitions for customers and orders from this file.
// They are now solely in src/lib/mockData.ts
