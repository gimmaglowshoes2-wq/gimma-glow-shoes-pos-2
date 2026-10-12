import React, { useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  Filter,
  Download,
  Trash2,
  Eye,
  Receipt,
  FileSpreadsheet,
  AlertTriangle,
  ArrowUpDown,
} from 'lucide-react';
import { Transaction, PaymentMethod } from '../../types';
import { formatRupiah, formatDateTime } from '../../utils/formatters';
import { StatusBadge } from '../common/Badge';
import { ConfirmModal } from '../common/ConfirmModal';

interface HistoryViewProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onViewReceipt: (tx: Transaction) => void;
  onExportCSV: () => void;
}

type DateFilterType = 'all' | 'today' | 'last7' | 'thisMonth';

export const HistoryView: React.FC<HistoryViewProps> = ({
  transactions,
  onDeleteTransaction,
  onViewReceipt,
  onExportCSV,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');

  // Delete modal state
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  // Filter logic
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return transactions.filter((tx) => {
      // 1. Search Query
      const q = searchQuery.toLowerCase();
      const matchSearch =
        tx.invoiceNumber.toLowerCase().includes(q) ||
        tx.customer.name.toLowerCase().includes(q) ||
        (tx.customer.whatsapp || '').includes(q) ||
        (tx.customer.shoeBrand || '').toLowerCase().includes(q);

      if (!matchSearch) return false;

      // 2. Payment Method
      if (
        selectedPaymentMethod !== 'all' &&
        tx.paymentMethod !== selectedPaymentMethod
      ) {
        return false;
      }

      // 3. Date Filter
      const txDate = new Date(tx.createdAt);
      if (dateFilter === 'today') {
        return txDate >= todayStart;
      } else if (dateFilter === 'last7') {
        const d7 = new Date();
        d7.setDate(now.getDate() - 7);
        return txDate >= d7;
      } else if (dateFilter === 'thisMonth') {
        return (
          txDate.getFullYear() === now.getFullYear() &&
          txDate.getMonth() === now.getMonth()
        );
      }

      return true;
    });
  }, [transactions, searchQuery, dateFilter, selectedPaymentMethod]);

  // Aggregate totals of filtered list
  const totalOmzetFiltered = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => acc + t.total, 0);
  }, [filteredTransactions]);

  const confirmDelete = () => {
    if (txToDelete) {
      onDeleteTransaction(txToDelete.id);
      setTxToDelete(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Controls & Summary Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Riwayat Pembukuan Transaksi
            </h2>
            <p className="text-xs text-slate-500">
              Ditemukan {filteredTransactions.length} transaksi dengan total nilai{' '}
              <strong className="text-[#12372A] font-extrabold">
                {formatRupiah(totalOmzetFiltered)}
              </strong>
            </p>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto">
            <button
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Ekspor CSV (Excel)</span>
            </button>
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-3 border-t border-slate-100">
          {/* Search */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari No. Invoice, Nama Pelanggan, atau No. WA..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#12372A]"
            />
          </div>

          {/* Date Range Preset */}
          <div className="lg:col-span-4 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilterType)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            >
              <option value="all">Semua Waktu</option>
              <option value="today">Hari Ini</option>
              <option value="last7">7 Hari Terakhir</option>
              <option value="thisMonth">Bulan Ini</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div className="lg:col-span-3 flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            >
              <option value="all">Semua Metode Bayar</option>
              <option value="Tunai">Tunai (Cash)</option>
              <option value="QRIS">QRIS</option>
              <option value="Transfer">Transfer Bank</option>
              <option value="Debit">Debit Card</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Receipt className="w-12 h-12 mx-auto opacity-30 mb-2" />
            <p className="font-semibold text-sm">Tidak ada transaksi yang cocok</p>
            <p className="text-xs text-slate-400 mt-1">
              Sesuaikan kata kunci pencarian atau rentang tanggal.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F5EF] text-slate-600 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">No. Invoice</th>
                  <th className="py-3 px-4">Tanggal & Waktu</th>
                  <th className="py-3 px-4">Pelanggan</th>
                  <th className="py-3 px-4">Sepatu / Treatment</th>
                  <th className="py-3 px-4">Metode</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {tx.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatDateTime(tx.createdAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{tx.customer.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {tx.customer.whatsapp || '-'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">
                        {tx.customer.shoeBrand || tx.customer.shoeType}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {tx.items.map((i) => `${i.item.name} (${i.quantity}x)`).join(', ')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-[#12372A] whitespace-nowrap text-sm">
                      {formatRupiah(tx.total)}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <StatusBadge status={tx.orderStatus} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewReceipt(tx)}
                          className="p-1.5 rounded-lg text-[#12372A] hover:bg-[#12372A]/10 transition-colors"
                          title="Cetak Ulang Struk"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setTxToDelete(tx)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(txToDelete)}
        title="Hapus Transaksi Kasir?"
        message={`Apakah Anda yakin ingin menghapus data transaksi ${txToDelete?.invoiceNumber} (${txToDelete?.customer.name})? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus Transaksi"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setTxToDelete(null)}
      />
    </div>
  );
};
