/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavTab, Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { PosView } from './components/pos/PosView';
import { OrdersView } from './components/orders/OrdersView';
import { HistoryView } from './components/history/HistoryView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { ReportsView } from './components/reports/ReportsView';
import { CatalogManagementView } from './components/catalog/CatalogManagementView';
import { SettingsView } from './components/settings/SettingsView';
import { ReceiptModal } from './components/receipt/ReceiptModal';
import { LoginView } from './components/auth/LoginView';
import { FirestoreService } from './services/firestoreService';
import { StorageService } from './services/storageService';
import { testConnection } from './services/firebase';
import { CatalogItem, Transaction, Expense, StoreProfile, OrderStatus } from './types';
import { DEFAULT_CATALOG_ITEMS, DEFAULT_STORE_PROFILE } from './data/defaultData';
import { CheckCircle2, AlertCircle, X, Sparkles, Loader2 } from 'lucide-react';

function PosAppContent() {
  const { user, role, loading: authLoading, logout } = useAuth();

  // Navigation & UI States
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // App Data States (Synchronized via Firestore Realtime)
  const [storeProfile, setStoreProfile] = useState<StoreProfile>(() => StorageService.getStoreProfile());
  const [cashierName, setCashierName] = useState<string>(() => StorageService.getCashierName());
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(DEFAULT_CATALOG_ITEMS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);

  // Receipt Modal State
  const [activeReceiptTx, setActiveReceiptTx] = useState<Transaction | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Test connection to Firestore on initial boot
  useEffect(() => {
    testConnection();
  }, []);

  // Set default cashier name from user profile once logged in
  useEffect(() => {
    if (user?.displayName) {
      setCashierName(user.displayName);
    }
  }, [user]);

  // Firestore Realtime Subscriptions (Active when user is authenticated)
  useEffect(() => {
    if (!user) return;

    setIsDataLoading(true);

    // 1. Subscribe Catalog
    const unsubCatalog = FirestoreService.subscribeCatalog(
      (items) => {
        setCatalogItems(items);
        StorageService.saveCatalogItems(items);
      },
      (err) => console.error('Catalog sync error:', err)
    );

    // 2. Subscribe Transactions
    const unsubTransactions = FirestoreService.subscribeTransactions(
      (txList) => {
        setTransactions(txList);
        StorageService.saveTransactions(txList);
        setIsDataLoading(false);
      },
      (err) => {
        console.error('Transactions sync error:', err);
        setIsDataLoading(false);
      }
    );

    // 3. Subscribe Expenses
    const unsubExpenses = FirestoreService.subscribeExpenses(
      (expList) => {
        setExpenses(expList);
        StorageService.saveExpenses(expList);
      },
      (err) => console.error('Expenses sync error:', err)
    );

    // 4. Subscribe Store Profile
    const unsubProfile = FirestoreService.subscribeStoreProfile(
      (profile) => {
        setStoreProfile(profile);
        StorageService.saveStoreProfile(profile);
      },
      (err) => console.error('Profile sync error:', err)
    );

    return () => {
      unsubCatalog();
      unsubTransactions();
      unsubExpenses();
      unsubProfile();
    };
  }, [user]);

  // Active orders count for badge (Menunggu & Diproses)
  const activeOrdersCount = useMemo(() => {
    return transactions.filter(
      (t) => t.orderStatus === 'Menunggu' || t.orderStatus === 'Diproses'
    ).length;
  }, [transactions]);

  // Handle checkout and save to Firestore
  const handleTransactionComplete = async (newTx: Transaction) => {
    try {
      await FirestoreService.addTransaction(newTx);
      setActiveReceiptTx(newTx);
      setIsReceiptModalOpen(true);
      showToast(`Transaksi ${newTx.invoiceNumber} berhasil tersimpan ke Cloud!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Gagal menyimpan transaksi: ${msg}`, 'error');
    }
  };

  // Update order status handler
  const handleUpdateStatus = async (id: string, nextStatus: OrderStatus) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;

    const updatedTx: Transaction = {
      ...target,
      orderStatus: nextStatus,
      completedAt: nextStatus === 'Selesai' ? new Date().toISOString() : target.completedAt,
      pickedUpAt: nextStatus === 'Diambil' ? new Date().toISOString() : target.pickedUpAt,
    };

    try {
      await FirestoreService.updateTransaction(updatedTx);
      showToast(`Status pesanan #${target.invoiceNumber} diubah ke "${nextStatus}"!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Gagal memperbarui status: ${msg}`, 'error');
    }
  };

  // Delete transaction handler
  const handleDeleteTransaction = async (id: string) => {
    try {
      await FirestoreService.deleteTransaction(id);
      showToast('Transaksi berhasil dihapus.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Gagal menghapus transaksi: ${msg}`, 'error');
    }
  };

  // Add Expense handler
  const handleAddExpense = async (expense: Expense) => {
    try {
      const payload: Expense = {
        ...expense,
        createdBy: user?.displayName || cashierName,
      };
      await FirestoreService.addExpense(payload);
      showToast('Pengeluaran operasional berhasil dicatat di cloud.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Gagal menambah pengeluaran: ${msg}`, 'error');
    }
  };

  // Delete Expense handler
  const handleDeleteExpense = async (id: string) => {
    try {
      await FirestoreService.deleteExpense(id);
      showToast('Pengeluaran berhasil dihapus.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Gagal menghapus: ${msg}`, 'error');
    }
  };

  // Catalog item handlers
  const handleSaveCatalogItem = async (item: CatalogItem) => {
    try {
      await FirestoreService.saveCatalogItem(item);
      showToast(`Item "${item.name}" berhasil disimpan di Cloud.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Gagal menyimpan item: ${msg}`, 'error');
    }
  };

  const handleDeleteCatalogItem = async (id: string) => {
    try {
      await FirestoreService.deleteCatalogItem(id);
      showToast('Item katalog berhasil dihapus.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Gagal menghapus item: ${msg}`, 'error');
    }
  };

  const handleResetCatalog = async () => {
    try {
      await FirestoreService.resetCatalogToDefault();
      showToast('Tarif katalog dikembalikan ke standar awal.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Gagal reset katalog: ${msg}`, 'error');
    }
  };

  // Profile update
  const handleSaveProfile = async (profile: StoreProfile) => {
    try {
      await FirestoreService.saveStoreProfile(profile);
      showToast('Profil toko & struk berhasil diperbarui.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Gagal menyimpan profil: ${msg}`, 'error');
    }
  };

  const handleSaveCashierName = (name: string) => {
    StorageService.setCashierName(name);
    setCashierName(name);
  };

  // File Download Helper
  const downloadBlob = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export JSON
  const handleExportJSON = () => {
    const jsonStr = StorageService.exportFullBackup();
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadBlob(jsonStr, `GimmaGlowShoes_Backup_${dateStr}.json`, 'application/json');
    showToast('Cadangan JSON lengkap berhasil diunduh.');
  };

  // Import JSON
  const handleImportJSON = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const res = StorageService.importFullBackup(text);
      if (res.success) {
        try {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed.catalog)) {
            for (const item of parsed.catalog) {
              await FirestoreService.saveCatalogItem(item);
            }
          }
          if (Array.isArray(parsed.transactions)) {
            for (const tx of parsed.transactions) {
              await FirestoreService.addTransaction(tx);
            }
          }
          if (Array.isArray(parsed.expenses)) {
            for (const exp of parsed.expenses) {
              await FirestoreService.addExpense(exp);
            }
          }
          if (parsed.storeProfile) {
            await FirestoreService.saveStoreProfile(parsed.storeProfile);
          }
          showToast('Data berhasil dipulihkan dan disinkronkan ke Cloud!');
        } catch (uploadErr) {
          console.warn('Syncing imported data to firestore handled:', uploadErr);
          showToast('Data diimpor lokal, mohon cek koneksi cloud.', 'info');
        }
      } else {
        showToast(res.message, 'error');
      }
    };
    reader.readAsText(file);
  };

  // Export CSV Transactions
  const handleExportTransactionsCSV = () => {
    const csv = StorageService.exportTransactionsToCSV();
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadBlob(csv, `GimmaGlowShoes_Transaksi_${dateStr}.csv`, 'text/csv;charset=utf-8;');
    showToast('File CSV transaksi kasir berhasil diunduh.');
  };

  // Export CSV Expenses
  const handleExportExpensesCSV = () => {
    const csv = StorageService.exportExpensesToCSV();
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadBlob(csv, `GimmaGlowShoes_Pengeluaran_${dateStr}.csv`, 'text/csv;charset=utf-8;');
    showToast('File CSV biaya operasional berhasil diunduh.');
  };

  // Clear all transactions and expenses
  const handleClearAllData = async () => {
    try {
      for (const t of transactions) {
        await FirestoreService.deleteTransaction(t.id);
      }
      for (const exp of expenses) {
        await FirestoreService.deleteExpense(exp.id);
      }
      StorageService.saveTransactions([]);
      StorageService.saveExpenses([]);
      showToast('Semua data transaksi dan pengeluaran telah direset di Cloud.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Gagal mereset: ${msg}`, 'error');
    }
  };

  // View Receipt Modal trigger
  const handleViewReceipt = (tx: Transaction) => {
    setActiveReceiptTx(tx);
    setIsReceiptModalOpen(true);
  };

  // 1. Loading State while Auth initializes
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-[#12372A] text-[#C9A34E] flex items-center justify-center shadow-xl ring-4 ring-[#C9A34E]/20 animate-pulse mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="font-extrabold text-lg text-slate-800 font-brand">GIMMA GLOW SHOES</h2>
        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin text-[#12372A]" />
          <span>Memeriksa status autentikasi kasir...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State -> Show Login Screen
  if (!user) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-slate-800 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeOrdersCount={activeOrdersCount}
        isOpenMobile={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        storeProfile={storeProfile}
      />

      {/* Main Workspace */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onOpenMobile={() => setIsMobileNavOpen(true)}
          onNewTransaction={() => setCurrentTab('pos')}
          cashierName={cashierName}
          userRole={role}
          currentUser={user}
          onLogout={logout}
        />

        {/* Dynamic Content Views */}
        <main className="flex-1 pb-16">
          {currentTab === 'dashboard' && (
            <DashboardView
              transactions={transactions}
              expenses={expenses}
              storeProfile={storeProfile}
              onNavigateToTab={setCurrentTab}
              onViewReceipt={handleViewReceipt}
            />
          )}

          {currentTab === 'pos' && (
            <PosView
              catalogItems={catalogItems}
              existingTransactions={transactions}
              cashierName={cashierName}
              cashierId={user.uid}
              storeProfile={storeProfile}
              onTransactionComplete={handleTransactionComplete}
            />
          )}

          {currentTab === 'orders' && (
            <OrdersView
              transactions={transactions}
              storeProfile={storeProfile}
              onUpdateStatus={handleUpdateStatus}
              onViewReceipt={handleViewReceipt}
            />
          )}

          {currentTab === 'history' && (
            <HistoryView
              transactions={transactions}
              onDeleteTransaction={handleDeleteTransaction}
              onViewReceipt={handleViewReceipt}
              onExportCSV={handleExportTransactionsCSV}
            />
          )}

          {currentTab === 'expenses' && (
            <ExpensesView
              expenses={expenses}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
              onExportCSV={handleExportExpensesCSV}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              transactions={transactions}
              expenses={expenses}
            />
          )}

          {currentTab === 'catalog' && (
            <CatalogManagementView
              catalogItems={catalogItems}
              onSaveItem={handleSaveCatalogItem}
              onDeleteItem={handleDeleteCatalogItem}
              onResetCatalog={handleResetCatalog}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              storeProfile={storeProfile}
              cashierName={cashierName}
              onSaveProfile={handleSaveProfile}
              onSaveCashierName={handleSaveCashierName}
              onExportJSON={handleExportJSON}
              onImportJSON={handleImportJSON}
              onExportTransactionsCSV={handleExportTransactionsCSV}
              onExportExpensesCSV={handleExportExpensesCSV}
              onClearAllData={handleClearAllData}
            />
          )}
        </main>
      </div>

      {/* Printable Receipt Modal */}
      <ReceiptModal
        transaction={activeReceiptTx}
        storeProfile={storeProfile}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#12372A] text-white rounded-2xl shadow-2xl border border-[#C9A34E]/30 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#C9A34E] shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-slate-300 hover:text-white p-0.5 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PosAppContent />
    </AuthProvider>
  );
}
