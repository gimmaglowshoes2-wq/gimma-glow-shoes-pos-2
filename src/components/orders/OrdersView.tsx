import React, { useState, useMemo } from 'react';
import {
  Search,
  Footprints,
  Clock,
  CheckCircle,
  Package,
  MessageCircle,
  Eye,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Transaction, OrderStatus, StoreProfile } from '../../types';
import {
  formatRupiah,
  formatDateTime,
  getWhatsAppUrl,
  createWhatsAppMessage,
} from '../../utils/formatters';
import { StatusBadge } from '../common/Badge';

interface OrdersViewProps {
  transactions: Transaction[];
  storeProfile: StoreProfile;
  onUpdateStatus: (transactionId: string, nextStatus: OrderStatus) => void;
  onViewReceipt: (tx: Transaction) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  transactions,
  storeProfile,
  onUpdateStatus,
  onViewReceipt,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'Semua'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Status counters
  const counts = useMemo(() => {
    return {
      Semua: transactions.length,
      Menunggu: transactions.filter((t) => t.orderStatus === 'Menunggu').length,
      Diproses: transactions.filter((t) => t.orderStatus === 'Diproses').length,
      Selesai: transactions.filter((t) => t.orderStatus === 'Selesai').length,
      Diambil: transactions.filter((t) => t.orderStatus === 'Diambil').length,
    };
  }, [transactions]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return transactions.filter((t) => {
      const matchStatus =
        selectedStatus === 'Semua' ? true : t.orderStatus === selectedStatus;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        t.invoiceNumber.toLowerCase().includes(q) ||
        t.customer.name.toLowerCase().includes(q) ||
        (t.customer.whatsapp || '').includes(q) ||
        (t.customer.shoeBrand || '').toLowerCase().includes(q) ||
        t.items.some((i) => i.item.name.toLowerCase().includes(q));

      return matchStatus && matchSearch;
    });
  }, [transactions, selectedStatus, searchQuery]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Filter Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-x-auto">
          {(['Semua', 'Menunggu', 'Diproses', 'Selesai', 'Diambil'] as const).map(
            (status) => {
              const isSelected = selectedStatus === status;
              const count = counts[status];
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#12372A] text-[#C9A34E] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{status}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isSelected
                        ? 'bg-[#C9A34E] text-[#12372A]'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            }
          )}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px] md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nota, pelanggan, atau merk sepatu..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#12372A]/20 focus:border-[#12372A] transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Orders Grid / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <Footprints className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <h4 className="font-bold text-slate-700 text-base">Tidak ada pesanan ditemukan</h4>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery
              ? 'Coba ganti kata kunci pencarian.'
              : 'Belum ada pesanan dengan status ini.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((order) => {
            const isReady = order.orderStatus === 'Selesai';
            const isFinished = order.orderStatus === 'Diambil';

            const waMsg = createWhatsAppMessage(
              order,
              storeProfile,
              isReady ? 'ready' : isFinished ? 'picked' : 'received'
            );
            const waUrl = getWhatsAppUrl(order.customer.whatsapp, waMsg);

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                {/* Header Card */}
                <div>
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-900 block">
                        #{order.invoiceNumber}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatDateTime(order.createdAt)}
                      </span>
                    </div>
                    <StatusBadge status={order.orderStatus} size="sm" />
                  </div>

                  {/* Customer & Shoe Specs */}
                  <div className="mt-3 space-y-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {order.customer.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        WA: {order.customer.whatsapp || 'Tidak ada nomor'}
                      </p>
                    </div>

                    <div className="bg-[#F7F5EF] p-3 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span className="flex items-center gap-1.5 text-[#12372A]">
                          <Footprints className="w-3.5 h-3.5" />
                          <span>{order.customer.shoeBrand || 'Sepatu Tanpa Merk'}</span>
                        </span>
                        <span className="text-[11px] text-slate-500 font-normal">
                          {order.customer.shoeType}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600">
                        <span className="text-slate-400">Kondisi:</span>{' '}
                        {order.customer.shoeCondition}
                      </div>

                      {order.customer.specialNotes && (
                        <div className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200 italic">
                          " {order.customer.specialNotes} "
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200 text-slate-500">
                        <span>Estimasi Pengerjaan:</span>
                        <span className="font-bold text-[#12372A]">
                          {order.customer.estimatedCompletionDays} Hari Kerja
                        </span>
                      </div>
                    </div>

                    {/* Ordered Items List */}
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Layanan & Produk:
                      </span>
                      <div className="space-y-1">
                        {order.items.map((i) => (
                          <div
                            key={i.cartItemId}
                            className="flex items-center justify-between text-xs text-slate-700"
                          >
                            <span className="font-medium">
                              • {i.item.name} <span className="text-slate-400">x{i.quantity}</span>
                            </span>
                            <span className="font-semibold text-slate-900">
                              {formatRupiah((i.customPrice ?? i.item.price) * i.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Card: Total & Next Actions */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Total Biaya</span>
                      <span className="text-sm font-extrabold text-[#12372A]">
                        {formatRupiah(order.total)}
                      </span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                      {order.paymentMethod} • LUNAS
                    </span>
                  </div>

                  {/* Status Progression Buttons */}
                  <div className="flex items-center gap-1.5">
                    {order.orderStatus === 'Menunggu' && (
                      <button
                        onClick={() => onUpdateStatus(order.id, 'Diproses')}
                        className="flex-1 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Mulai Cuci</span>
                      </button>
                    )}

                    {order.orderStatus === 'Diproses' && (
                      <button
                        onClick={() => onUpdateStatus(order.id, 'Selesai')}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Tandai Selesai</span>
                      </button>
                    )}

                    {order.orderStatus === 'Selesai' && (
                      <button
                        onClick={() => onUpdateStatus(order.id, 'Diambil')}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#12372A] hover:bg-[#0d2a20] text-[#C9A34E] font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Tandai Diambil</span>
                      </button>
                    )}

                    {order.orderStatus === 'Diambil' && (
                      <span className="flex-1 py-2 text-center text-xs font-semibold text-slate-500 bg-slate-100 rounded-xl">
                        Pesanan Selesai & Diambil
                      </span>
                    )}

                    {/* WhatsApp notification action */}
                    {order.customer.whatsapp && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                        title={
                          isReady
                            ? 'Kabari Pelanggan Sepatu Sudah Selesai'
                            : 'Kirim Pesan WhatsApp'
                        }
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}

                    {/* View Receipt */}
                    <button
                      onClick={() => onViewReceipt(order)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Lihat Struk"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
