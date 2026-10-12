export type ItemCategory = 'service' | 'product' | 'package';

export type ShoeType = 
  | 'Sneakers'
  | 'Canvas / Converse / Vans'
  | 'Leather / Kulit'
  | 'Suede / Nubuck'
  | 'Running / Sport'
  | 'Boots'
  | 'Slip-on / Flat'
  | 'Heels / Formal'
  | 'Lainnya';

export type ShoeCondition = 
  | 'Kotor Ringan (Debu/Noda biasa)'
  | 'Kotor Berat (Lumpur/Noda minyak)'
  | 'Menguning (Yellowing)'
  | 'Warna Pudar (Faded)'
  | 'Berjamur / Lembab'
  | 'Sol Lepas / Butuh Lem'
  | 'Lecet / Gores';

export type OrderStatus = 'Menunggu' | 'Diproses' | 'Selesai' | 'Diambil';

export type PaymentMethod = 'Tunai' | 'QRIS' | 'Transfer' | 'Debit';

export interface CatalogItem {
  id: string;
  name: string;
  category: ItemCategory;
  price: number;
  costEstimate?: number; // HPP / estimasi bahan untuk kalkulasi laba
  description: string;
  duration?: string; // e.g. "30-60 Menit", "1-2 Hari", "2-3 Hari"
  stock?: number; // for products
  iconName?: string;
  badge?: string;
  isActive: boolean;
}

export interface CartItem {
  cartItemId: string; // unique for this cart line
  item: CatalogItem;
  quantity: number;
  // Specific shoe care details (optional per line item)
  shoeBrand?: string;
  shoeType?: ShoeType;
  shoeCondition?: ShoeCondition;
  itemNotes?: string;
  customPrice?: number;
}

export interface CustomerData {
  name: string;
  whatsapp: string;
  shoeType: ShoeType;
  shoeCondition: ShoeCondition;
  shoeBrand: string;
  specialNotes?: string;
  estimatedCompletionDays: number;
}

export interface Transaction {
  id: string; // internal UUID
  invoiceNumber: string; // e.g. GGS-20261012-001
  createdAt: string; // ISO string
  completedAt?: string;
  pickedUpAt?: string;
  customer: CustomerData;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  orderStatus: OrderStatus;
  cashierName: string;
  cashierId?: string;
  notes?: string;
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  category: 'Sabun & Bahan Kimia' | 'Kemasan & Plastik' | 'Listrik & Air' | 'Gaji & Uang Makan' | 'Sewa & Pemeliharaan' | 'Peralatan & Tools' | 'Lain-lain';
  amount: number;
  notes?: string;
  createdAt: string;
  createdBy?: string;
}

export interface StoreProfile {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  instagram: string;
  receiptFooterMessage: string;
  terms: string[];
}
