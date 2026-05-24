exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key belum dikonfigurasi. Tambahkan GEMINI_API_KEY di Environment Variables Netlify.' })
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

PENTING: Balas HANYA dengan JSON array murni, tanpa teks lain, tanpa markdown, tanpa backtick.

Format JSON:
[
  {
    "nomor": 1,
    "pertanyaan": "...",
    "opsi": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "jawaban": "A",
    "penjelasan": "Penjelasan singkat mengapa jawaban ini benar"
  }
]

Aturan per jenis soal:
- Pilihan ganda: opsi = 4 pilihan (A-D), jawaban = huruf (A/B/C/D)
- Isian singkat: opsi = [], jawaban = "jawaban singkat"
- Essay / uraian: opsi = [], jawaban = "poin-poin kunci jawaban"
- Benar / Salah: opsi = ["A. Benar", "B. Salah"], jawaban = "A" atau "B"

Buat soal yang sesuai Kurikulum Merdeka Indonesia dan tepat untuk ${kelas}.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.error?.message || 'Gagal menghubungi Gemini API.';
      return { statusCode: response.status, body: JSON.stringify({ error: errMsg }) };
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const clean = rawText.replace(/```json|```/g, '').trim();
    const soalData = JSON.parse(clean);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ soal: soalData })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Terjadi kesalahan: ' + err.message })
    };
  }
};
