# Proposal Inotek Award 2026 — TOOKU (PDF)

Menyusun proposal inovasi lengkap dalam format PDF, mengikuti struktur wajib Buku Pedoman Inotek Award 2026, kategori **Pelajar (SLTA)** atas nama **SMAS PGRI Maospati**. Isi didetailkan, dengan penekanan pada dua masalah utama: tradisi corat-coret seragam saat kelulusan dan menumpuknya barang sekolah bekas yang masih layak pakai.

## Struktur dokumen

1. **Cover / Lembar Judul** — judul inovasi "TOOKU (Toko Koperasi Untuk Kita) — Marketplace Barang Sekolah Layak Pakai Lintas Koperasi Sekolah", logo TOOKU, kategori Pelajar, asal sekolah, tahun 2026, tagar #INOTEKMAGETAN2026_TOOKU.
2. **Biodata Peserta** — tabel ketua tim + baris anggota dan kontak dibiarkan bergaris kosong untuk diisi tangan/diisi nanti.
3. **Bab 1 Dasar Pemikiran dan Latar Belakang** — narasi kondisi: tiap kelulusan seragam dicorat-coret lalu dibuang; seragam, buku paket, atribut, dan alat tulis menumpuk di rumah/gudang koperasi walau masih 70–95% layak; jual-beli antar siswa berjalan informal dan tidak terkurasi; koperasi sekolah punya legitimasi tapi belum punya kanal digital. Diakhiri munculnya gagasan marketplace terkurasi yang penjualnya khusus koperasi sekolah.
4. **Bab 2 Sasaran dan Tujuan** — sasaran: siswa & wali murid (pembeli), alumni/siswa penitip barang, admin koperasi sekolah (penjual), Admin Pusat/dinas sebagai pengawas. Tujuan terukur: mengalihkan tradisi corat-coret menjadi donasi seragam, menekan timbulan limbah tekstil & kertas, menghemat pengeluaran wali murid, menghidupkan unit usaha koperasi, dan menanamkan literasi ekonomi sirkular.
5. **Bab 3 Tanggal, Bulan, Tahun Pengembangan** — dimulai Mei 2026, dengan tabel milestone Mei–Agustus 2026 (riset masalah, desain, pengembangan fitur pembeli, koperasi, Admin Pusat, PWA, uji coba lintas sekolah).
6. **Bab 4 Rancang Bangun / Desain Inovasi** — arsitektur dan alur:
   - Tiga peran: Pembeli, Admin Koperasi (seller, bisa juga membeli lintas koperasi), Admin Pusat (call center, verifikasi akun, monitor transaksi).
   - Alur barang: penitipan alumni/siswa → 5 tahap Standar Kurasi Koperasi → unggah dengan foto asli + spesifikasi per kategori → tayang dengan badge Lolos Kurasi.
   - Alur pembeli: pencarian (produk + akun koperasi) → filter kategori/jenjang/kecamatan → detail lengkap (plus-minus transparan, spesifikasi, koperasi asal, lokasi & jam pengambilan) → keranjang multi-item → checkout (bayar online atau bayar di koperasi) → kode pengambilan + batas 1×24 jam → timeline status Booking → Diproses → Siap Diambil → Selesai.
   - Fitur pendukung: chat pembeli–koperasi & call center, notifikasi, rating/ulasan pelayanan koperasi, kompresi gambar otomatis, PWA yang bisa diinstal di HP.
   - Diagram alur ASCII dan tabel modul aplikasi.
   - Rincian estimasi biaya pengembangan & operasional tahunan (domain, hosting, sosialisasi, perangkat foto) berlabel estimasi.
7. **Bab 5 Kebaruan, Keunikan, dan Keunggulan** — bagian perbandingan yang didetailkan:
   - Tabel A: kondisi sebelum vs sesudah TOOKU (corat-coret, penumpukan barang, biaya wali murid, peran koperasi, jaminan mutu).
   - Tabel B: TOOKU vs marketplace umum (Shopee/Tokopedia) vs grup jual-beli WA/FB vs bazar sekolah manual — dinilai pada legalitas penjual, kurasi mutu, kesesuaian atribut sekolah, biaya kirim, keamanan transaksi anak, dan manfaat balik ke koperasi.
   - Tabel C: perbandingan sebaran/skalabilitas — lintas sekolah dalam satu kabupaten dengan filter jenjang & kecamatan, siap direplikasi ke kabupaten lain.
   - Estimasi dampak kuantitatif dengan asumsi yang ditulis eksplisit (jumlah sekolah sampel, rata-rata lulusan, potensi seragam terselamatkan, estimasi penghematan wali murid dan pengurangan limbah tekstil per tahun).
8. **Penutup** — rencana keberlanjutan dan replikasi.
9. **Lampiran** — daftar dokumen wajib yang menyusul (KTP/Kartu Pelajar, surat pengantar sekolah, surat pernyataan inovasi, tautan video & source code), plus halaman tangkapan tampilan aplikasi (Beranda, Detail Produk, Keranjang/Checkout, Pesanan, Dashboard Koperasi, Konsol Admin Pusat).

## Catatan teknis

- PDF dibuat dengan skrip Python (ReportLab Platypus) di `/tmp`, output ke `/mnt/documents/Proposal_Inotek_2026_TOOKU.pdf`. Tidak ada perubahan pada kode aplikasi.
- Font Unicode DejaVu Sans agar karakter Indonesia dan tanda kutip aman; palet warna mengikuti brand TOOKU (biru navy + aksen kuning emas), kartu/tabel bergaris rapi agar unggul di komponen penilaian "tampilan proposal".
- Screenshot tampilan aplikasi diambil dari preview lokal via Playwright (Beranda, detail produk, keranjang, pesanan, dashboard koperasi, konsol pusat) dan disisipkan ke lampiran.
- Isi utama dijaga maksimal 10 halaman (di luar cover, biodata, lampiran) sesuai pedoman.
- Semua angka dampak diberi label "estimasi/asumsi" dengan dasar perhitungan tertulis, tidak mengklaim data resmi.
- QA: setiap halaman PDF dirender ke gambar dan diperiksa (teks terpotong, tabel meleset, gambar hilang) sebelum diserahkan.
- Data yang masih kosong (nama ketua & anggota tim, NISN, kontak, nama pembina) disediakan sebagai kolom bergaris untuk diisi, dan akan saya isikan bila datanya dikirim.
