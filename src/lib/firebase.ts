import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { EmailRecord, ColumnMappings } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID (Required by skill)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Authentication
export const auth = getAuth(app);

// Google Auth Provider configured for Gmail accounts
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Error handling enum and interface as mandated by SKILL.md
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on initial boot (Mandated by SKILL.md)
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection notice: client is offline or starting up.');
    }
    return false;
  }
}

// Run connection check asynchronously without blocking
testConnection().catch(() => {});

// User Profile interface
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: string;
  lastLoginAt: string;
}

// Uploaded Dataset Metadata in User's Database
export interface SavedDatasetMeta {
  id: string;
  userId: string;
  fileName: string;
  sheetName: string;
  rowCount: number;
  validCount: number;
  riskyCount: number;
  invalidCount: number;
  untestedCount: number;
  whatsappSentCount: number;
  emailSentCount: number;
  columnMappings: ColumnMappings;
  createdAt: string;
  updatedAt: string;
}

// Sign In with Google
export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Synchronize or update user document in Firestore
    const userRef = doc(db, 'users', user.uid);
    const now = new Date().toISOString();
    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        lastLoginAt: now,
      },
      { merge: true }
    );

    return user;
  } catch (error) {
    console.error('Google Sign In Error:', error);
    throw error;
  }
}

// Sign Out
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Save complete extracted dataset and its records into the specific user's Firestore database
export async function saveExtractedDataset(
  userId: string,
  datasetMeta: Omit<SavedDatasetMeta, 'userId'>,
  records: EmailRecord[]
): Promise<SavedDatasetMeta> {
  if (!userId) {
    throw new Error('User must be authenticated to save datasets to database.');
  }

  const datasetId = datasetMeta.id;
  const now = new Date().toISOString();
  const fullMeta: SavedDatasetMeta = {
    ...datasetMeta,
    userId,
    updatedAt: now,
  };

  const datasetPath = `users/${userId}/datasets/${datasetId}`;

  try {
    // 1. Save dataset header document
    const datasetRef = doc(db, 'users', userId, 'datasets', datasetId);
    await setDoc(datasetRef, fullMeta, { merge: true });

    // 2. Save individual records in batches of 300
    const BATCH_SIZE = 300;
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const slice = records.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(db);

      slice.forEach((rec) => {
        const recordRef = doc(db, 'users', userId, 'datasets', datasetId, 'records', rec.id);
        const recordDoc = {
          id: rec.id,
          datasetId,
          userId,
          rowIndex: rec.rowIndex,
          currentEmail: rec.currentEmail,
          originalEmail: rec.originalEmail,
          emailColumnName: rec.emailColumnName || '',
          ownerName: rec.ownerName || '',
          companyName: rec.companyName || '',
          phoneNumber: rec.phoneNumber || '',
          registeredAddress: rec.registeredAddress || '',
          status: rec.verification?.status || 'untested',
          deliverabilityScore: rec.verification?.deliverabilityScore ?? 0,
          provider: rec.verification?.provider || 'Unknown',
          whatsappSent: !!rec.whatsappSent,
          whatsappSentAt: rec.whatsappSentAt || null,
          emailSent: !!rec.emailSent,
          emailSentAt: rec.emailSentAt || null,
          typoFixed: !!rec.typoFixed,
          // Store verification snapshot
          verification: rec.verification || null,
          phoneValidation: rec.phoneValidation || null,
          updatedAt: now,
        };
        batch.set(recordRef, recordDoc, { merge: true });
      });

      await batch.commit();
    }

    return fullMeta;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, datasetPath);
  }
}

// Fetch all saved datasets for a user
export async function getUserDatasets(userId: string): Promise<SavedDatasetMeta[]> {
  const collectionPath = `users/${userId}/datasets`;
  try {
    const q = query(collection(db, 'users', userId, 'datasets'), orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as SavedDatasetMeta);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

// Fetch all records for a specific dataset
export async function getDatasetRecords(userId: string, datasetId: string): Promise<EmailRecord[]> {
  const recordsPath = `users/${userId}/datasets/${datasetId}/records`;
  try {
    const q = query(
      collection(db, 'users', userId, 'datasets', datasetId, 'records'),
      orderBy('rowIndex', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: data.id,
        rowIndex: data.rowIndex,
        originalEmail: data.originalEmail,
        currentEmail: data.currentEmail,
        rawData: {},
        emailColumnName: data.emailColumnName || 'Email',
        ownerName: data.ownerName || undefined,
        companyName: data.companyName || undefined,
        phoneNumber: data.phoneNumber || undefined,
        phoneValidation: data.phoneValidation || undefined,
        registeredAddress: data.registeredAddress || undefined,
        verification: data.verification || undefined,
        typoFixed: data.typoFixed || false,
        whatsappSent: data.whatsappSent || false,
        whatsappSentAt: data.whatsappSentAt || undefined,
        emailSent: data.emailSent || false,
        emailSentAt: data.emailSentAt || undefined,
      } as EmailRecord;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, recordsPath);
  }
}

// Update single record outreach status directly in user's database
export async function updateRecordOutreach(
  userId: string,
  datasetId: string,
  recordId: string,
  updates: {
    whatsappSent?: boolean;
    whatsappSentAt?: string;
    emailSent?: boolean;
    emailSentAt?: string;
  }
): Promise<void> {
  const recordPath = `users/${userId}/datasets/${datasetId}/records/${recordId}`;
  try {
    const recordRef = doc(db, 'users', userId, 'datasets', datasetId, 'records', recordId);
    await updateDoc(recordRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, recordPath);
  }
}

// Delete a dataset and its subcollection records
export async function deleteUserDataset(userId: string, datasetId: string): Promise<void> {
  const datasetPath = `users/${userId}/datasets/${datasetId}`;
  try {
    // 1. Delete all record documents in subcollection
    const recordsColl = collection(db, 'users', userId, 'datasets', datasetId, 'records');
    const recordsSnap = await getDocs(recordsColl);

    const batch = writeBatch(db);
    recordsSnap.docs.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();

    // 2. Delete parent dataset document
    const datasetRef = doc(db, 'users', userId, 'datasets', datasetId);
    await deleteDoc(datasetRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, datasetPath);
  }
}
