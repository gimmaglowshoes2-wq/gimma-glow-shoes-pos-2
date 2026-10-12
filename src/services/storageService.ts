import { CatalogItem, Transaction, Expense, StoreProfile } from '../types';
import { DEFAULT_CATALOG_ITEMS, DEFAULT_STORE_PROFILE } from '../data/defaultData';

const STORAGE_KEYS = {
  CATALOG: 'ggs_catalog_items_v1',
  TRANSACTIONS: 'ggs_transactions_v1',
  EXPENSES: 'ggs_expenses_v1',
  STORE_PROFILE: 'ggs_store_profile_v1',
  CASHIER_NAME: 'ggs_cashier_name_v1',
};

export const StorageService = {
  // Store Profile
  getStoreProfile(): StoreProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STORE_PROFILE);
      return data ? JSON.parse(data) : DEFAULT_STORE_PROFILE;
    } catch (e) {
      console.error('Failed to load store profile', e);
      return DEFAULT_STORE_PROFILE;
    }
  },

  saveStoreProfile(profile: StoreProfile): void {
    localStorage.setItem(STORAGE_KEYS.STORE_PROFILE, JSON.stringify(profile));
  },

  // Cashier Name
  getCashierName(): string {
    return localStorage.getItem(STORAGE_KEYS.CASHIER_NAME) || 'Kasir 1';
  },

  setCashierName(name: string): void {
    localStorage.setItem(STORAGE_KEYS.CASHIER_NAME, name);
  },

  // Catalog
  getCatalogItems(): CatalogItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATALOG);
      if (data) {
        return JSON.parse(data);
      }
      // initialize with defaults
      this.saveCatalogItems(DEFAULT_CATALOG_ITEMS);
      return DEFAULT_CATALOG_ITEMS;
    } catch (e) {
      console.error('Failed to load catalog items', e);
      return DEFAULT_CATALOG_ITEMS;
    }
  },

  saveCatalogItems(items: CatalogItem[]): void {
    localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(items));
  },

  resetCatalogToDefault(): CatalogItem[] {
    this.saveCatalogItems(DEFAULT_CATALOG_ITEMS);
    return DEFAULT_CATALOG_ITEMS;
  },

  // Transactions
  getTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load transactions', e);
      return [];
    }
  },

  saveTransactions(transactions: Transaction[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  addTransaction(newTx: Transaction): Transaction[] {
    const list = this.getTransactions();
    const updated = [newTx, ...list];
    this.saveTransactions(updated);

    // Also deduct stock for purchased products
    const catalog = this.getCatalogItems();
    let catalogModified = false;
    newTx.items.forEach(cartItem => {
      if (cartItem.item.category === 'product') {
        const found = catalog.find(c => c.id === cartItem.item.id);
        if (found && typeof found.stock === 'number') {
          found.stock = Math.max(0, found.stock - cartItem.quantity);
          catalogModified = true;
        }
      }
    });

    if (catalogModified) {
      this.saveCatalogItems(catalog);
    }

    return updated;
  },

  updateTransaction(updatedTx: Transaction): Transaction[] {
    const list = this.getTransactions();
    const updated = list.map(t => (t.id === updatedTx.id ? updatedTx : t));
    this.saveTransactions(updated);
    return updated;
  },

  deleteTransaction(id: string): Transaction[] {
    const list = this.getTransactions();
    const updated = list.filter(t => t.id !== id);
    this.saveTransactions(updated);
    return updated;
  },

  // Expenses
  getExpenses(): Expense[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load expenses', e);
      return [];
    }
  },

  saveExpenses(expenses: Expense[]): void {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  },

  addExpense(expense: Expense): Expense[] {
    const list = this.getExpenses();
    const updated = [expense, ...list];
    this.saveExpenses(updated);
    return updated;
  },

  deleteExpense(id: string): Expense[] {
    const list = this.getExpenses();
    const updated = list.filter(e => e.id !== id);
    this.saveExpenses(updated);
    return updated;
  },

  // Export full JSON backup
  exportFullBackup(): string {
    const backup = {
      app: 'GIMMA GLOW SHOES',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      storeProfile: this.getStoreProfile(),
      catalog: this.getCatalogItems(),
      transactions: this.getTransactions(),
      expenses: this.getExpenses(),
    };
    return JSON.stringify(backup, null, 2);
  },

  // Import JSON backup
  importFullBackup(jsonContent: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonContent);
      if (!parsed.transactions && !parsed.catalog) {
        return { success: false, message: 'Format file tidak sesuai cadangan Gimma Glow Shoes.' };
      }

      if (Array.isArray(parsed.catalog)) {
        this.saveCatalogItems(parsed.catalog);
      }
      if (Array.isArray(parsed.transactions)) {
        this.saveTransactions(parsed.transactions);
      }
      if (Array.isArray(parsed.expenses)) {
        this.saveExpenses(parsed.expenses);
      }
      if (parsed.storeProfile) {
        this.saveStoreProfile(parsed.storeProfile);
      }

      return { success: true, message: 'Data berhasil diimpor sepenuhnya!' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, message: `Gagal membaca file: ${msg}` };
    }
  },

  // CSV Export for Transactions
  exportTransactionsToCSV(): string {
    const transactions = this.getTransactions();
    const headers = [
      'No Invoice',
      'Tanggal',
      'Nama Pelanggan',
      'Nomor WhatsApp',
      'Merk Sepatu',
      'Jenis Sepatu',
      'Kondisi',
      'Item Layanan / Produk',
      'Subtotal',
      'Diskon',
      'Total',
      'Metode Pembayaran',
      'Status Pesanan',
      'Kasir',
      'Catatan',
    ];

    const rows = transactions.map(t => {
      const itemsList = t.items.map(i => `${i.item.name} (x${i.quantity})`).join('; ');
      return [
        `"${t.invoiceNumber}"`,
        `"${new Date(t.createdAt).toLocaleString('id-ID')}"`,
        `"${(t.customer.name || '').replace(/"/g, '""')}"`,
        `"${t.customer.whatsapp || ''}"`,
        `"${(t.customer.shoeBrand || '').replace(/"/g, '""')}"`,
        `"${t.customer.shoeType || ''}"`,
        `"${(t.customer.shoeCondition || '').replace(/"/g, '""')}"`,
        `"${itemsList.replace(/"/g, '""')}"`,
        t.subtotal,
        t.discount,
        t.total,
        `"${t.paymentMethod}"`,
        `"${t.orderStatus}"`,
        `"${(t.cashierName || '').replace(/"/g, '""')}"`,
        `"${(t.customer.specialNotes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  },

  // CSV Export for Expenses
  exportExpensesToCSV(): string {
    const expenses = this.getExpenses();
    const headers = ['ID', 'Tanggal', 'Judul Pengeluaran', 'Kategori', 'Nominal (Rp)', 'Catatan'];
    const rows = expenses.map(e => [
      `"${e.id}"`,
      `"${e.date}"`,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.category}"`,
      e.amount,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ].join(','));
    return [headers.join(','), ...rows].join('\n');
  },
};
