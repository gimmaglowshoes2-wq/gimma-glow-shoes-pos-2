import React, { useEffect, useState } from 'react';
import { Menu, Plus, User as UserIcon, Calendar, Clock, Cloud, LogOut, Shield } from 'lucide-react';
import { NavTab } from './Sidebar';
import { User } from 'firebase/auth';
import { UserRole } from '../../context/AuthContext';

interface HeaderProps {
  currentTab: NavTab;
  onOpenMobile: () => void;
  onNewTransaction: () => void;
  cashierName: string;
  userRole?: UserRole;
  currentUser?: User | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobile,
  onNewTransaction,
  cashierName,
  userRole = 'cashier',
  currentUser,
  onLogout,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Ringkasan Dashboard',
      subtitle: 'Pantau kinerja penjualan, omzet harian, dan alur pengerjaan sepatu',
    },
    pos: {
      title: 'Kasir & Buat Transaksi',
      subtitle: 'Pilih layanan cuci, produk perawatan, dan proses pembayaran',
    },
    orders: {
      title: 'Manajemen Pesanan Sepatu',
      subtitle: 'Pantau status pengerjaan: Menunggu, Diproses, Selesai, hingga Diambil',
    },
    history: {
      title: 'Riwayat Transaksi',
      subtitle: 'Daftar semua transaksi yang tersimpan di cloud, filter tanggal, dan cetak ulang struk',
    },
    expenses: {
      title: 'Biaya Operasional & Pengeluaran',
      subtitle: 'Catat bahan kimia, sabun, kemasan, dan biaya toko untuk hitung laba bersih',
    },
    reports: {
      title: 'Laporan Keuangan & Estimasi Laba',
      subtitle: 'Analisis omzet harian, mingguan, bulanan, dan estimasi profitabilitas',
    },
    catalog: {
      title: 'Katalog & Daftar Harga Cloud',
      subtitle: 'Kelola harga layanan treatment sepatu dan stok produk shoe care secara realtime',
    },
    settings: {
      title: 'Pengaturan & Cadangan Data',
      subtitle: 'Profil toko, backup/restore data JSON, dan ekspor CSV',
    },
  };

  const currentInfo = titles[currentTab] || titles.dashboard;

  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(currentTime);

  const formattedTime = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(currentTime);

  const displayName = currentUser?.displayName || cashierName || 'Kasir';

  return (
    <header className="sticky top-0 z-30 bg-[#F7F5EF] border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 backdrop-blur-md bg-opacity-95">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobile}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Buka navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight">
              {currentInfo.title}
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              {currentInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right Side: Status, Date/Time, User Badge & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Cloud Sync Status Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/70 rounded-xl text-xs font-semibold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cloud Realtime</span>
          </div>

          {/* Live Clock (Hidden on small mobile) */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-200/70 text-xs text-slate-600 shadow-2xs">
            <span className="flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#12372A]" />
              {formattedDate}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="flex items-center gap-1 font-semibold text-slate-800">
              <Clock className="w-3.5 h-3.5 text-[#C9A34E]" />
              {formattedTime}
            </span>
          </div>

          {/* Staff User & Role Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs shadow-2xs">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={displayName}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-[#C9A34E]"
              />
            ) : (
              <UserIcon className="w-4 h-4 text-[#C9A34E]" />
            )}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-800 max-w-[120px] truncate">
                {displayName}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                  userRole === 'admin'
                    ? 'bg-[#12372A] text-[#C9A34E]'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {userRole === 'admin' ? 'Admin' : 'Kasir'}
              </span>
            </div>
          </div>

          {/* New Transaction Button */}
          {currentTab !== 'pos' && (
            <button
              onClick={onNewTransaction}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#12372A] hover:bg-[#0d2a20] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#C9A34E]" />
              <span className="hidden sm:inline">Transaksi Baru</span>
            </button>
          )}

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
              title="Keluar (Logout)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
