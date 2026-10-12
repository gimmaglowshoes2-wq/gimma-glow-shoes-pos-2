import React, { useMemo } from 'react';
import {
  Wallet,
  ShoppingBag,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Footprints,
  Sparkles,
  ChevronRight,
  PlusCircle,
  Eye,
  Receipt,
  MessageCircle,
} from 'lucide-react';
import { Transaction, Expense, StoreProfile } from '../../types';
import { formatRupiah, formatDateTime, getWhatsAppUrl, createWhatsAppMessage } from '../../utils/formatters';
import { StatusBadge } from '../common/Badge';

interface DashboardViewProps {
  transactions: Transaction[];
  expenses: Expense[];
  storeProfile: StoreProfile;
  onNavigateToTab: (tab: any) => void;
  onViewReceipt: (tx: Transaction) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  expenses,
  storeProfile,
  onNavigateToTab,
  onViewReceipt,
}) => {
  // Current Date bounds
  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
  }, []);

  // Filter transactions today
  const todayTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const txDate = new Date(t.createdAt);
      const str = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(txDate.getDate()).padStart(2, '0')}`;
      return str === todayStr;
    });
  }, [transactions, todayStr]);

  // Today's Metrics
  const todayRevenue = useMemo(() => {
    return todayTransactions.reduce((acc, t) => acc + t.total, 0);
  }, [todayTransactions]);

  const todayTxCount = todayTransactions.length;

  const todayAvgTx = todayTxCount > 0 ? Math.round(todayRevenue / todayTxCount) : 0;

  // Active in-progress orders (Menunggu + Diproses)
  const activeOrdersCount = useMemo(() => {
    return transactions.filter(
      (t) => t.orderStatus === 'Menunggu' || t.orderStatus === 'Diproses'
    ).length;
  }, [transactions]);

  // Ready for pickup count
  const readyOrdersCount = useMemo(() => {
    return transactions.filter((t) => t.orderStatus === 'Selesai').length;
  }, [transactions]);

  // Recent 5 transactions
  const recentTransactions = useMemo(() => {
    return [...transactions].slice(0, 5);
  }, [transactions]);

  // 7-day revenue trend data
  const last7DaysData = useMemo(() => {
    const days: { dateLabel: string; revenue: number; count: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;

      const dayLabel = new Intl.DateTimeFormat('id-ID', {
        weekday: 'short',
        day: 'numeric',
      }).format(d);

      const dayRevenue = transactions
        .filter((t) => {
          const tDate = new Date(t.createdAt);
          const tStr = `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(
            2,
            '0'
          )}-${String(tDate.getDate()).padStart(2, '0')}`;
          return tStr === dayStr;
        })
        .reduce((sum, t) => sum + t.total, 0);

      days.push({
        dateLabel: dayLabel,
        revenue: dayRevenue,
        count: transactions.filter((t) => {
          const tDate = new Date(t.createdAt);
          const tStr = `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(
            2,
            '0'
          )}-${String(tDate.getDate()).padStart(2, '0')}`;
          return tStr === dayStr;
        }).length,
      });
    }

    return days;
  }, [transactions]);

  const maxRevenueIn7Days = Math.max(...last7DaysData.map((d) => d.revenue), 50000);

  // Top services / products
  const topItems = useMemo(() => {
    const counts: Record<string, { name: string; qty: number; revenue: number }> = {};
    transactions.forEach((tx) => {
      tx.items.forEach((item) => {
        const id = item.item.id;
        const price = item.customPrice ?? item.item.price;
        if (!counts[id]) {
          counts[id] = { name: item.item.name, qty: 0, revenue: 0 };
        }
        counts[id].qty += item.quantity;
        counts[id].revenue += price * item.quantity;
      });
    });
    return Object.values(counts)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 4);
  }, [transactions]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#12372A] via-[#164232] to-[#0e2c21] p-6 sm:p-8 text-white shadow-xl border border-[#225542]">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A34E]/20 text-[#C9A34E] text-xs font-bold border border-[#C9A34E]/30">
              <Sparkles className="w-3.5 h-3.5" />
              Sistem Operasional Cuci Sepatu Siap Digunakan
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-brand">
              Selamat Datang di {storeProfile.name}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Pantau arus kas kasir, status pencucian sepatu pelanggan, dan kinerja bisnis dalam satu dasbor terpadu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateToTab('pos')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#C9A34E] hover:bg-[#b8913b] text-[#12372A] font-extrabold text-sm shadow-lg shadow-black/20 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-[#12372A]" />
              Kasir Transaksi Baru
            </button>
            <button
              onClick={() => onNavigateToTab('orders')}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all"
            >
              <Footprints className="w-4 h-4 text-[#C9A34E]" />
              Pantau Pesanan ({activeOrdersCount})
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#C9A34E]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Required KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Omzet Hari Ini */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Omzet Hari Ini
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {formatRupiah(todayRevenue)}
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pendapatan kasir hari ini</span>
          </p>
        </div>

        {/* 2. Jumlah Transaksi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Jumlah Transaksi
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {todayTxCount} <span className="text-sm font-semibold text-slate-500">Nota</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
            <span>Total nota tercatat hari ini</span>
          </p>
        </div>

        {/* 3. Pesanan Diproses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pesanan Diproses
            </span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
              <Footprints className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {activeOrdersCount} <span className="text-sm font-semibold text-slate-500">Sepatu</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span>{readyOrdersCount} pesanan sudah selesai siap ambil</span>
          </p>
        </div>

        {/* 4. Rata-rata Transaksi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Rata-rata Transaksi
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {formatRupiah(todayAvgTx)}
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
            <span>Nilai belanja rata-rata per pelanggan</span>
          </p>
        </div>
      </div>

      {/* Middle Grid: Weekly Chart & Status Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Revenue Bar Graph (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Tren Penjualan 7 Hari Terakhir</h3>
              <p className="text-xs text-slate-500">Grafik omzet harian toko</p>
            </div>
            <button
              onClick={() => onNavigateToTab('reports')}
              className="text-xs font-bold text-[#12372A] hover:underline flex items-center gap-1"
            >
              Laporan Lengkap <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Bar Chart Visual */}
          <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-100">
            {last7DaysData.map((d, i) => {
              const heightPercent = maxRevenueIn7Days > 0 ? (d.revenue / maxRevenueIn7Days) * 100 : 0;
              const isToday = i === 6;

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-slate-900 text-white px-2 py-1 rounded whitespace-nowrap pointer-events-none mb-1 shadow-md">
                    {formatRupiah(d.revenue)} ({d.count} nota)
                  </div>
                  <div
                    className="w-full max-w-[42px] rounded-t-xl transition-all group-hover:opacity-80"
                    style={{
                      height: `${Math.max(6, heightPercent)}%`,
                      backgroundColor: isToday ? '#12372A' : '#C9A34E',
                    }}
                  />
                  <span
                    className={`text-[11px] font-semibold ${
                      isToday ? 'text-[#12372A] font-bold' : 'text-slate-500'
                    }`}
                  >
                    {d.dateLabel}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 px-2">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#C9A34E]" /> Hari Lalu
              <span className="w-3 h-3 rounded bg-[#12372A] ml-2" /> Hari Ini
            </span>
            <span>
              Total 7 Hari: <strong>{formatRupiah(last7DaysData.reduce((a, b) => a + b.revenue, 0))}</strong>
            </span>
          </div>
        </div>

        {/* Order Status Pipeline + Quick Shortcuts (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Order Status Overview */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base">Alur Pengerjaan Sepatu</h3>
              <button
                onClick={() => onNavigateToTab('orders')}
                className="text-xs text-[#12372A] font-bold hover:underline"
              >
                Lihat Pesanan
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => onNavigateToTab('orders')}
                className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 cursor-pointer hover:bg-amber-100/60 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800">Menunggu</span>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                </div>
                <div className="text-xl font-black text-amber-900 mt-2">
                  {transactions.filter((t) => t.orderStatus === 'Menunggu').length}
                </div>
                <span className="text-[10px] text-amber-700">Antrean pengerjaan</span>
              </div>

              <div
                onClick={() => onNavigateToTab('orders')}
                className="p-3.5 rounded-xl bg-sky-50/80 border border-sky-200 cursor-pointer hover:bg-sky-100/60 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-800">Diproses</span>
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                </div>
                <div className="text-xl font-black text-sky-900 mt-2">
                  {transactions.filter((t) => t.orderStatus === 'Diproses').length}
                </div>
                <span className="text-[10px] text-sky-700">Sedang dicuci / dirawat</span>
              </div>

              <div
                onClick={() => onNavigateToTab('orders')}
                className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 cursor-pointer hover:bg-emerald-100/60 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">Selesai</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="text-xl font-black text-emerald-900 mt-2">
                  {transactions.filter((t) => t.orderStatus === 'Selesai').length}
                </div>
                <span className="text-[10px] text-emerald-700">Siap diambil pelanggan</span>
              </div>

              <div
                onClick={() => onNavigateToTab('orders')}
                className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 cursor-pointer hover:bg-slate-200/60 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Diambil</span>
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                </div>
                <div className="text-xl font-black text-slate-900 mt-2">
                  {transactions.filter((t) => t.orderStatus === 'Diambil').length}
                </div>
                <span className="text-[10px] text-slate-500">Sudah diserahkan</span>
              </div>
            </div>
          </div>

          {/* Top Selling Services */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 shadow-2xs flex-1">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Layanan & Produk Paling Populer
            </h4>
            {topItems.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                Belum ada transaksi yang tercatat.
              </p>
            ) : (
              <div className="space-y-2.5">
                {topItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-5 h-5 rounded-full bg-[#12372A]/10 text-[#12372A] font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800 truncate">{item.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-[#12372A]">{item.qty}x</span>
                      <span className="text-[10px] text-slate-400 block">
                        {formatRupiah(item.revenue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Aktivitas Transaksi Terakhir</h3>
            <p className="text-xs text-slate-500">5 transaksi terbaru yang tercatat di kasir</p>
          </div>
          <button
            onClick={() => onNavigateToTab('history')}
            className="text-xs font-bold text-[#12372A] hover:underline flex items-center gap-1"
          >
            Lihat Semua Riwayat <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
            <Receipt className="w-8 h-8 mx-auto opacity-30 mb-2" />
            <p className="font-semibold text-xs">Belum ada transaksi</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Klik menu "Kasir POS" untuk memulai transaksi pertama Anda!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2">No. Invoice</th>
                  <th className="pb-3">Waktu</th>
                  <th className="pb-3">Pelanggan</th>
                  <th className="pb-3">Sepatu</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Metode</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.map((tx) => {
                  const waUrl = getWhatsAppUrl(
                    tx.customer.whatsapp,
                    createWhatsAppMessage(tx, storeProfile, 'received')
                  );

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 pl-2 font-mono font-bold text-slate-900">
                        {tx.invoiceNumber}
                      </td>
                      <td className="py-3 text-slate-500">{formatDateTime(tx.createdAt)}</td>
                      <td className="py-3 font-semibold text-slate-800">
                        {tx.customer.name}
                      </td>
                      <td className="py-3 text-slate-600">
                        <span className="font-medium text-slate-800">
                          {tx.customer.shoeBrand || tx.customer.shoeType}
                        </span>
                      </td>
                      <td className="py-3 font-extrabold text-[#12372A]">
                        {formatRupiah(tx.total)}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-semibold text-slate-700">
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3">
                        <StatusBadge status={tx.orderStatus} size="sm" />
                      </td>
                      <td className="py-3 pr-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {tx.customer.whatsapp && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Chat WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => onViewReceipt(tx)}
                            className="p-1.5 rounded-lg text-[#12372A] hover:bg-[#12372A]/10 transition-colors"
                            title="Lihat & Cetak Struk"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
