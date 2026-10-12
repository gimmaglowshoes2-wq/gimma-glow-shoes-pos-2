import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Package,
} from 'lucide-react';
import { CatalogItem, ItemCategory } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { ConfirmModal } from '../common/ConfirmModal';

interface CatalogManagementViewProps {
  catalogItems: CatalogItem[];
  onSaveItem: (item: CatalogItem) => Promise<void> | void;
  onDeleteItem: (id: string) => Promise<void> | void;
  onResetCatalog: () => Promise<void> | void;
}

export const CatalogManagementView: React.FC<CatalogManagementViewProps> = ({
  catalogItems,
  onSaveItem,
  onDeleteItem,
  onResetCatalog,
}) => {
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CatalogItem | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | ItemCategory>('all');

  // Form State
  const [formData, setFormData] = useState<Partial<CatalogItem>>({
    name: '',
    category: 'service',
    price: 50000,
    costEstimate: 10000,
    description: '',
    duration: '2 - 3 Hari',
    stock: 10,
    badge: '',
    isActive: true,
  });
  const [errorMsg, setErrorMsg] = useState('');

  const filtered = catalogItems.filter((i) => {
    if (filterCategory === 'all') return true;
    return i.category === filterCategory;
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      id: `item-${Date.now()}`,
      name: '',
      category: 'service',
      price: 50000,
      costEstimate: 10000,
      description: '',
      duration: '2 - 3 Hari',
      stock: 10,
      badge: '',
      isActive: true,
    });
    setErrorMsg('');
    setIsCreating(true);
  };

  const openEditModal = (item: CatalogItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setErrorMsg('');
    setIsCreating(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name?.trim()) {
      setErrorMsg('Nama layanan / produk wajib diisi.');
      return;
    }
    if ((formData.price || 0) <= 0) {
      setErrorMsg('Harga jual harus lebih besar dari 0.');
      return;
    }

    if (editingItem) {
      // Update existing
      const updatedItem = { ...editingItem, ...formData } as CatalogItem;
      onSaveItem(updatedItem);
    } else {
      // Create new
      const newItem: CatalogItem = {
        id: `item-${Date.now()}`,
        name: formData.name.trim(),
        category: formData.category || 'service',
        price: Number(formData.price) || 0,
        costEstimate: Number(formData.costEstimate) || 0,
        description: formData.description || '',
        duration: formData.duration,
        stock: formData.category === 'product' ? Number(formData.stock) || 0 : undefined,
        badge: formData.badge,
        isActive: formData.isActive ?? true,
      };
      onSaveItem(newItem);
    }

    setIsCreating(false);
  };

  const toggleItemActive = (id: string) => {
    const target = catalogItems.find((it) => it.id === id);
    if (target) {
      onSaveItem({ ...target, isActive: !target.isActive });
    }
  };

  const confirmDeleteItem = () => {
    if (itemToDelete) {
      onDeleteItem(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header and Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Katalog Layanan & Produk Toko
          </h2>
          <p className="text-xs text-slate-500">
            Atur tarif layanan cuci sepatu, paket bundling, dan stok produk shoe care
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Tarif Standar
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#12372A] hover:bg-[#0c241c] text-[#C9A34E] text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Item Baru
          </button>
        </div>
      </div>

      {/* Filter Category Tabs */}
      <div className="flex items-center gap-2 p-1 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-4 py-2 rounded-xl transition-all ${
            filterCategory === 'all'
              ? 'bg-[#12372A] text-[#C9A34E]'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Semua Item ({catalogItems.length})
        </button>
        <button
          onClick={() => setFilterCategory('service')}
          className={`px-4 py-2 rounded-xl transition-all ${
            filterCategory === 'service'
              ? 'bg-[#12372A] text-[#C9A34E]'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Layanan Cuci (Services)
        </button>
        <button
          onClick={() => setFilterCategory('package')}
          className={`px-4 py-2 rounded-xl transition-all ${
            filterCategory === 'package'
              ? 'bg-[#12372A] text-[#C9A34E]'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Paket Hemat
        </button>
        <button
          onClick={() => setFilterCategory('product')}
          className={`px-4 py-2 rounded-xl transition-all ${
            filterCategory === 'product'
              ? 'bg-[#12372A] text-[#C9A34E]'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Produk Retail
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F5EF] text-slate-600 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Layanan / Produk</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Deskripsi & Durasi</th>
                <th className="py-3 px-4 text-right">Harga Jual</th>
                <th className="py-3 px-4 text-right">Estimasi HPP/Modal</th>
                <th className="py-3 px-4 text-center">Status / Stok</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    !item.isActive ? 'opacity-60 bg-slate-50' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        item.category === 'service'
                          ? 'bg-sky-50 text-sky-800'
                          : item.category === 'package'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      {item.category === 'service'
                        ? 'Layanan'
                        : item.category === 'package'
                        ? 'Paket Bundling'
                        : 'Produk Retail'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs text-slate-500">
                    <p className="truncate">{item.description}</p>
                    {item.duration && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        ⏱ {item.duration}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-[#12372A] whitespace-nowrap text-sm">
                    {formatRupiah(item.price)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-amber-800 whitespace-nowrap">
                    {formatRupiah(item.costEstimate || 0)}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => toggleItemActive(item.id)}
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          item.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {item.isActive ? 'Aktif di Kasir' : 'Dinonaktifkan'}
                      </button>
                      {typeof item.stock === 'number' && (
                        <span className="text-[10px] text-slate-500 font-semibold">
                          Stok: {item.stock}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                        title="Edit Item"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setItemToDelete(item)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                        title="Hapus Item"
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
      </div>

      {/* Edit / Create Item Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-base">
                  {editingItem ? 'Edit Layanan / Produk' : 'Tambah Layanan / Produk Baru'}
                </h3>
                <button
                  onClick={() => setIsCreating(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {errorMsg && (
                <div className="mt-3 p-2.5 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2 border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveForm} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Nama Layanan / Produk *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Premium Suede Cleaning"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Kategori
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value as ItemCategory })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                    >
                      <option value="service">Layanan (Service)</option>
                      <option value="package">Paket Hemat (Package)</option>
                      <option value="product">Produk Shoe Care</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Badge Promosi (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Terlaris / Express"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Harga Jual (Rp) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Estimasi Modal / Bahan HPP (Rp)
                    </label>
                    <input
                      type="number"
                      value={formData.costEstimate}
                      onChange={(e) =>
                        setFormData({ ...formData, costEstimate: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Estimasi Durasi Pengerjaan
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 1 - 2 Hari"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                    />
                  </div>

                  {formData.category === 'product' && (
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Jumlah Stok Produk
                      </label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) =>
                          setFormData({ ...formData, stock: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Deskripsi Detail
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Deskripsi layanan atau spesifikasi produk..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-[#12372A]"
                  />
                  <label htmlFor="isActiveCheck" className="text-xs font-semibold text-slate-700">
                    Aktif dan tampilkan di katalog kasir
                  </label>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#12372A] hover:bg-[#0c241c] text-[#C9A34E] font-bold shadow-xs"
                  >
                    Simpan Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(itemToDelete)}
        title="Hapus Layanan / Produk?"
        message={`Apakah Anda yakin ingin menghapus "${itemToDelete?.name}" dari katalog kasir?`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={confirmDeleteItem}
        onCancel={() => setItemToDelete(null)}
      />

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Kembalikan Tarif Awal Standar?"
        message="Semua daftar harga layanan dan produk akan dikembalikan ke tarif bawaan standar Gimma Glow Shoes."
        confirmLabel="Ya, Reset Standar"
        cancelLabel="Batal"
        variant="warning"
        onConfirm={() => {
          onResetCatalog();
          setIsResetConfirmOpen(false);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
