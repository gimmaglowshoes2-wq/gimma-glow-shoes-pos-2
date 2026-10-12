import React, { useState, useMemo } from 'react';
import {
  TrendingDown,
  Plus,
  Trash2,
  Calendar,
  Filter,
  DollarSign,
  FileSpreadsheet,
  AlertCircle,
  Tag,
  Receipt,
} from 'lucide-react';
import { Expense } from '../../types';
import { formatRupiah, formatDateOnly } from '../../utils/formatters';
import { ConfirmModal } from '../common/ConfirmModal';

interface ExpensesViewProps {
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onExportCSV: () => void;
}

const EXPENSE_CATEGORIES: Expense['category'][] = [
  'Sabun & Bahan Kimia',
  'Kemasan & Plastik',
  'Listrik & Air',
  'Gaji & Uang Makan',
  'Sewa & Pemeliharaan',
  'Peralatan & Tools',
  'Lain-lain',
];

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  onAddExpense,
  onDeleteExpense,
  onExportCSV,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  // New Expense Form State
  const [date, setDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
  });
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Expense['category']>('Sabun & Bahan Kimia');
  const [amountInput, setAmountInput] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (selectedCategory !== 'all' && e.category !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [expenses, selectedCategory]);

  const totalFiltered = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  // Breakdown by category
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return map;
  }, [expenses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const parsedAmount = parseInt(amountInput.replace(/\D/g, ''), 10);
    if (!title.trim()) {
      setErrorMsg('Nama/keterangan pengeluaran wajib diisi.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Jumlah pengeluaran harus lebih besar dari 0.');
      return;
    }

    const newExp: Expense = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date,
      title: title.trim(),
      category,
      amount: parsedAmount,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    onAddExpense(newExp);

    // Reset Form
    setTitle('');
    setAmountInput('');
    setNotes('');
    setIsAdding(false);
  };

  const confirmDelete = () => {
    if (expenseToDelete) {
      onDeleteExpense(expenseToDelete.id);
      setExpenseToDelete(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Expense Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Seluruh Biaya
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-700 tracking-tight">
            {formatRupiah(expenses.reduce((a, b) => a + b.amount, 0))}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {expenses.length} catatan pengeluaran operasional
          </p>
        </div>

        {/* Highest Category */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Alokasi Terbesar
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
          </div>
          {Object.entries(categoryBreakdown).length > 0 ? (
            (() => {
              const sorted = Object.entries(categoryBreakdown).sort(
                ([, a], [, b]) => b - a
              );
              return (
                <div>
                  <div className="text-lg font-bold text-slate-900 truncate">
                    {sorted[0][0]}
                  </div>
                  <p className="text-xs text-amber-700 font-semibold mt-1">
                    {formatRupiah(sorted[0][1])}
                  </p>
                </div>
              );
            })()
          ) : (
            <p className="text-xs text-slate-400 mt-2">Belum ada pengeluaran</p>
          )}
        </div>

        {/* Action Button Card */}
        <div className="bg-[#12372A] p-5 rounded-2xl shadow-md text-white flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-base font-brand text-[#C9A34E]">
              Catat Biaya Toko
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              Catat sabun, packaging, dan listrik agar laporan laba bersih akurat.
            </p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="mt-3 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#C9A34E] hover:bg-[#b8913b] text-[#12372A] font-bold text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Pengeluaran Baru
          </button>
        </div>
      </div>

      {/* Add Expense Modal / Slide */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Catat Pengeluaran Operasional
                    </h3>
                    <p className="text-xs text-slate-500">
                      Masukkan rincian biaya yang dikeluarkan toko
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAdding(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {errorMsg && (
                <div className="mt-4 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2 border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Tanggal Pengeluaran
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Kategori Biaya
                    </label>
                    <select
                      value={category}
                      onChange={(e) =>
                        setCategory(e.target.value as Expense['category'])
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                    >
                      {EXPENSE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Keterangan / Nama Pengeluaran *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Beli Sabun Cuci Sepatu 5 Liter / Mika Box"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Nominal Biaya (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 150000"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Catatan Tambahan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Pembelian di Toko Kimia Jaya"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#12372A] hover:bg-[#0c241c] text-[#C9A34E] font-bold shadow-xs"
                  >
                    Simpan Pengeluaran
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Expense List Header & Filter */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Daftar Pengeluaran Toko
            </h3>
            <p className="text-xs text-slate-500">
              Menampilkan {filteredExpenses.length} catatan pengeluaran (Total:{' '}
              <strong className="text-rose-600">{formatRupiah(totalFiltered)}</strong>)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Ekspor CSV
            </button>
          </div>
        </div>

        {/* Filter Category */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-bold flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Kategori:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[#12372A] text-[#C9A34E]'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({expenses.length})
          </button>
          {EXPENSE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#12372A] text-[#C9A34E]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Receipt className="w-12 h-12 mx-auto opacity-30 mb-2" />
            <p className="font-semibold text-sm">Belum ada pengeluaran dicatat</p>
            <p className="text-xs text-slate-400 mt-1">
              Gunakan tombol "Tambah Pengeluaran Baru" untuk mencatat pengeluaran.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F5EF] text-slate-600 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Catatan</th>
                  <th className="py-3 px-4 text-right">Nominal</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-600">
                      {formatDateOnly(exp.date)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {exp.title}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {exp.notes || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-rose-600 whitespace-nowrap text-sm">
                      {formatRupiah(exp.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setExpenseToDelete(exp)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                        title="Hapus Biaya"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
        isOpen={Boolean(expenseToDelete)}
        title="Hapus Catatan Biaya?"
        message={`Apakah Anda yakin ingin menghapus catatan biaya "${expenseToDelete?.title}" senilai ${formatRupiah(
          expenseToDelete?.amount || 0
        )}?`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setExpenseToDelete(null)}
      />
    </div>
  );
};
