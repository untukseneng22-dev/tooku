# Rencana: Kunci Halaman Khusus Akun + Penyegaran Tampilan

## 1. Kunci login seragam di semua halaman akun
Saat ini `/notifikasi` dan `/chat` sudah memakai LoginGate, tapi `/profil` dan `/pesanan` punya tampilan tamu sendiri yang berbeda, sedangkan `/keranjang` dan `/favorit` belum dikunci sama sekali.

- Semua halaman akun — **Profil, Pesanan, Keranjang, Favorit, Notifikasi, Chat** — menampilkan layar kunci yang sama (komponen LoginGate): ikon gembok, judul halaman, tombol "Masuk / Daftar", dan tombol "Kembali belanja".
- Tamu tetap bebas melihat Beranda, detail produk, halaman koperasi, standar kurasi, dan bantuan.
- Bottom navigation: item Pesanan/Keranjang/Notifikasi/Profil yang diklik tamu tetap membuka halaman, tapi isinya layar kunci (bukan data kosong).

## 2. Ide penyegaran tampilan (dipilih yang berdampak besar, tetap satu arah visual TOOKU)
1. **Splash & header lebih hidup** — gradasi biru logo lembut di header Beranda, logo TOOKU dengan bayangan halus.
2. **Kartu produk lebih premium** — sudut lebih membulat, bayangan saat disentuh (efek angkat), badge "Lolos Kurasi" dan diskon lebih menonjol dengan warna emas.
3. **Animasi halus** — produk muncul berurutan (fade-up) saat halaman dibuka, tombol mengecil saat ditekan, badge keranjang berdenyut saat item masuk.
4. **Skeleton loading** — placeholder kartu produk berkilau saat data dimuat, menggantikan layar kosong.
5. **Empty state bergambar** — ilustrasi kecil + kalimat ramah untuk keranjang/favorit/pesanan kosong (bukan sekadar teks).
6. **Countdown flash sale lebih dramatis** — strip gradien emas-oranye dengan angka menit:detik menonjol.
7. **Micro-detail** — nomor harga dengan font tebal khusus, divider halus, ikon konsisten satu gaya (Lucide, ketebalan sama).

## Teknis (ringkas)
- Memakai komponen LoginGate yang sudah ada; mengganti blok tamu khusus di profil/pesanan.
- Animasi cukup CSS (transition/keyframes) — tanpa library baru.
- Tidak mengubah alur checkout, pembayaran, maupun siklus hidup barang.

## Urutan pengerjaan
1. LoginGate seragam di 6 halaman.
2. Empty state bergambar.
3. Penyegaran kartu produk + badge.
4. Animasi fade-up & micro-interactions.
5. Flash sale countdown + skeleton loading.
