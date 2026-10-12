# Security Specification for Gimma Glow Shoes POS

## 1. Data Invariants
- Access is restricted exclusively to authenticated staff users. Anonymous and unauthenticated requests are strictly denied.
- Admins have full read/write access. Kasir (Cashier) staff can read catalog, read/create transactions, update transaction status, and record expenses.
- The bootstrapped admin is identified by email `gimmaglowshoes2@gmail.com` or presence in the `/admins/{userId}` document.
- Transactions require a unique valid invoice number (`GGS-YYYYMMDD-XXX`), customer data, item array, and valid payment calculations.
- Financial total amounts must be positive numbers.
- Timestamps must follow ISO string conventions and IDs must adhere to standard length and character format.

## 2. The "Dirty Dozen" Payloads (Adversarial Tests)
1. **Unauthenticated Read/Write**: Unauthenticated user trying to read `/transactions` -> REJECT.
2. **Unauthenticated Catalog Write**: Unauthenticated user attempting to edit pricing -> REJECT.
3. **Ghost Fields Injection**: An update to transaction containing unvalidated malicious fields -> REJECT.
4. **Huge ID Poisoning**: Document ID with > 128 chars or special shell chars -> REJECT.
5. **Negative Total Amount**: Creating a transaction with `total: -50000` -> REJECT.
6. **Non-Admin Catalog Delete**: Standard cashier attempting to delete catalog items -> REJECT.
7. **Non-Admin Admin Role Grant**: A regular user writing to `/admins/{uid}` -> REJECT.
8. **Malicious Script in Notes**: String fields exceeding max length constraints -> REJECT.
9. **Fake Email Admin Spoof**: Unverified email claiming admin privileges -> REJECT.
10. **Tampering with Invoice ID**: Modifying an immutable transaction invoice number -> REJECT.
11. **Negative Expense Amount**: Creating an operational expense with negative value -> REJECT.
12. **Blanket Query Scraping**: Unauthorized client attempting unrestricted collection read without auth -> REJECT.
