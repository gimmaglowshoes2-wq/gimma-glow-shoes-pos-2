import React, { useState } from 'react';
import {
  Settings,
  Store,
  Download,
  Upload,
  FileSpreadsheet,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Database,
  Cloud,
  Save,
  UserCheck,
} from 'lucide-react';
import { StoreProfile } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';

interface SettingsViewProps {
  storeProfile: StoreProfile;
  cashierName: string;
  onSaveProfile: (profile: StoreProfile) => void;
  onSaveCashierName: (name: string) => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  onExportTransactionsCSV: () => void;
  onExportExpensesCSV: () => void;
  onClearAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  storeProfile,
  cashierName,
  onSaveProfile,
  onSaveCashierName,
  onExportJSON,
  onImportJSON,
  onExportTransactionsCSV,
  onExportExpensesCSV,
  onClearAllData,
}) => {
  // Store profile editable state
  const [profile, setProfile] = useState<StoreProfile>(storeProfile);
  const [activeCashier, setActiveCashier] = useState(cashierName);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(profile);
    onSaveCashierName(activeCashier);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJSON(file);
      e.target.value = '';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Settings Form */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#12372A]/10 text-[#12372A]">
              <Store className="w-5 h-5 text-[#12372A]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Profil Toko & Struk Cetak
              </h2>
              <p className="text-xs text-slate-500">
                Informasi ini akan tertera pada struk cetak dan template chat WhatsApp
              </p>
            </div>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              Tersimpan!
            </div>
          )}
        </div>

        <form onSubmit={handleSaveAll} className="mt-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Nama Bisnis / Brand
              </label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Tagline / Slogan
              </label>
              <input
                type="text"
                value={profile.tagline}
                onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                No. WhatsApp Toko
              </label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Akun Instagram
              </label>
              <input
                type="text"
                value={profile.instagram}
                onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Nama Kasir Aktif
              </label>
              <input
                type="text"
                value={activeCashier}
                onChange={(e) => setActiveCashier(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Alamat Lengkap Toko
            </label>
            <input
              type="text"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Pesan Footer Struk (Ucapan Terima Kasih)
            </label>
            <input
              type="text"
              value={profile.receiptFooterMessage}
              onChange={(e) =>
                setProfile({ ...profile, receiptFooterMessage: e.target.value })
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#12372A] hover:bg-[#0c241c] text-[#C9A34E] font-bold text-xs shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              Simpan Profil Toko
            </button>
          </div>
        </form>
      </div>

      {/* Backup and Data Export/Import */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup & Restore JSON */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Cadangan Lengkap Sistem (JSON)
              </h3>
              <p className="text-xs text-slate-500">
                Ekspor dan impor seluruh data transaksi, katalog, biaya, dan profil
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Data tersimpan secara aman di peramban (browser) ini. Unduh file cadangan secara berkala agar Anda dapat memulihkannya kapan saja atau memindahkannya ke komputer lain.
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              onClick={onExportJSON}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#12372A] hover:bg-[#0c241c] text-[#C9A34E] font-bold text-xs shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              Unduh Backup JSON
            </button>

            <label className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer transition-colors text-center">
              <Upload className="w-4 h-4 text-slate-500" />
              <span>Pulihkan (Impor JSON)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* CSV Spreadsheets */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Ekspor Lembar Kerja (Excel / CSV)
              </h3>
              <p className="text-xs text-slate-500">
                Laporan spreadsheet untuk akuntansi dan pembukuan eksternal
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Unduh data transaksi kasir dan catatan biaya operasional dalam format tabel CSV yang kompatibel dengan Microsoft Excel, Google Sheets, dan aplikasi akuntansi.
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              onClick={onExportTransactionsCSV}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              CSV Transaksi Kasir
            </button>

            <button
              onClick={onExportExpensesCSV}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              CSV Biaya Operasional
            </button>
          </div>
        </div>
      </div>

      {/* Cloud Architecture Info & Reset */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
            <Cloud className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Status Sinkronisasi Firebase Firestore Cloud
            </h3>
            <p className="text-xs text-slate-500">
              Data transaksi, katalog, dan laporan tersinkronisasi otomatis antarperangkat
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 text-xs text-emerald-900 leading-relaxed space-y-1.5">
          <p>
            • <strong>Sinkronisasi Realtime:</strong> Setiap transaksi baru, update status cuci sepatu, penambahan pengeluaran, dan perubahan harga langsung diperbarui secara langsung (real-time) ke seluruh perangkat staf kasir lainnya melalui Firebase Firestore.
          </p>
          <p>
            • <strong>Akses Multi-Perangkat:</strong> Kasir dapat membuka aplikasi di laptop kasir, tablet meja counter, atau HP kurir dengan akun Google terdaftar, dan data langsung tersinkronisasi tanpa jeda.
          </p>
        </div>

        {/* Danger Zone: Clear Data */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-rose-700">Zona Berbahaya: Reset Seluruh Data</h4>
            <p className="text-[11px] text-slate-400">
              Hapus semua riwayat transaksi kasir dan catatan biaya yang tersimpan di perangkat ini.
            </p>
          </div>
          <button
            onClick={() => setIsClearConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Reset Data Transaksi
          </button>
        </div>
      </div>

      {/* Confirm Clear Modal */}
      <ConfirmModal
        isOpen={isClearConfirmOpen}
        title="Reset Semua Data Transaksi?"
        message="PERINGATAN: Semua riwayat transaksi kasir dan catatan pengeluaran akan dihapus bersih dari perangkat ini. Tindakan ini tidak dapat dibatalkan. Pastikan Anda telah mengunduh backup JSON jika masih membutuhkan arsip."
        confirmLabel="Ya, Hapus Bersih"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={() => {
          onClearAllData();
          setIsClearConfirmOpen(false);
        }}
        onCancel={() => setIsClearConfirmOpen(false)}
      />
    </div>
  );
};
