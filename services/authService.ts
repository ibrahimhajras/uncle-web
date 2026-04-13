
import { signInAnonymously } from 'firebase/auth';
import { UserProfile } from '../types';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

// Ensure the SDK has a valid auth token (anonymous) before any Firestore operation.
// This gives request.auth a non-null value so security rules can evaluate correctly.
const ensureAuth = async (): Promise<void> => {
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
};

export const authService = {
  // Helper to normalize phone numbers or emails
  sanitizeIdentifier: (id: string): string => {
    if (!id) return '';
    if (id.includes('@')) return id.toLowerCase().trim();
    // For phone numbers: remove all whitespace and ensure only digits and plus sign remain
    return id.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  },

  // Check if a user exists by phone
  checkPhoneExists: async (phone: string): Promise<boolean> => {
    const cleanPhone = authService.sanitizeIdentifier(phone);
    if (!cleanPhone) return false;
    try {
      await ensureAuth();
      const docRef = doc(db, "users", cleanPhone);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (e) {
      console.error("Check user exists failed", e);
      return false;
    }
  },

  // Save a new user
  register: async (user: UserProfile): Promise<UserProfile> => {
    const cleanPhone = authService.sanitizeIdentifier(user.phone);
    const userToSave = { ...user, id: cleanPhone, phone: cleanPhone };
    
    try {
      await ensureAuth();
      await setDoc(doc(db, "users", cleanPhone), userToSave);
      return userToSave;
    } catch (e: any) {
      console.error("Registration to DB failed:", {
          message: e?.message,
          code: e?.code,
          identifier: cleanPhone
      });
      throw new Error("فشل حفظ البيانات في قاعدة البيانات. يرجى المحاولة مرة أخرى.");
    }
  },

  // Find user by phone (or admin email) and password
  login: async (identifier: string, password: string): Promise<UserProfile | null> => {
    // Admin Check
    if (identifier === 'admin@uncle.com' && password === '00000000') {
        return {
            id: 'admin',
            name: 'المدير العام',
            phone: '00000000',
            hasProfile: true,
            isAdmin: true,
            age: '', gender: '', height: '', weight: '', goal: '', allergies: ''
        };
    }

    // Chef Check
    if (identifier === 'chef@uncle.com' && password === '00000000') {
        return {
            id: 'chef',
            name: 'الشيف الرئيسي',
            phone: '00000000',
            hasProfile: true,
            isChef: true,
            age: '', gender: '', height: '', weight: '', goal: '', allergies: ''
        };
    }

    // Employee Check
    if (identifier === 'self@uncle.com' && password === '00000000') {
        return {
            id: 'employee_01',
            name: 'موظف انكل',
            phone: '00000000',
            hasProfile: true,
            isEmployee: true,
            age: '', gender: '', height: '', weight: '', goal: '', allergies: ''
        };
    }

    const cleanIdentifier = authService.sanitizeIdentifier(identifier);

    // Regular User Login (Firestore lookup by phone/identifier)
    try {
      await ensureAuth();
      const docRef = doc(db, "users", cleanIdentifier);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data() as UserProfile;
        if (userData.password === password) {
            return userData;
        }
      }
      return null;
    } catch (e: any) {
      console.warn("Firestore Login Document Get Failed:", {
          message: e?.message,
          code: e?.code,
          identifier: cleanIdentifier
      });
      return null;
    }
  },

  getAllUsers: async (): Promise<UserProfile[]> => {
    try {
      await ensureAuth();
      const querySnapshot = await getDocs(collection(db, "users"));
      const users: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        users.push(doc.data() as UserProfile);
      });
      return users;
    } catch (e) {
        console.warn("Failed to fetch users list");
        return [];
    }
  }
};
