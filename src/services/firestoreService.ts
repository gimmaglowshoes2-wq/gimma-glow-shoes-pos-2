import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  getDoc,
  runTransaction,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { CatalogItem, Transaction, Expense, StoreProfile } from '../types';
import { DEFAULT_CATALOG_ITEMS, DEFAULT_STORE_PROFILE } from '../data/defaultData';

export const FirestoreService = {
  // ================= CATALOG =================
  subscribeCatalog(
    onData: (items: CatalogItem[]) => void,
    onError?: (err: Error) => void
  ) {
    const colPath = 'catalog';
    const q = query(collection(db, colPath), orderBy('name', 'asc'));

    return onSnapshot(
      q,
      async (snapshot) => {
        if (snapshot.empty) {
          // Auto-seed default catalog items to cloud if first time
          try {
            for (const item of DEFAULT_CATALOG_ITEMS) {
              await setDoc(doc(db, colPath, item.id), item);
            }
          } catch (seedErr) {
            console.warn('Initial catalog seed handled:', seedErr);
          }
          onData(DEFAULT_CATALOG_ITEMS);
          return;
        }

        const items: CatalogItem[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as CatalogItem);
        });
        onData(items);
      },
      (error) => {
        if (onError) onError(error as Error);
        handleFirestoreError(error, OperationType.GET, colPath);
      }
    );
  },

  async saveCatalogItem(item: CatalogItem): Promise<void> {
    const colPath = 'catalog';
    try {
      await setDoc(doc(db, colPath, item.id), {
        ...item,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${colPath}/${item.id}`);
    }
  },

  async deleteCatalogItem(id: string): Promise<void> {
    const colPath = 'catalog';
    try {
      await deleteDoc(doc(db, colPath, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${colPath}/${id}`);
    }
  },

  async resetCatalogToDefault(): Promise<void> {
    const colPath = 'catalog';
    try {
      for (const item of DEFAULT_CATALOG_ITEMS) {
        await setDoc(doc(db, colPath, item.id), item);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, colPath);
    }
  },

  // ================= TRANSACTIONS =================
  subscribeTransactions(
    onData: (transactions: Transaction[]) => void,
    onError?: (err: Error) => void
  ) {
    const colPath = 'transactions';
    const q = query(collection(db, colPath), orderBy('createdAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: Transaction[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as Transaction);
        });
        onData(list);
      },
      (error) => {
        if (onError) onError(error as Error);
        handleFirestoreError(error, OperationType.GET, colPath);
      }
    );
  },

  async addTransaction(transaction: Transaction): Promise<void> {
    const colPath = 'transactions';
    try {
      await setDoc(doc(db, colPath, transaction.id), transaction);

      // Deduct stock for products purchased in this transaction
      for (const cartItem of transaction.items) {
        if (cartItem.item.category === 'product') {
          const itemDocRef = doc(db, 'catalog', cartItem.item.id);
          try {
            const snap = await getDoc(itemDocRef);
            if (snap.exists()) {
              const currentStock = snap.data().stock;
              if (typeof currentStock === 'number') {
                const nextStock = Math.max(0, currentStock - cartItem.quantity);
                await setDoc(itemDocRef, { stock: nextStock }, { merge: true });
              }
            }
          } catch (stkErr) {
            console.warn('Stock update handled:', stkErr);
          }
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${colPath}/${transaction.id}`);
    }
  },

  async updateTransaction(transaction: Transaction): Promise<void> {
    const colPath = 'transactions';
    try {
      await setDoc(doc(db, colPath, transaction.id), transaction, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${colPath}/${transaction.id}`);
    }
  },

  async deleteTransaction(id: string): Promise<void> {
    const colPath = 'transactions';
    try {
      await deleteDoc(doc(db, colPath, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${colPath}/${id}`);
    }
  },

  // ================= EXPENSES =================
  subscribeExpenses(
    onData: (expenses: Expense[]) => void,
    onError?: (err: Error) => void
  ) {
    const colPath = 'expenses';
    const q = query(collection(db, colPath), orderBy('createdAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: Expense[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as Expense);
        });
        onData(list);
      },
      (error) => {
        if (onError) onError(error as Error);
        handleFirestoreError(error, OperationType.GET, colPath);
      }
    );
  },

  async addExpense(expense: Expense): Promise<void> {
    const colPath = 'expenses';
    try {
      await setDoc(doc(db, colPath, expense.id), expense);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${colPath}/${expense.id}`);
    }
  },

  async deleteExpense(id: string): Promise<void> {
    const colPath = 'expenses';
    try {
      await deleteDoc(doc(db, colPath, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${colPath}/${id}`);
    }
  },

  // ================= STORE SETTINGS =================
  subscribeStoreProfile(
    onData: (profile: StoreProfile) => void,
    onError?: (err: Error) => void
  ) {
    const docPath = 'settings/storeProfile';
    const docRef = doc(db, 'settings', 'storeProfile');

    return onSnapshot(
      docRef,
      async (snapshot) => {
        if (!snapshot.exists()) {
          // Initialize with default
          try {
            await setDoc(docRef, DEFAULT_STORE_PROFILE);
          } catch (e) {
            console.warn('Initial store profile seed handled:', e);
          }
          onData(DEFAULT_STORE_PROFILE);
          return;
        }
        onData(snapshot.data() as StoreProfile);
      },
      (error) => {
        if (onError) onError(error as Error);
        handleFirestoreError(error, OperationType.GET, docPath);
      }
    );
  },

  async saveStoreProfile(profile: StoreProfile): Promise<void> {
    const docPath = 'settings/storeProfile';
    try {
      await setDoc(doc(db, 'settings', 'storeProfile'), {
        ...profile,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },
};
