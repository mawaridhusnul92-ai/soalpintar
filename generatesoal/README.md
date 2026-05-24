# SoalPintar — Generator Soal Ujian AI

## Struktur File

```
generatesoal/
├── index.html                    ← Landing page + App utama
├── netlify.toml                  ← Konfigurasi Netlify
├── netlify/
│   └── functions/
│       └── generate.js           ← Backend (API proxy)
└── README.md
```

## Cara Deploy ke Netlify

### Langkah 1 — Upload ke GitHub
1. Buat repository baru di github.com
2. Upload semua file ini (pertahankan struktur folder)

### Langkah 2 — Connect ke Netlify
1. Login ke netlify.com
2. Klik "Add new site" → "Import an existing project"
3. Pilih repository GitHub kamu
4. Klik "Deploy site"

### Langkah 3 — Tambahkan API Key (WAJIB!)
1. Di dashboard Netlify, buka: **Site settings → Environment variables**
2. Klik "Add a variable"
3. Key: `ANTHROPIC_API_KEY`
4. Value: isi dengan API key kamu dari console.anthropic.com
5. Klik Save
6. **Redeploy site** (Deploys → Trigger deploy → Deploy site)

### Langkah 4 — Custom Domain (opsional)
1. Di Netlify: Domain settings → Add custom domain
2. Beli domain di Niagahoster/Domainesia, arahkan nameserver ke Netlify

## Cara Dapat API Key Anthropic
1. Buka console.anthropic.com
2. Daftar/login
3. Buka menu "API Keys"
4. Klik "Create Key"
5. Copy key tersebut (simpan baik-baik, hanya tampil sekali)

## Catatan Biaya
- Netlify: GRATIS (free tier cukup untuk ratusan pengguna/bulan)
- Anthropic API: bayar per penggunaan (~Rp150-500 per generate soal)
- Rekomendasi: jual akses dengan harga Rp49.000-99.000/bulan
