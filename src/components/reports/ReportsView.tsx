import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Calendar,
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Percent,
} from 'lucide-react';
import { Transaction, Expense } from '../../types';
import { formatRupiah, formatNumber } from '../../utils/formatters';

interface ReportsViewProps {
  transactions: Transaction[];
  expenses: Expense[];
}

type PeriodMode = 'daily' | 'weekly' | 'monthly';

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  expenses,
}) => {
  const [periodMode, setPeriodMode] = useState<PeriodMode>('monthly');

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;

  // Filter transactions & expenses based on active period
  const { filteredTx, filteredExp, periodLabel } = useMemo(() => {
    if (periodMode === 'daily') {
      const fTx = transactions.filter((t) => {
        const d = new Date(t.createdAt);
        const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
          d.getDate()
        ).padStart(2, '0')}`;
        return str === todayStr;
      });

      const fExp = expenses.filter((e) => e.date === todayStr);
      return {
        filteredTx: fTx,
        filteredExp: fExp,
        periodLabel: 'Hari Ini (Daily)',
      };
    }

    if (periodMode === 'weekly') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);

      const fTx = transactions.filter((t) => new Date(t.createdAt) >= sevenDaysAgo);
      const fExp = expenses.filter((e) => new Date(e.date) >= sevenDaysAgo);

      return {
        filteredTx: fTx,
        filteredExp: fExp,
        periodLabel: '7 Hari Terakhir (Weekly)',
      };
    }

    // monthly (current month)
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const fTx = transactions.filter((t) => {
      const d = new Date(t.createdAt);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const fExp = expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const monthName = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(now);
    return {
      filteredTx: fTx,
      filteredExp: fExp,
      periodLabel: `Bulan Ini (${monthName})`,
    };
  }, [transactions, expenses, periodMode, todayStr]);

  // Calculations
  const grossRevenue = useMemo(() => {
    return filteredTx.reduce((acc, t) => acc + t.total, 0);
  }, [filteredTx]);

  const totalDiscount = useMemo(() => {
    return filteredTx.reduce((acc, t) => acc + (t.discount || 0), 0);
  }, [filteredTx]);

  // Estimasi HPP / Bahan
  const estimatedMaterialCost = useMemo(() => {
    return filteredTx.reduce((totalCost, tx) => {
      const txCost = tx.items.reduce((cost, item) => {
        const itemHPP = item.item.costEstimate || 0;
        return cost + itemHPP * item.quantity;
      }, 0);
      return totalCost + txCost;
    }, 0);
  }, [filteredTx]);

  // Total Biaya Operasional
  const totalOperationalExpenses = useMemo(() => {
    return filteredExp.reduce((acc, e) => acc + e.amount, 0);
  }, [filteredExp]);

  // Estimasi Laba Bersih
  const estimatedNetProfit = grossRevenue - estimatedMaterialCost - totalOperationalExpenses;

  // Margin Laba Bersih
  const netProfitMargin =
    grossRevenue > 0 ? Math.round((estimatedNetProfit / grossRevenue) * 100) : 0;

  // Breakdown by payment method
  const paymentMethodBreakdown = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {
      Tunai: { count: 0, total: 0 },
      QRIS: { count: 0, total: 0 },
      Transfer: { count: 0, total: 0 },
      Debit: { count: 0, total: 0 },
    };

    filteredTx.forEach((tx) => {
      if (map[tx.paymentMethod]) {
        map[tx.paymentMethod].count += 1;
        map[tx.paymentMethod].total += tx.total;
      }
    });

    return map;
  }, [filteredTx]);

  // Revenue by Category (Layanan vs Produk vs Paket)
  const categoryRevenue = useMemo(() => {
    let service = 0;
    let product = 0;
    let pkg = 0;

    filteredTx.forEach((tx) => {
      tx.items.forEach((it) => {
        const val = (it.customPrice ?? it.item.price) * it.quantity;
        if (it.item.category === 'service') service += val;
        else if (it.item.category === 'product') product += val;
        else if (it.item.category === 'package') pkg += val;
      });
    });

    return { service, product, pkg };
  }, [filteredTx]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header & Period Filter */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Laporan Keuangan & Estimasi Laba
          </h2>
          <p className="text-xs text-slate-500">
            Periode aktif: <strong className="text-[#12372A]">{periodLabel}</strong>
          </p>
        </div>

        {/* Toggle Period */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">
          <button
            onClick={() => setPeriodMode('daily')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              periodMode === 'daily'
                ? 'bg-[#12372A] text-[#C9A34E] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Harian
          </button>
          <button
            onClick={() => setPeriodMode('weekly')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              periodMode === 'weekly'
                ? 'bg-[#12372A] text-[#C9A34E] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mingguan (7 Hari)
          </button>
          <button
            onClick={() => setPeriodMode('monthly')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              periodMode === 'monthly'
                ? 'bg-[#12372A] text-[#C9A34E] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bulanan
          </button>
        </div>
      </div>

      {/* Financial Statement Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Pendapatan Kotor */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Omzet / Pendapatan
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {formatRupiah(grossRevenue)}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {filteredTx.length} transaksi selesai
          </p>
        </div>

        {/* 2. Estimasi Biaya Bahan / HPP */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Estimasi Biaya Bahan / HPP
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-900 tracking-tight">
            {formatRupiah(estimatedMaterialCost)}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Biaya sabun cuci & modal produk
          </p>
        </div>

        {/* 3. Biaya Operasional */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Biaya Operasional Toko
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-700 tracking-tight">
            {formatRupiah(totalOperationalExpenses)}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {filteredExp.length} pengeluaran tercatat
          </p>
        </div>

        {/* 4. Estimasi Laba Bersih */}
        <div
          className={`p-5 rounded-2xl border shadow-2xs ${
            estimatedNetProfit >= 0
              ? 'bg-[#12372A] text-white border-[#1c4d3c]'
              : 'bg-rose-950 text-white border-rose-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#C9A34E] uppercase tracking-wider">
              Estimasi Laba Bersih
            </span>
            <div className="w-9 h-9 rounded-xl bg-white/10 text-[#C9A34E] flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#C9A34E] tracking-tight">
            {formatRupiah(estimatedNetProfit)}
          </div>
          <p className="text-xs text-slate-300 mt-1 flex items-center gap-1 font-medium">
            <Percent className="w-3.5 h-3.5 text-[#C9A34E]" />
            <span>Margin Laba: {netProfitMargin}%</span>
          </p>
        </div>
      </div>

      {/* P&L Statement Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
        <h3 className="font-bold text-slate-900 text-base mb-4">
          Rincian Laba & Rugi (P&L Breakdown)
        </h3>

        <div className="space-y-3 font-mono text-xs">
          <div className="flex justify-between py-2 border-b border-slate-100 font-bold text-slate-800">
            <span>(+) Total Pendapatan Penjualan (Gross Revenue)</span>
            <span>{formatRupiah(grossRevenue + totalDiscount)}</span>
          </div>

          {totalDiscount > 0 && (
            <div className="flex justify-between py-1 text-rose-600">
              <span className="pl-4">(-) Total Diskon & Potongan</span>
              <span>-{formatRupiah(totalDiscount)}</span>
            </div>
          )}

          <div className="flex justify-between py-2 border-b border-slate-100 font-semibold text-slate-700">
            <span>= Pendapatan Bersih Kasir (Net Revenue)</span>
            <span>{formatRupiah(grossRevenue)}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100 text-amber-800">
            <span>(-) Estimasi Beban Pokok / Bahan Treatment & Produk</span>
            <span>-{formatRupiah(estimatedMaterialCost)}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100 text-rose-700">
            <span>(-) Beban Operasional (Listrik, Packaging, Gaji, dll)</span>
            <span>-{formatRupiah(totalOperationalExpenses)}</span>
          </div>

          <div className="flex justify-between py-3 border-t-2 border-slate-900 text-sm font-extrabold text-[#12372A]">
            <span>(=) ESTIMASI LABA BERSIH (NET PROFIT)</span>
            <span className="text-base font-black">{formatRupiah(estimatedNetProfit)}</span>
          </div>
        </div>
      </div>

      {/* Side-by-side breakdowns: Payment Method vs Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <h3 className="font-bold text-slate-900 text-base mb-3">
            Komposisi Metode Pembayaran
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Rincian penerimaan berdasarkan uang tunai dan non-tunai
          </p>

          <div className="space-y-3">
            {Object.entries(paymentMethodBreakdown).map(([method, data]) => {
              const pct = grossRevenue > 0 ? Math.round((data.total / grossRevenue) * 100) : 0;
              return (
                <div key={method} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">
                      {method} ({data.count} transaksi)
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatRupiah(data.total)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#12372A] h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Streams: Services vs Products */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <h3 className="font-bold text-slate-900 text-base mb-3">
            Proporsi Pendapatan Toko
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Perbandingan pemasukan jasa cuci versus produk shoe care
          </p>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Layanan Cuci Satuan</span>
                <span className="font-bold text-slate-900">
                  {formatRupiah(categoryRevenue.service)}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#12372A] h-2 rounded-full"
                  style={{
                    width: `${
                      grossRevenue > 0
                        ? Math.round((categoryRevenue.service / grossRevenue) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Paket Hemat Combo</span>
                <span className="font-bold text-slate-900">
                  {formatRupiah(categoryRevenue.pkg)}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#C9A34E] h-2 rounded-full"
                  style={{
                    width: `${
                      grossRevenue > 0
                        ? Math.round((categoryRevenue.pkg / grossRevenue) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Penjualan Produk Shoe Care</span>
                <span className="font-bold text-slate-900">
                  {formatRupiah(categoryRevenue.product)}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 rounded-full"
                  style={{
                    width: `${
                      grossRevenue > 0
                        ? Math.round((categoryRevenue.product / grossRevenue) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
