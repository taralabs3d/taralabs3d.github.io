# Daftar Warna Filament — Fidget Clicker Custom Nama

Sumber kebenaran warna untuk configurator. Array `COLORS` di `app.js` harus selalu sinkron dengan tabel ini.
Kolom **ID** adalah kode yang dipakai di kode pesanan / URL desain (`?d=F.rd.pk.wh-...`).

| No | ID | Warna | HEX |
| -: | :-: | ----- | --- |
| 1 | `bk` | Black | `#000000` |
| 2 | `wh` | White | `#FFFFFF` |
| 3 | `be` | Beige | `#F0E0D6` |
| 4 | `gy` | Grey | `#75787B` |
| 5 | `sv` | Silver | `#C0C0C0` |
| 6 | `rd` | Red | `#BC2726` |
| 7 | `or` | Orange (Sunny Orange) | `#ED7334` |
| 8 | `pk` | Pink | `#F4A6C1` |
| 9 | `sk` | Sakura Pink | `#F7C6D9` |
| 10 | `mg` | Magenta | `#C52E79` |
| 11 | `lv` | Lavender Purple | `#685BC7` |
| 12 | `bl` | Blue (Klein Blue) | `#1729AB` |
| 13 | `cy` | Cyan | `#00A3E0` |
| 14 | `yl` | Yellow | `#FFF13F` |
| 15 | `vy` | Vivid Yellow | `#EAC642` |
| 16 | `gr` | Green | `#1DAA27` |
| 17 | `gg` | Grass Green | `#4CAF50` |
| 18 | `ol` | Olive Green | `#5A6D3D` |
| 19 | `ch` | Chocolate | `#5C3A21` |
| 20 | `cf` | Coffee | `#362111` |

## Cara update

1. Ubah/tambah baris di tabel ini.
2. Sinkronkan array `COLORS` di `app.js` (id, name, hex).
3. Kalau menambah/menghapus warna, cek juga `PRESETS` di `app.js` — semua id yang dirujuk preset harus ada di `COLORS`.

## Catatan

- Hex adalah warna filament di kondisi cahaya netral; tampilan di layar juga dipengaruhi `CONFIG.brightness` di `app.js`.
- Kode pesanan menampilkan **nama** warna (bukan hex), jadi nama di tabel ini yang dibaca tim produksi.
