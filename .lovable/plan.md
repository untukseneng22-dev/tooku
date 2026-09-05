# Rencana: Melengkapi TOOKU dengan Fitur Umum Online Shop

Tujuan: membuat pengalaman TOOKU setara aplikasi online shop populer, tetap mempertahankan identitas koperasi sekolah dan fitur Siklus Hidup Barang yang sudah ada.

## Fitur yang akan ditambahkan

### 1. Wishlist / Favorit
- Tombol hati di kartu produk dan halaman detail.
- Halaman "Favorit Saya" (akses dari Profil).
- Notifikasi otomatis saat barang favorit turun harga (termasuk diskon cuci gudang).

### 2. Rating & Ulasan Produk
- Pembeli memberi bintang 1–5 dan ulasan setelah pesanan Selesai.
- Rating rata-rata + jumlah ulasan tampil di kartu produk dan halaman detail.
- Halaman detail menampilkan daftar ulasan dengan nama pembeli dan tanggal.

### 3. Flash Sale
- Sesi flash sale dengan countdown di Beranda (mis. seragam cuci gudang diskon ekstra jam tertentu).
- Banner dan kartu produk flash sale dengan harga coret.
- Admin koperasi bisa membuat sesi flash sale dari dashboard.

### 4. Voucher & Kode Promo
- Kolom kode voucher di checkout (contoh: TOOKU10, GRATISONGKIR).
- Voucher bisa diskon nominal, persen, atau gratis ongkir.
- Admin Pusat mengelola voucher; pembeli melihat voucher aktif di Beranda/profil.

### 5. Pencarian Lebih Pintar
- Riwayat pencarian tersimpan di perangkat.
- Saran kata populer ("seragam putih abu", "buku paket kelas 7").
- Pengurutan hasil: Terlaris, Termurah, Termahal, Terbaru.

### 6. Terakhir Dilihat & Rekomendasi
- Bagian "Terakhir Kamu Lihat" di Beranda.
- Rekomendasi "Barang Serupa" di halaman detail produk (kategori/sekolah sama).

### 7. Bagikan Produk
- Tombol bagikan di halaman detail (salin tautan / Web Share API di HP).
- Memudahkan siswa menyebarkan barang ke grup kelas.

### 8. Poin Loyalitas TOOKU
- Setiap transaksi selesai mendapat poin (Rp10.000 = 1 poin).
- Poin bisa ditukar potongan harga di checkout.
- Riwayat poin tampil di Profil.

### 9. Lapor Barang / Barang Bermasalah
- Tombol "Laporkan" di produk untuk konten tidak sesuai.
- Laporan masuk ke antrean moderasi Admin Pusat.

### 10. Pelengkap Pengalaman
- Notifikasi otomatis saat status pesanan berubah (Booking → Diproses → Siap Diambil → Selesai).
- Halaman bantuan/FAQ sederhana (cara beli, cara ambil barang, mekanisme kirim antar sekolah).
- Empty state yang ramah di semua halaman (keranjang kosong, pesanan kosong, favorit kosong).

## Teknis (ringkas)
- Data baru disimpan di store TOOKU yang sudah ada (localStorage persist): wishlist, reviews, flashSales, vouchers, points, reports, searchHistory.
- Tidak mengubah alur pembayaran/pengiriman yang sudah jalan.
- Semua fitur baru mengikuti tema warna TOOKU (biru logo, aksen emas) dan gaya mobile-first.

## Urutan pengerjaan
1. Wishlist + Favorit
2. Rating & ulasan produk
3. Flash sale + countdown
4. Voucher di checkout
5. Pencarian pintar + pengurutan
6. Terakhir dilihat + barang serupa
7. Bagikan produk
8. Poin loyalitas
9. Lapor barang + moderasi Admin Pusat
10. Notifikasi status, FAQ, empty states
