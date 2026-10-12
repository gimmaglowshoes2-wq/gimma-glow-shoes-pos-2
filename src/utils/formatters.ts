import { Transaction, StoreProfile } from '../types';

export function formatRupiah(amount: number): string {
  if (isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  if (isNaN(amount)) return '0';
  return new Intl.NumberFormat('id-ID').format(amount);
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return isoString;
  }
}

export function formatDateOnly(dateInput: string | Date): string {
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return String(dateInput);
  }
}

export function generateInvoiceNumber(existingTransactions: Transaction[] = []): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePrefix = `GGS-${year}${month}${day}`;

  // Find all existing sequences for today
  let highestSeq = 0;
  existingTransactions.forEach((t) => {
    if (t.invoiceNumber && t.invoiceNumber.startsWith(datePrefix)) {
      const parts = t.invoiceNumber.split('-');
      if (parts.length >= 3) {
        const seqNum = parseInt(parts[2], 10);
        if (!isNaN(seqNum) && seqNum > highestSeq) {
          highestSeq = seqNum;
        }
      }
    }
  });

  let nextSeq = highestSeq + 1;
  let candidate = `${datePrefix}-${String(nextSeq).padStart(3, '0')}`;

  // Ensure absolute uniqueness in memory
  while (existingTransactions.some((t) => t.invoiceNumber === candidate)) {
    nextSeq += 1;
    candidate = `${datePrefix}-${String(nextSeq).padStart(3, '0')}`;
  }

  return candidate;
}

export function cleanPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

export function createWhatsAppMessage(
  tx: Transaction,
  store: StoreProfile,
  type: 'received' | 'ready' | 'picked' = 'received'
): string {
  const itemsText = tx.items
    .map(i => `• ${i.item.name} x${i.quantity} (${formatRupiah((i.customPrice ?? i.item.price) * i.quantity)})`)
    .join('\n');

  if (type === 'ready') {
    return `Halo Kak *${tx.customer.name}*! 👋\n\nKabar gembira dari *${store.name}* ✨\nSepatu Anda dengan No. Nota *#${tx.invoiceNumber}*:\n👟 *${tx.customer.shoeBrand || 'Sepatu'}* (${tx.customer.shoeType})\n\n✅ *SUDAH SELESAI DICUCI & SIAP DIAMBIL!* ✨\n\n*Rincian Perawatan:*\n${itemsText}\n*Total:* ${formatRupiah(tx.total)} (${tx.amountPaid >= tx.total ? 'LUNAS' : 'Belum Lunas'})\n\nSilakan tunjukkan pesan/struk ini saat pengambilan di store kami:\n📍 ${store.address}\n\nTerima kasih atas kepercayaannya! 🙏✨`;
  }

  if (type === 'picked') {
    return `Halo Kak *${tx.customer.name}*! 👋\n\nSepatu Anda dengan No. Nota *#${tx.invoiceNumber}* telah berhasil *DIAMBIL* di *${store.name}*. 👟✨\n\nSemoga puas dengan hasil treatment kami! Jangan lupa tag foto sepatu bersihmu di Instagram *${store.instagram}* ya!\n\nSampai jumpa di treatment berikutnya! 🙏🔥`;
  }

  // Default 'received' confirmation
  return `Halo Kak *${tx.customer.name}*! 👋\n\nTerima kasih telah mempercayakan perawatan sepatu Anda di *${store.name}*!\n\n📋 *BUKTI TANDA TERIMA PESANAN*\nNo. Nota: *${tx.invoiceNumber}*\nTanggal: ${formatDateTime(tx.createdAt)}\n\n*Data Sepatu:*\n• Merk/Seri: *${tx.customer.shoeBrand || '-'}*\n• Jenis: ${tx.customer.shoeType}\n• Kondisi Awal: ${tx.customer.shoeCondition}\n${tx.customer.specialNotes ? `• Catatan: ${tx.customer.specialNotes}\n` : ''}\n*Layanan / Produk:*\n${itemsText}\n\n💰 *Total Pembayaran:* ${formatRupiah(tx.total)}\n💳 *Metode:* ${tx.paymentMethod} (${tx.amountPaid >= tx.total ? 'LUNAS' : 'Sisa: ' + formatRupiah(tx.total - tx.amountPaid)})\n\n⏳ *Estimasi Selesai:* ${tx.customer.estimatedCompletionDays} Hari Kerja\n\nKami akan mengirimkan notifikasi saat sepatu Anda sudah selesai dan glowing kembali! ✨\n📍 ${store.address}\n📞 ${store.phone}`;
}

export function getWhatsAppUrl(phone: string, message: string): string {
  const cleaned = cleanPhoneNumber(phone);
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}
