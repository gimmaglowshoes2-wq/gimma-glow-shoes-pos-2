import React, { useState, useMemo } from 'react';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  Zap,
  Crown,
  SunMedium,
  Paintbrush,
  ShieldCheck,
  PackageCheck,
  Droplet,
  Brush,
  Shield,
  Wind,
  CreditCard,
  QrCode,
  Banknote,
  Building2,
  AlertCircle,
  Receipt,
  User,
  Phone,
  Footprints,
  Info,
} from 'lucide-react';
import {
  CatalogItem,
  CartItem,
  CustomerData,
  PaymentMethod,
  ShoeType,
  ShoeCondition,
  Transaction,
  StoreProfile,
} from '../../types';
import { formatRupiah, generateInvoiceNumber } from '../../utils/formatters';

interface PosViewProps {
  catalogItems: CatalogItem[];
  existingTransactions: Transaction[];
  cashierName: string;
  cashierId?: string;
  storeProfile: StoreProfile;
  onTransactionComplete: (tx: Transaction) => void;
}

const SHOE_TYPES: ShoeType[] = [
  'Sneakers',
  'Canvas / Converse / Vans',
  'Leather / Kulit',
  'Suede / Nubuck',
  'Running / Sport',
  'Boots',
  'Slip-on / Flat',
  'Heels / Formal',
  'Lainnya',
];

const SHOE_CONDITIONS: ShoeCondition[] = [
  'Kotor Ringan (Debu/Noda biasa)',
  'Kotor Berat (Lumpur/Noda minyak)',
  'Menguning (Yellowing)',
  'Warna Pudar (Faded)',
  'Berjamur / Lembab',
  'Sol Lepas / Butuh Lem',
  'Lecet / Gores',
];

