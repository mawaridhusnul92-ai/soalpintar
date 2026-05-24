exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key tidak dikonfigurasi. Tambahkan ANTHROPIC_API_KEY di environment variables Netlify.' })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Request tidak valid.' }) };
  }

  const { mapel, kelas, topik, kd, jenisSoal, jumlah, kesulitan } = body;

  if (!mapel || !kelas || !topik) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Mata pelajaran, kelas, dan topik wajib diisi.' }) };
  }

  const prompt = `Kamu adalah guru berpengalaman di Indonesia. Buat ${jumlah} soal ujian dengan ketentuan berikut:
- Mata pelajaran: ${mapel}
- Jenjang/kelas: ${kelas}
- Topik/materi: ${topik}
- Jenis soal: ${jenisSoal}
- Tingkat kesulitan: ${kesulitan}
${kd ? `- Kompetensi dasar: ${kd}` : ''}

Format output HARUS berupa JSON array seperti ini (tidak ada teks lain selain JSON murni):
[
  {
    "nomor": 1,
    "pertanyaan": "...",
    "opsi": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "jawaban": "A",
    "penjelasan": "Penjelasan singkat mengapa jawaban ini benar"
  }
]

Aturan format per jenis soal:
- Pilihan ganda: opsi = 4 pilihan (A-D), jawaban = huruf (A/B/C/D)
- Isian singkat: opsi = [], jawaban = "jawaban singkat"
- Essay / uraian: opsi = [], jawaban = "poin-poin kunci jawaban"
- Benar / Salah: opsi = ["A. Benar", "B. Salah"], jawaban = "A" atau "B"

Pastikan soal sesuai kurikulum Merdeka Indonesia dan level kognitif yang tepat.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.error?.message || 'Gagal menghubungi AI.' })
      };
    }

    const text = data.content.map(i => i.text || '').join('');
    const clean = text.replace(/```json|```/g, '').trim();
    const soalData = JSON.parse(clean);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ soal: soalData })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Terjadi kesalahan server: ' + err.message })
    };
  }
};
