# Mekanisme Pengambilan & Pembayaran Lintas Sekolah

Saat ini semua pesanan otomatis "ambil di koperasi penjual" dengan kode pengambilan 1x24 jam. Untuk pembeli dari sekolah/kecamatan lain, ditambahkan opsi kirim lewat ekspedisi, ongkir tarif flat per zona, dan aturan pembayaran yang bisa diatur tiap koperasi.

## Alur baru untuk pembeli

1. **Di halaman detail produk** muncul panel "Cara Dapatkan Barang" berisi dua opsi:
   - Ambil sendiri di koperasi (alamat + jam layanan, gratis)
   - Kirim via ekspedisi (JNE / J&T / POS) dengan estimasi ongkir dan lama kirim
   Ditandai juga apakah pembeli berada di kecamatan yang sama dengan koperasi, agar jelas kapan ambil sendiri masih praktis.

2. **Di checkout** pembeli memilih metode penerimaan lebih dulu:
   - **Ambil di Koperasi** → seperti sekarang: kode pengambilan + batas 1x24 jam.
   - **Kirim via Ekspedisi** → isi nama penerima, no. HP, alamat lengkap, kecamatan/kota, catatan. Pilih kurir (JNE, J&T, POS). Ongkir dihitung tarif flat per zona.
   Bila keranjang berisi barang dari lebih dari satu koperasi, ongkir dihitung per koperasi dan ditampilkan rinciannya (karena tiap koperasi mengirim terpisah).

3. **Tarif flat per zona** (bisa diubah nanti):
   - Kecamatan sama dengan koperasi: Rp0 (disarankan ambil sendiri) / Rp6.000 bila tetap ingin diantar
   - Dalam Kabupaten Magetan: Rp10.000
   - Luar kabupaten, dalam Jawa Timur: Rp18.000
   - Luar Jawa Timur: Rp30.000
   Ditambah Rp3.000 per koperasi tambahan bila kiriman terpisah.

4. **Pembayaran** — tiap koperasi menentukan metode yang diizinkan (diatur admin koperasi):
   - Bayar online (QRIS / VA / e-wallet)
   - Bayar tunai di koperasi saat ambil
   - COD saat barang diterima (opsional per koperasi)
   Checkout hanya menampilkan metode yang diizinkan koperasi asal barang. Aturan default: untuk pengiriman ekspedisi, koperasi umumnya mensyaratkan bayar online lebih dulu; namun karena admin yang menentukan, koperasi yang mengizinkan COD tetap bisa dipilih. Jika keranjang lintas koperasi dan aturannya berbeda, hanya metode yang sama-sama diizinkan yang tampil, dengan penjelasan singkat.
   Catatan jujur tetap dipasang: layanan pembayaran belum dikonfigurasi, jadi pesanan online berstatus "Menunggu Konfirmasi" dan dikonfirmasi manual oleh admin — tidak diklaim lunas otomatis.

## Halaman pesanan

- Pesanan **ambil sendiri**: kode pengambilan + countdown 1x24 jam (seperti sekarang).
- Pesanan **kirim**: timeline berubah menjadi Booking → Diproses → Dikirim → Diterima, menampilkan kurir, nomor resi (diisi admin), alamat tujuan, ongkir, dan estimasi tiba. Tidak ada countdown 1x24 jam; diganti batas 2x24 jam bagi koperasi untuk menyerahkan paket ke kurir.
- Ringkasan biaya di detail pesanan memisahkan subtotal, ongkir, biaya layanan, total.

## Sisi Admin Koperasi

- **Pengaturan pengiriman & pembayaran** di dashboard: aktifkan/matikan layanan kirim, pilih kurir yang dilayani, atur metode pembayaran yang diizinkan (online / tunai di koperasi / COD), dan sesuaikan tarif flat per zona.
- **Daftar pesanan**: pesanan kirim punya aksi "Input Resi & Tandai Dikirim" lalu "Tandai Diterima"; pesanan ambil sendiri tetap validasi kode. Konfirmasi pembayaran manual untuk pesanan online.
- Admin Pusat melihat kolom metode penerimaan, kurir, dan resi di monitor transaksi.

## Halaman informasi

Halaman Standar Kurasi / profil koperasi ditambah bagian singkat "Cara Pembelian Lintas Sekolah" agar pembeli paham dua jalur (ambil sendiri vs kirim), siapa yang menanggung ongkir, dan tanggung jawab bila paket bermasalah (koperasi pengirim + bantuan call center Admin Pusat).

## Catatan teknis

- `src/lib/tooku-store.tsx`: tipe `Order` ditambah `fulfillment: "pickup" | "delivery"`, `shipping?: { recipient, phone, address, district, city, province, note?, courier, fee, tracking?, zone }`, `shippingTotal`, dan status baru `"Dikirim" | "Diterima"` dengan `statusFlow` terpisah untuk pickup dan delivery. `checkout()` menerima input fulfillment + shipping dan menghitung ongkir. Aksi baru: `setTracking(orderId, courier, tracking)`.
- `src/lib/tooku-data.ts`: tambah `School.shipping` (aktif, daftar kurir, tarif zona, metode pembayaran diizinkan) dan helper `shippingQuote(schoolId, tujuan)` + `zoneOf(...)` berbasis `district`/kota.
- UI: `src/routes/keranjang.tsx` (langkah penerimaan + form alamat + rincian ongkir per koperasi), `src/routes/produk.$id.tsx` (panel opsi penerimaan), `src/routes/pesanan.tsx` (timeline ganda, resi), `src/routes/admin.tsx` (pengaturan kirim/pembayaran, input resi), `src/routes/pusat.tsx` (kolom baru), `src/routes/standar-kurasi.tsx` (penjelasan alur).
- Semua data tersimpan di store lokal seperti sekarang (belum ada backend); tarif dan resi diinput manual, tanpa integrasi API kurir sungguhan — dinyatakan jelas di UI sebagai estimasi.
