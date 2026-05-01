const nodemailer = require('nodemailer');

function sanitizeText(str, maxLen = 500) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>]/g, '').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '').trim().slice(0, maxLen);
}

function isValidEmail(email) {
  return /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,}$/.test(email);
}

function isValidPhone(phone) {
  return /^[\d\s\+\-\(\)]{7,20}$/.test(phone);
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const data = req.body || {};

  const name    = sanitizeText(data.name, 100);
  const phone   = sanitizeText(data.phone, 30);
  const email   = sanitizeText(data.email, 100);
  const service = sanitizeText(data.service, 100);
  const from_   = sanitizeText(data.from, 100);
  const to_     = sanitizeText(data.to, 100);
  const note    = sanitizeText(data.note, 1000);

  if (!name || name.length < 2) { res.status(400).json({ error: 'Ad soyad gereklidir.' }); return; }
  if (!phone || !isValidPhone(phone)) { res.status(400).json({ error: 'Geçerli bir telefon numarası girin.' }); return; }
  if (email && !isValidEmail(email)) { res.status(400).json({ error: 'Geçerli bir e-posta adresi girin.' }); return; }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const mailHtml = `
      <h2 style="color:#16a34a">Yeni Teklif Talebi — Prime Express Lojistik</h2>
      <table style="border-collapse:collapse;width:100%;font-family:sans-serif;">
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;width:140px">Ad Soyad</td><td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(name)}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Telefon</td><td style="padding:8px;border-bottom:1px solid #eee"><a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a></td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">E-posta</td><td style="padding:8px;border-bottom:1px solid #eee">${email ? `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>` : '—'}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Hizmet</td><td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(service) || '—'}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Kalkış</td><td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(from_) || '—'}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Varış</td><td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(to_) || '—'}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">Not</td><td style="padding:8px">${escapeHtml(note) || '—'}</td></tr>
      </table>
      <p style="margin-top:16px;font-size:12px;color:#888">Bu e-posta primeexpresslojistik.com iletişim formu aracılığıyla gönderildi.</p>
    `;

    try {
      await transporter.sendMail({
        from:    `"Prime Express Web" <${process.env.SMTP_USER}>`,
        to:      process.env.MAIL_TO || process.env.SMTP_USER,
        replyTo: email || undefined,
        subject: `Teklif Talebi — ${name}`,
        html:    mailHtml,
      });
    } catch (err) {
      console.error('[mail error]', err.message);
      res.status(500).json({ error: 'E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin.' });
      return;
    }
  }

  res.status(200).json({ ok: true, message: 'Talebiniz alındı. En kısa sürede sizinle iletişime geçeceğiz.' });
};