export const PosView: React.FC<PosViewProps> = ({
  catalogItems,
  existingTransactions,
  cashierName,
  cashierId,
  storeProfile: _storeProfile,
  onTransactionComplete,
}) => {
  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'service' | 'product' | 'package'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountInput, setDiscountInput] = useState<string>('');
  const [discountType, setDiscountType] = useState<'nominal' | 'percent'>('nominal');

  // Customer & Shoe Details
  const [customer, setCustomer] = useState<CustomerData>({
    name: '',
    whatsapp: '',
    shoeBrand: '',
    shoeType: 'Sneakers',
    shoeCondition: 'Kotor Ringan (Debu/Noda biasa)',
    specialNotes: '',
    estimatedCompletionDays: 2,
  });

  // Payment Details
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tunai');
  const [amountPaidInput, setAmountPaidInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Mobile cart drawer open state
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Filtered items
  const filteredItems = useMemo(() => {
    return catalogItems.filter((item) => {
      if (!item.isActive) return false;
      const matchCat =
        selectedCategory === 'all' ? true : item.category === selectedCategory;
      const matchQuery =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [catalogItems, selectedCategory, searchQuery]);

  // Cart Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = item.customPrice ?? item.item.price;
      return sum + price * item.quantity;
    }, 0);
  }, [cart]);

  const discount = useMemo(() => {
    if (discountType === 'percent') {
      const pct = Math.min(100, Math.max(0, discountAmount));
      return Math.round((subtotal * pct) / 100);
    }
    return Math.min(subtotal, Math.max(0, discountAmount));
  }, [subtotal, discountAmount, discountType]);

  const total = Math.max(0, subtotal - discount);

  const amountPaid = useMemo(() => {
    if (paymentMethod !== 'Tunai') return total;
    const parsed = parseInt(amountPaidInput.replace(/\D/g, ''), 10);
    return isNaN(parsed) ? 0 : parsed;
  }, [paymentMethod, amountPaidInput, total]);

  const change = Math.max(0, amountPaid - total);

  // Check if cart has service items
  const hasServiceItems = useMemo(() => {
    return cart.some((c) => c.item.category === 'service' || c.item.category === 'package');
  }, [cart]);

  // Add Item to Cart
  const handleAddToCart = (item: CatalogItem) => {
    setErrorMessage('');
    setCart((prev) => {
      const existingIndex = prev.findIndex((c) => c.item.id === item.id);
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          quantity: copy[existingIndex].quantity + 1,
        };
        return copy;
      }
      return [
        ...prev,
        {
          cartItemId: `${item.id}-${Date.now()}`,
          item,
          quantity: 1,
        },
      ];
    });
  };

  // Modify Quantity
  const handleUpdateQty = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.cartItemId === cartItemId) {
            const nextQty = c.quantity + delta;
            return nextQty > 0 ? { ...c, quantity: nextQty } : null;
          }
          return c;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Remove Item
  const handleRemoveItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((c) => c.cartItemId !== cartItemId));
  };

  // Quick Amount Buttons
  const handleQuickPay = (nominal: number) => {
    setAmountPaidInput(nominal.toString());
  };

  // Handle Discount Input
  const handleDiscountChange = (val: string) => {
    setDiscountInput(val);
    const num = parseInt(val.replace(/\D/g, ''), 10);
    setDiscountAmount(isNaN(num) ? 0 : num);
  };

  // Icon Helper
  const getItemIcon = (name?: string) => {
    switch (name) {
      case 'Zap': return Zap;
      case 'Sparkles': return Sparkles;
      case 'Crown': return Crown;
      case 'SunMedium': return SunMedium;
      case 'Paintbrush': return Paintbrush;
      case 'ShieldCheck': return ShieldCheck;
      case 'PackageCheck': return PackageCheck;
      case 'Droplet': return Droplet;
      case 'Brush': return Brush;
      case 'Shield': return Shield;
      case 'Wind': return Wind;
      default: return Sparkles;
    }
  };

  // Process Checkout
  const handleCheckout = () => {
    setErrorMessage('');

    if (cart.length === 0) {
      setErrorMessage('Keranjang masih kosong. Pilih minimal 1 layanan atau produk.');
      return;
    }

    if (!customer.name.trim()) {
      setErrorMessage('Mohon isi nama pelanggan.');
      return;
    }

    if (paymentMethod === 'Tunai' && amountPaid < total) {
      setErrorMessage(`Uang tunai yang diterima kurang! Kurang ${formatRupiah(total - amountPaid)}.`);
      return;
    }

    // Default status: if shoes need treatment, 'Menunggu' or 'Diproses'. If only retail product, 'Selesai' / 'Diambil'
    const defaultStatus = hasServiceItems ? 'Diproses' : 'Diambil';

    const newTransaction: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      invoiceNumber: generateInvoiceNumber(existingTransactions),
      createdAt: new Date().toISOString(),
      customer: {
        ...customer,
        name: customer.name.trim(),
        whatsapp: customer.whatsapp.trim(),
      },
      items: [...cart],
      subtotal,
      discount,
      total,
      paymentMethod,
      amountPaid: paymentMethod === 'Tunai' ? amountPaid : total,
      change: paymentMethod === 'Tunai' ? change : 0,
      orderStatus: defaultStatus,
      cashierName,
      cashierId,
      notes: customer.specialNotes,
    };

    onTransactionComplete(newTransaction);

    // Reset Form
    setCart([]);
    setDiscountAmount(0);
    setDiscountInput('');
    setAmountPaidInput('');
    setCustomer({
      name: '',
      whatsapp: '',
      shoeBrand: '',
      shoeType: 'Sneakers',
      shoeCondition: 'Kotor Ringan (Debu/Noda biasa)',
      specialNotes: '',
      estimatedCompletionDays: 2,
    });
    setIsMobileCartOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Banner & Search */}
      <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-x-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-[#12372A] text-[#C9A34E] shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Semua ({catalogItems.filter((i) => i.isActive).length})
          </button>
          <button
            onClick={() => setSelectedCategory('service')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              selectedCategory === 'service'
                ? 'bg-[#12372A] text-[#C9A34E] shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Layanan Cuci
          </button>
          <button
            onClick={() => setSelectedCategory('package')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              selectedCategory === 'package'
                ? 'bg-[#12372A] text-[#C9A34E] shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Paket Hemat
          </button>
          <button
            onClick={() => setSelectedCategory('product')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              selectedCategory === 'product'
                ? 'bg-[#12372A] text-[#C9A34E] shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Produk Shoe Care
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px] md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari layanan atau produk..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#12372A]/20 focus:border-[#12372A] transition-all shadow-2xs placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Main Grid: Catalog (Left) + Cart & Checkout (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Catalog Items (7 Cols on LG) */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const IconComp = getItemIcon(item.iconName);
              const inCartQty = cart.find((c) => c.item.id === item.id)?.quantity || 0;

              return (
                <div
                  key={item.id}
                  onClick={() => handleAddToCart(item)}
                  className={`group relative bg-white rounded-2xl p-4.5 border transition-all cursor-pointer flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 select-none ${
                    inCartQty > 0
                      ? 'border-[#C9A34E] ring-2 ring-[#C9A34E]/20 bg-amber-50/20'
                      : 'border-slate-200/80 hover:border-[#12372A]/40'
                  }`}
                >
                  {/* Item Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          item.category === 'service'
                            ? 'bg-[#12372A]/10 text-[#12372A] group-hover:bg-[#12372A] group-hover:text-[#C9A34E]'
                            : item.category === 'package'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                      </div>
                      
                      {item.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C9A34E]/20 text-[#825c15] border border-[#C9A34E]/30">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#12372A] transition-colors leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {item.duration && (
                      <span className="inline-block mt-2 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        ⏱ {item.duration}
                      </span>
                    )}

                    {typeof item.stock === 'number' && (
                      <span
                        className={`inline-block mt-2 text-[11px] font-medium px-2 py-0.5 rounded-md ${
                          item.stock > 5
                            ? 'text-emerald-700 bg-emerald-50'
                            : item.stock > 0
                            ? 'text-amber-700 bg-amber-50'
                            : 'text-rose-700 bg-rose-50'
                        }`}
                      >
                        📦 Stok: {item.stock} unit
                      </span>
                    )}
                  </div>

                  {/* Price & Add Trigger */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Tarif / Harga
                      </span>
                      <span className="text-base font-extrabold text-[#12372A]">
                        {formatRupiah(item.price)}
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        inCartQty > 0
                          ? 'bg-[#C9A34E] text-[#12372A] shadow-xs'
                          : 'bg-slate-100 text-slate-700 group-hover:bg-[#12372A] group-hover:text-white'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {inCartQty > 0 ? `(${inCartQty})` : 'Pilih'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
              <Sparkles className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <h4 className="font-bold text-slate-700">Tidak ada layanan atau produk ditemukan</h4>
              <p className="text-xs text-slate-400 mt-1">
                Coba gunakan kata kunci lain atau ubah kategori filter.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Cart, Customer Form, and Payment Checkout (5 Cols on LG) */}
        <div
          className={`lg:col-span-5 xl:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-lg p-5 flex flex-col gap-5 ${
            isMobileCartOpen
              ? 'fixed inset-x-2 bottom-2 top-16 z-50 overflow-y-auto max-w-lg mx-auto'
              : 'relative'
          }`}
        >
          {/* Cart Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#12372A]/10 text-[#12372A]">
                <ShoppingCart className="w-5 h-5 text-[#12372A]" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base">Keranjang Kasir</h2>
                <span className="text-xs text-slate-500 font-medium">
                  {cart.length} item terpilih
                </span>
              </div>
            </div>

            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 p-1 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Kosongkan
              </button>
            )}

            {isMobileCartOpen && (
              <button
                onClick={() => setIsMobileCartOpen(false)}
                className="lg:hidden text-xs bg-slate-100 px-3 py-1.5 rounded-lg font-bold text-slate-600"
              >
                Tutup
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
            {cart.length === 0 ? (
              <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                <ShoppingCart className="w-8 h-8 mx-auto opacity-30 mb-1" />
                <p className="text-xs font-medium">Belum ada item di keranjang.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Klik layanan atau produk di katalog untuk menambahkan.
                </p>
              </div>
            ) : (
              cart.map((cartItem) => {
                const price = cartItem.customPrice ?? cartItem.item.price;
                return (
                  <div
                    key={cartItem.cartItemId}
                    className="p-3 bg-[#F7F5EF]/60 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 truncate">
                        {cartItem.item.name}
                      </h4>
                      <p className="text-slate-500 text-[11px]">
                        {formatRupiah(price)} / unit
                      </p>
                    </div>

                    {/* Qty Stepper */}
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                      <button
                        onClick={() => handleUpdateQty(cartItem.cartItemId, -1)}
                        className="w-6 h-6 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100 active:scale-95"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-slate-800">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(cartItem.cartItemId, 1)}
                        className="w-6 h-6 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100 active:scale-95"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <span className="font-extrabold text-slate-900 block">
                        {formatRupiah(price * cartItem.quantity)}
                      </span>
                      <button
                        onClick={() => handleRemoveItem(cartItem.cartItemId)}
                        className="text-[10px] text-rose-500 hover:text-rose-700 font-medium"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Customer & Shoe Details Form */}
          <div className="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#12372A] uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-[#C9A34E]" />
              <span>Data Pelanggan & Sepatu</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mb-1">
                  <User className="w-3 h-3" /> Nama Pelanggan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Dimas Anggara"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#12372A] focus:border-[#12372A] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mb-1">
                  <Phone className="w-3 h-3" /> No. WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="0812xxxxxxx"
                  value={customer.whatsapp}
                  onChange={(e) => setCustomer({ ...customer, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#12372A] focus:border-[#12372A] outline-none"
                />
              </div>
            </div>

            {/* Shoe Information (Special for shoe cleaning) */}
            <div className="pt-1 space-y-2 border-t border-slate-200/60">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mb-1">
                    <Footprints className="w-3 h-3" /> Merk / Seri Sepatu
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: Nike Air Jordan / NB 550"
                    value={customer.shoeBrand}
                    onChange={(e) => setCustomer({ ...customer, shoeBrand: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#12372A] focus:border-[#12372A] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                    Jenis Material
                  </label>
                  <select
                    value={customer.shoeType}
                    onChange={(e) => setCustomer({ ...customer, shoeType: e.target.value as ShoeType })}
                    className="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#12372A] focus:border-[#12372A] outline-none"
                  >
                    {SHOE_TYPES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                    Kondisi Awal Sepatu
                  </label>
                  <select
                    value={customer.shoeCondition}
                    onChange={(e) =>
                      setCustomer({ ...customer, shoeCondition: e.target.value as ShoeCondition })
                    }
                    className="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#12372A] focus:border-[#12372A] outline-none"
                  >
                    {SHOE_CONDITIONS.map((cond) => (
                      <option key={cond} value={cond}>
                        {cond}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                    Estimasi Selesai
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={14}
                      value={customer.estimatedCompletionDays}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          estimatedCompletionDays: Math.max(1, parseInt(e.target.value) || 1),
                        })
                      }
                      className="w-16 px-2.5 py-2 text-xs text-center font-bold bg-white border border-slate-200 rounded-xl outline-none"
                    />
                    <span className="text-xs text-slate-600 font-medium">Hari Kerja</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                  Catatan Khusus (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Misal: Jangan sikat sol terlalu keras / noda kopi di ujung"
                  value={customer.specialNotes}
                  onChange={(e) => setCustomer({ ...customer, specialNotes: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                />
              </div>
            </div>
          </div>

          {/* Discount Section */}
          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Diskon / Potongan</span>
              <div className="flex rounded-lg bg-slate-100 p-0.5 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setDiscountType('nominal')}
                  className={`px-2 py-0.5 rounded ${
                    discountType === 'nominal' ? 'bg-[#12372A] text-white' : 'text-slate-600'
                  }`}
                >
                  Rp
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('percent')}
                  className={`px-2 py-0.5 rounded ${
                    discountType === 'percent' ? 'bg-[#12372A] text-white' : 'text-slate-600'
                  }`}
                >
                  %
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder={discountType === 'nominal' ? 'Contoh: 10000' : 'Contoh: 10%'}
                value={discountInput}
                onChange={(e) => handleDiscountChange(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold"
              />
              {/* Quick Chips */}
              <button
                type="button"
                onClick={() => {
                  setDiscountType('nominal');
                  handleDiscountChange('5000');
                }}
                className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 rounded font-medium text-slate-700"
              >
                5k
              </button>
              <button
                type="button"
                onClick={() => {
                  setDiscountType('nominal');
                  handleDiscountChange('10000');
                }}
                className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 rounded font-medium text-slate-700"
              >
                10k
              </button>
              <button
                type="button"
                onClick={() => {
                  setDiscountType('percent');
                  handleDiscountChange('10');
                }}
                className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 rounded font-medium text-slate-700"
              >
                10%
              </button>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(
                [
                  { id: 'Tunai', label: 'Tunai', icon: Banknote },
                  { id: 'QRIS', label: 'QRIS', icon: QrCode },
                  { id: 'Transfer', label: 'Transfer', icon: Building2 },
                  { id: 'Debit', label: 'Debit', icon: CreditCard },
                ] as const
              ).map((method) => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
                      isSelected
                        ? 'bg-[#12372A] text-[#C9A34E] border-[#12372A] shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Input & Calculations (if Tunai) */}
          {paymentMethod === 'Tunai' ? (
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-3 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-900">Uang Diterima:</span>
                <span className="text-[11px] text-amber-700 font-mono">
                  {amountPaid > 0 ? formatRupiah(amountPaid) : 'Rp 0'}
                </span>
              </div>

              <input
                type="number"
                placeholder="Masukkan jumlah uang tunai..."
                value={amountPaidInput}
                onChange={(e) => setAmountPaidInput(e.target.value)}
                className="w-full px-3 py-2 text-sm font-bold bg-white border border-amber-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30"
              />

              {/* Quick Cash Presets */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickPay(total)}
                  className="px-2 py-1 text-[11px] font-bold bg-white border border-amber-300 text-amber-900 rounded-lg hover:bg-amber-100"
                >
                  Uang Pas ({formatRupiah(total)})
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPay(50000)}
                  className="px-2 py-1 text-[11px] font-semibold bg-white border border-amber-200 text-slate-700 rounded-lg hover:bg-amber-100"
                >
                  50k
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPay(100000)}
                  className="px-2 py-1 text-[11px] font-semibold bg-white border border-amber-200 text-slate-700 rounded-lg hover:bg-amber-100"
                >
                  100k
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPay(150000)}
                  className="px-2 py-1 text-[11px] font-semibold bg-white border border-amber-200 text-slate-700 rounded-lg hover:bg-amber-100"
                >
                  150k
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPay(200000)}
                  className="px-2 py-1 text-[11px] font-semibold bg-white border border-amber-200 text-slate-700 rounded-lg hover:bg-amber-100"
                >
                  200k
                </button>
              </div>

              {/* Kembalian Calculation */}
              <div className="pt-2 border-t border-amber-200 flex items-center justify-between text-xs">
                <span className="font-bold text-amber-950">Kembalian:</span>
                <span
                  className={`text-sm font-black ${
                    amountPaid < total ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  {amountPaid < total
                    ? `Kurang ${formatRupiah(total - amountPaid)}`
                    : formatRupiah(change)}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-sky-800 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>
                Pembayaran non-tunai ({paymentMethod}) terkonfirmasi lunas pas:{' '}
                <strong>{formatRupiah(total)}</strong>.
              </span>
            </div>
          )}

          {/* Pricing Summary */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-rose-600 font-semibold">
                <span>Diskon</span>
                <span>-{formatRupiah(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-200">
              <span>Total Tagihan</span>
              <span className="text-[#12372A]">{formatRupiah(total)}</span>
            </div>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Checkout Action Button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
              cart.length === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-[#12372A] hover:bg-[#0c241c] text-[#C9A34E] active:scale-98'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Simpan Transaksi & Cetak Struk</span>
          </button>
        </div>
      </div>

      {/* Floating Cart Button for Mobile Screens */}
      {cart.length > 0 && !isMobileCartOpen && (
        <div className="lg:hidden fixed bottom-4 inset-x-4 z-40">
          <button
            onClick={() => setIsMobileCartOpen(true)}
            className="w-full bg-[#12372A] text-[#C9A34E] p-3.5 rounded-2xl shadow-2xl flex items-center justify-between border-2 border-[#C9A34E]/30"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#C9A34E] text-[#12372A] flex items-center justify-center font-bold text-xs">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </div>
              <div className="text-left">
                <span className="text-xs text-white block">Keranjang Kasir</span>
                <span className="text-sm font-extrabold text-[#C9A34E]">
                  {formatRupiah(total)}
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-white bg-white/10 px-3 py-1.5 rounded-xl">
              Lihat & Bayar →
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
