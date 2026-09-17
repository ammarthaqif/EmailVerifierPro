import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  logoutUser,
  SavedDatasetMeta,
  getUserDatasets,
  saveExtractedDataset,
  deleteUserDataset,
} from '../lib/firebase';
import { EmailRecord } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  isLoading: boolean;
  savedDatasets: SavedDatasetMeta[];
  isSavingToDb: boolean;
  dbSyncStatus: 'idle' | 'syncing' | 'saved' | 'error';
  lastSavedAt: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshDatasets: () => Promise<void>;
  saveDatasetToDb: (
    meta: Omit<SavedDatasetMeta, 'userId'>,
    records: EmailRecord[]
  ) => Promise<SavedDatasetMeta | null>;
  deleteDatasetFromDb: (datasetId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savedDatasets, setSavedDatasets] = useState<SavedDatasetMeta[]>([]);
  const [isSavingToDb, setIsSavingToDb] = useState(false);
  const [dbSyncStatus, setDbSyncStatus] = useState<'idle' | 'syncing' | 'saved' | 'error'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Refresh user's saved datasets list from their Firestore database
  const refreshDatasets = useCallback(async () => {
    if (!user) {
      setSavedDatasets([]);
      return;
    }
    try {
      const list = await getUserDatasets(user.uid);
      setSavedDatasets(list);
    } catch (err) {
      console.error('Failed to fetch user datasets:', err);
    }
  }, [user]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
      if (currentUser) {
        try {
          const list = await getUserDatasets(currentUser.uid);
          setSavedDatasets(list);
        } catch (e) {
          console.error('Error loading initial datasets:', e);
        }
      } else {
        setSavedDatasets([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      setIsLoading(true);
      const signedInUser = await signInWithGoogle();
      setUser(signedInUser);
      const list = await getUserDatasets(signedInUser.uid);
      setSavedDatasets(list);
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setSavedDatasets([]);
      setDbSyncStatus('idle');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const saveDatasetToDb = async (
    meta: Omit<SavedDatasetMeta, 'userId'>,
    records: EmailRecord[]
  ): Promise<SavedDatasetMeta | null> => {
    if (!user) {
      return null;
    }
    setIsSavingToDb(true);
    setDbSyncStatus('syncing');
    try {
      const saved = await saveExtractedDataset(user.uid, meta, records);
      setDbSyncStatus('saved');
      setLastSavedAt(new Date().toLocaleTimeString());
      await refreshDatasets();
      return saved;
    } catch (err) {
      console.error('Error saving dataset to database:', err);
      setDbSyncStatus('error');
      throw err;
    } finally {
      setIsSavingToDb(false);
    }
  };

  const deleteDatasetFromDb = async (datasetId: string) => {
    if (!user) return;
    try {
      await deleteUserDataset(user.uid, datasetId);
      setSavedDatasets((prev) => prev.filter((d) => d.id !== datasetId));
    } catch (err) {
      console.error('Failed to delete dataset:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        savedDatasets,
        isSavingToDb,
        dbSyncStatus,
        lastSavedAt,
        loginWithGoogle: login,
        logout,
        refreshDatasets,
        saveDatasetToDb,
        deleteDatasetFromDb,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
