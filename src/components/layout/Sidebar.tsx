import React from 'react';
import {
  LayoutDashboard,
  Calculator,
  Footprints,
  History,
  TrendingDown,
  BarChart3,
  Tag,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';
import { StoreProfile } from '../../types';

export type NavTab = 
  | 'dashboard'
  | 'pos'
  | 'orders'
  | 'history'
  | 'expenses'
  | 'reports'
  | 'catalog'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeOrdersCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  storeProfile: StoreProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeOrdersCount,
  isOpenMobile,
  onCloseMobile,
  storeProfile,
}) => {
  const menuItems: { id: NavTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'Kasir POS', icon: Calculator },
    { id: 'orders', label: 'Pesanan Sepatu', icon: Footprints, badge: activeOrdersCount },
    { id: 'history', label: 'Riwayat Transaksi', icon: History },
    { id: 'expenses', label: 'Biaya Operasional', icon: TrendingDown },
    { id: 'reports', label: 'Laporan Keuangan', icon: BarChart3 },
    { id: 'catalog', label: 'Daftar Harga & Stok', icon: Tag },
    { id: 'settings', label: 'Pengaturan & Backup', icon: Settings },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#12372A] text-slate-100 flex flex-col border-r border-[#1e4d3c] shadow-xl lg:shadow-none transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#1c4d3c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C9A34E] to-[#b38936] text-[#12372A] flex items-center justify-center font-extrabold text-lg shadow-md ring-2 ring-[#C9A34E]/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white leading-tight font-brand">
                {storeProfile.name}
              </h1>
              <p className="text-[11px] text-[#C9A34E] font-medium tracking-wide">
                SHOE CARE POS
              </p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all group ${
                  isActive
                    ? 'bg-[#C9A34E] text-[#12372A] shadow-md shadow-black/10'
                    : 'text-slate-200 hover:bg-[#1a4737] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-[#12372A]' : 'text-[#C9A34E]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {Boolean(item.badge && item.badge > 0) && (
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      isActive
                        ? 'bg-[#12372A] text-[#C9A34E]'
                        : 'bg-[#C9A34E] text-[#12372A]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-[#1c4d3c] bg-[#0d2a20]/60">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <div>
              <span className="block font-semibold text-white">Firebase Cloud</span>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Sinkron Realtime Aktif
              </span>
            </div>
            <span className="text-[10px] px-2 py-1 bg-white/10 rounded-md font-mono text-[#C9A34E]">
              Cloud v1.0
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
