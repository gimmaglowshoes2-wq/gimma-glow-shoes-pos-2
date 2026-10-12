import React from 'react';
import { Transaction, StoreProfile } from '../../types';
import { formatRupiah, formatDateTime, getWhatsAppUrl, createWhatsAppMessage } from '../../utils/formatters';
import { Printer, MessageCircle, X, CheckCircle2, Copy, Download } from 'lucide-react';

interface ReceiptModalProps {
  transaction: Transaction | null;
  storeProfile: StoreProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  storeProfile,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = createWhatsAppMessage(transaction, storeProfile, 'received');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const waUrl = getWhatsAppUrl(
    transaction.customer.whatsapp,
    createWhatsAppMessage(transaction, storeProfile, 'received')
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="no-print bg-[#12372A] text-white px-5 py-4 flex items-center justify-between border-b border-[#1c4d3c]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C9A34E] flex items-center justify-center text-[#12372A] font-bold text-sm shadow-inner">
              GS
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">Struk Transaksi</h2>
              <p className="text-xs text-[#C9A34E] font-medium">#{transaction.invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Area */}
        <div className="p-4 sm:p-6 bg-slate-50 flex justify-center max-h-[70vh] overflow-y-auto">
          <div
            id="receipt-printable"
            className="w-full max-w-sm bg-white p-5 rounded-xl shadow-xs border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed"
          >
            {/* Header Toko */}
            <div className="text-center pb-4 border-b border-dashed border-slate-300">
              <div className="inline-block px-2.5 py-0.5 mb-1.5 bg-[#12372A] text-[#C9A34E] text-[11px] font-bold tracking-widest rounded uppercase">
                Shoe Care Specialist
              </div>
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                {storeProfile.name}
              </h1>
              <p className="text-[11px] text-slate-500 mt-0.5">{storeProfile.tagline}</p>
              <p className="text-[10px] text-slate-500 mt-1">{storeProfile.address}</p>
              <p className="text-[10px] text-slate-500">WA: {storeProfile.phone} | IG: {storeProfile.instagram}</p>
            </div>

            {/* Meta Info */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Nota:</span>
                <span className="font-bold text-slate-900">{transaction.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal:</span>
                <span>{formatDateTime(transaction.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kasir:</span>
                <span>{transaction.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pelanggan:</span>
                <span className="font-semibold text-slate-900">{transaction.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">WhatsApp:</span>
                <span>{transaction.customer.whatsapp || '-'}</span>
              </div>
            </div>

            {/* Info Sepatu (Jasa Cuci) */}
            <div className="py-2.5 bg-slate-50 px-2.5 rounded my-2.5 border border-slate-200 text-[10px] space-y-1">
              <div className="font-bold text-slate-700 uppercase tracking-wider text-[9px]">Detail Sepatu:</div>
              <div className="flex justify-between">
                <span className="text-slate-500">Merk / Seri:</span>
                <span className="font-medium text-slate-800">{transaction.customer.shoeBrand || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jenis Material:</span>
                <span className="font-medium text-slate-800">{transaction.customer.shoeType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kondisi Awal:</span>
                <span className="font-medium text-slate-800">{transaction.customer.shoeCondition}</span>
              </div>
              {transaction.customer.specialNotes && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Catatan:</span>
                  <span className="text-slate-800 italic">{transaction.customer.specialNotes}</span>
                </div>
              )}
              <div className="flex justify-between text-[#12372A] font-semibold pt-1 border-t border-slate-200">
                <span>Estimasi Selesai:</span>
                <span>{transaction.customer.estimatedCompletionDays} Hari Kerja</span>
              </div>
            </div>

            {/* Daftar Item */}
            <div className="py-2 border-b border-dashed border-slate-300">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between">
                <span>Item Layanan / Produk</span>
                <span>Subtotal</span>
              </div>
              <div className="space-y-2">
                {transaction.items.map((it) => {
                  const unitPrice = it.customPrice ?? it.item.price;
                  const itemTotal = unitPrice * it.quantity;
                  return (
                    <div key={it.cartItemId} className="text-[11px]">
                      <div className="flex justify-between font-medium text-slate-900">
                        <span>{it.item.name}</span>
                        <span>{formatRupiah(itemTotal)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>{it.quantity} x {formatRupiah(unitPrice)}</span>
                        {it.item.duration && <span>({it.item.duration})</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total Perhitungan */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatRupiah(transaction.subtotal)}</span>
              </div>
              {transaction.discount > 0 && (
                <div className="flex justify-between text-rose-600 font-medium">
                  <span>Diskon:</span>
                  <span>-{formatRupiah(transaction.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                <span>TOTAL:</span>
                <span className="text-[#12372A]">{formatRupiah(transaction.total)}</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-1">
                <span>Metode Bayar:</span>
                <span className="font-semibold text-slate-800">{transaction.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Uang Diterima:</span>
                <span>{formatRupiah(transaction.amountPaid)}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Kembalian:</span>
                <span>{formatRupiah(transaction.change)}</span>
              </div>
            </div>

            {/* Status Pesanan */}
            <div className="py-2.5 text-center bg-slate-100 rounded my-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wide">Status: </span>
              <span className="text-xs font-bold text-[#12372A]">{transaction.orderStatus.toUpperCase()}</span>
            </div>

            {/* S&K Toko */}
            <div className="pt-2 text-[9px] text-slate-500 leading-tight space-y-1 border-t border-slate-200">
              <p className="font-bold text-slate-700 uppercase">Syarat & Ketentuan:</p>
              {storeProfile.terms.map((t, idx) => (
                <p key={idx}>• {t}</p>
              ))}
              <p className="text-center italic text-slate-600 pt-2 font-sans font-medium text-[10px]">
                "{storeProfile.receiptFooterMessage}"
              </p>
            </div>

            {/* Barcode Mock Visual */}
            <div className="mt-4 pt-3 border-t border-dashed border-slate-300 text-center">
              <div className="inline-flex items-center justify-center space-x-1 h-8 px-4 opacity-70">
                <span className="w-1 h-7 bg-slate-800" />
                <span className="w-0.5 h-7 bg-slate-800" />
                <span className="w-2 h-7 bg-slate-800" />
                <span className="w-0.5 h-7 bg-slate-800" />
                <span className="w-1.5 h-7 bg-slate-800" />
                <span className="w-0.5 h-7 bg-slate-800" />
                <span className="w-2.5 h-7 bg-slate-800" />
                <span className="w-1 h-7 bg-slate-800" />
                <span className="w-0.5 h-7 bg-slate-800" />
                <span className="w-2 h-7 bg-slate-800" />
                <span className="w-1 h-7 bg-slate-800" />
              </div>
              <p className="text-[9px] text-slate-400 mt-0.5">*{transaction.invoiceNumber}*</p>
            </div>
          </div>
        </div>

        {/* Action Buttons (Hidden in Print) */}
        <div className="no-print bg-white p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Tersalin' : 'Salin Teks'}
            </button>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Kirim WhatsApp
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-[#12372A] hover:bg-[#0c241c] text-[#C9A34E] shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4 text-[#C9A34E]" />
              Cetak Struk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
