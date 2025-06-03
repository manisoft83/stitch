// src/lib/server/dataService.ts
'use server'; // Mark as server-only module

import type { Tailor, TailorFormData } from '@/lib/mockData'; // Reuse existing type

// Simulating the original mock data for now
// This data would eventually come from your stitch.db
const MOCK_TAILORS_DB: Tailor[] = [
  { id: "T001", name: "Alice Wonderland", mobile: "555-0101", expertise: ["Dresses", "Evening Wear"], availability: "Available", avatar: "https://placehold.co/100x100.png?text=AW", dataAiHint: "woman portrait" },
  { id: "T002", name: "Bob The Builder", mobile: "555-0102", expertise: ["Suits", "Formal Trousers"], availability: "Busy", avatar: "https://placehold.co/100x100.png?text=BB", dataAiHint: "man portrait" },
  { id: "T003", name: "Carol Danvers", mobile: "555-0103", expertise: ["Casual Wear", "Alterations"], availability: "Available", avatar: "https://placehold.co/100x100.png?text=CD", dataAiHint: "woman professional" },
];

export async function getTailors(): Promise<Tailor[]> {
  // TODO: Replace this with actual SQLite database query to 'stitch.db'
  // Example (conceptual, actual SQLite library usage will vary):
  //
  // import Database from 'better-sqlite3';
  // const db = new Database('stitch.db', { verbose: console.log });
  // try {
  //   const stmt = db.prepare('SELECT id, name, mobile, expertise, availability, avatar, dataAiHint FROM tailors');
  //   const rows = stmt.all() as any[];
  //   const tailors = rows.map(row => ({
  //     ...row,
  //     expertise: JSON.parse(row.expertise || '[]') // Assuming expertise is stored as JSON string
  //   }));
  //   return tailors;
  // } finally {
  //   db.close();
  // }

  console.log("DataService: Fetching tailors (using MOCK_TAILORS_DB implementation)");
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 20)); // Simulate network latency
  return Promise.resolve([...MOCK_TAILORS_DB]); // Return a copy to prevent direct mutation
}

export async function saveTailor(data: TailorFormData, existingTailorId?: string): Promise<Tailor | null> {
    // TODO: Replace with actual SQLite INSERT or UPDATE logic for 'stitch.db'
    console.log(`DataService: Attempting to save tailor (mock): ${existingTailorId ? 'Update ID ' + existingTailorId : 'New'}`, data);
    await new Promise(resolve => setTimeout(resolve, 20));

    const expertiseArray = data.expertise.split(',').map(e => e.trim()).filter(e => e);

    if (existingTailorId) {
        const index = MOCK_TAILORS_DB.findIndex(t => t.id === existingTailorId);
        if (index !== -1) {
            MOCK_TAILORS_DB[index] = { ...MOCK_TAILORS_DB[index], ...data, expertise: expertiseArray };
            return { ...MOCK_TAILORS_DB[index] };
        }
        return null; // Not found
    } else {
        const newTailor: Tailor = {
            id: `T${Date.now().toString().slice(-3)}${Math.floor(Math.random()*100)}`,
            ...data,
            expertise: expertiseArray,
            availability: "Available",
            avatar: `https://placehold.co/100x100.png?text=${data.name.substring(0,2).toUpperCase()}`,
            dataAiHint: "person portrait"
        };
        MOCK_TAILORS_DB.push(newTailor);
        return { ...newTailor };
    }
}

export async function deleteTailorById(tailorId: string): Promise<boolean> {
    // TODO: Replace with actual SQLite DELETE logic for 'stitch.db'
    console.log(`DataService: Attempting to delete tailor (mock): ID ${tailorId}`);
    await new Promise(resolve => setTimeout(resolve, 20));
    
    const index = MOCK_TAILORS_DB.findIndex(t => t.id === tailorId);
    if (index !== -1) {
        MOCK_TAILORS_DB.splice(index, 1);
        return true; // Successfully deleted
    }
    return false; // Not found or failed to delete
}
