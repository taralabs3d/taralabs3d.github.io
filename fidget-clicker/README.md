# Fidget Clicker Custom Nama — 3D Configurator

Website configurator 3D untuk produk fidget clicker custom nama (TaraLabs.3D).
User ketik nama → preview 3D real-time → pilih warna per blok → salin kode pesanan ke catatan checkout Shopee.

## Cara menjalankan (lokal)

Harus lewat server lokal (bukan double-click file, karena browser memblokir module & GLB dari `file://`):

```bash
cd "<folder ini>"
python3 -m http.server 8765
```

Lalu buka **http://localhost:8765** di browser. Butuh internet (Three.js dimuat dari CDN).

## Yang perlu diganti sebelum rilis (cari di `app.js`, bagian `CONFIG`)

| Setting | Keterangan |
|---|---|
| `pricePerBlock` | Harga per blok (sekarang placeholder Rp 12.500) |
| `shopeeUrl` | Link listing produk di Shopee |
| `waNumber` | Nomor WhatsApp format `628xxxxxxxxxx` |

## Fine-tuning visual (bagian `CONFIG.layout`)

| Setting | Keterangan |
|---|---|
| `pitch` | Jarak antar blok (mm). Default 27. |
| `capYaw` | Putar keycap 0/90/180/270 kalau arah huruf kurang pas |
| `connectorX` | Posisi end connector di ujung kiri |
| `pressDepth` | Kedalaman animasi klik keycap |

Palet warna: array `COLORS` (id, nama, hex) — sesuaikan dengan filament yang tersedia.
Preset: array `PRESETS`.

## Struktur

- `index.html` — UI + style
- `app.js` — logika 3D (Three.js) + configurator
- `assets/parts.glb` — semua part hasil konversi dari 3MF (1.08 MB): base, lock, keycap, huruf A–Z & 0–9, 15 simbol, end connector
- `assets/meta.json` — metadata offset assembly

File GLB dihasilkan oleh script `convert.py` (scratchpad session Claude) dari:
- `Base_-_Elevated_Hook_(Need_Support).3mf` (base "Normal Fit - Bottom Hole" + Assembly offset)
- `Chunkier+Keycaps+(Embossed).3mf` (keycap + huruf font "Nurse Holiday")
- `End+Connector.3mf`

## Deploy gratis

Upload folder ini ke [Netlify Drop](https://app.netlify.com/drop) (drag & drop), atau Vercel / GitHub Pages. Tidak butuh backend.

## Catatan produksi

- Kode pesanan menyertakan **link desain** (URL berisi seluruh konfigurasi) — buka link itu untuk melihat persis pesanan pembeli.
- Huruf Z di file 3MF sumber aslinya salah label ("A" dengan teks "z") — sudah dikoreksi otomatis saat konversi.
