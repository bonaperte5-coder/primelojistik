/**
 * Prime Express Lojistik — Production Server
 * Çalıştır: node server.js
 * Tarayıcı: http://localhost:3000
 */

require('dotenv').config();

const http      = require('http');
const fs        = require('fs');
const path      = require('path');
const zlib      = require('zlib');
const nodemailer = require('nodemailer');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

/* ───────────────────────────────────────
   MIME types
─────────────────────────────────────── */
const MIME = {
  '.html':  'text/html; charset=utf-8',
  '.css':   'text/css; charset=utf-8',
  '.js':    'application/javascript; charset=utf-8',
  '.json':  'application/json',
  '.xml':   'application/xml',
  '.txt':   'text/plain; charset=utf-8',
  '.png':   'image/png',
  '.jpg':   'image/jpeg',
  '.jpeg':  'image/jpeg',
  '.gif':   'image/gif',
  '.svg':   'image/svg+xml',
  '.webp':  'image/webp',
  '.avif':  'image/avif',
  '.ico':   'image/x-icon',
  '.woff':  'font/woff',
  '.woff2': 'font/woff2',
  '.ttf':   'font/ttf',
  '.otf':   'font/otf',
  '.pdf':   'application/pdf',
  '.mp4':   'video/mp4',
  '.webm':  'video/webm',
};

/* ───────────────────────────────────────
   Security headers (production-grade)
─────────────────────────────────────── */
const SECURITY_HEADERS = {
  'X-Content-Type-Options':       'nosniff',
  'X-Frame-Options':              'SAMEORIGIN',
  'X-XSS-Protection':             '1; mode=block',
  'Referrer-Policy':              'strict-origin-when-cross-origin',
  'Permissions-Policy':           'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security':    'max-age=63072000; includeSubDomains; preload',
  // CSP: ajusta el hash/nonce si añades scripts inline
  'Content-Security-Policy':
    "default-src 'self'; " +
    "script-src 'self' https://www.instagram.com https://platform.instagram.com 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    "media-src 'self'; " +
    "connect-src 'self' https://formspree.io; " +
    "frame-src https://www.instagram.com https://www.google.com; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self' https://formspree.io;",
};

/* ───────────────────────────────────────
   Cache strategy
   - HTML → no-cache (always fresh)
   - Assets (CSS/JS/fonts) → 1 year immutable (version query strings used)
   - Images/video → 30 days
─────────────────────────────────────── */
function getCacheControl(ext) {
  if (ext === '.html') return 'no-cache, must-revalidate';
  if (['.css', '.js', '.woff', '.woff2', '.ttf', '.otf'].includes(ext))
    return 'public, max-age=31536000, immutable';
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg', '.ico'].includes(ext))
    return 'public, max-age=2592000';
  if (['.mp4', '.webm'].includes(ext))
    return 'public, max-age=86400';
  return 'public, max-age=3600';
}

/* ───────────────────────────────────────
   HTML-escape helper (prevents 404 XSS)
─────────────────────────────────────── */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ───────────────────────────────────────
   Nodemailer transporter
─────────────────────────────────────── */
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/* ───────────────────────────────────────
   Input sanitization
─────────────────────────────────────── */
function sanitizeText(str, maxLen = 500) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '')         // strip angle brackets
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '') // strip control chars
    .trim()
    .slice(0, maxLen);
}

function isValidEmail(email) {
  return /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,}$/.test(email);
}

function isValidPhone(phone) {
  return /^[\d\s\+\-\(\)]{7,20}$/.test(phone);
}

/* ───────────────────────────────────────
   /api/contact handler
─────────────────────────────────────── */
function handleContactForm(req, res) {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json', ...SECURITY_HEADERS });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk;
    if (body.length > 10240) { // 10 KB limit
      req.destroy();
      res.writeHead(413, { 'Content-Type': 'application/json', ...SECURITY_HEADERS });
      res.end(JSON.stringify({ error: 'Payload too large' }));
    }
  });

  req.on('end', async () => {
    let data;
    try {
      data = JSON.parse(body);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json', ...SECURITY_HEADERS });
      res.end(JSON.stringify({ error: 'Geçersiz veri formatı.' }));
      return;
    }

    // Validate & sanitize
    const name    = sanitizeText(data.name, 100);
    const phone   = sanitizeText(data.phone, 30);
    const email   = sanitizeText(data.email, 100);
    const service = sanitizeText(data.service, 100);
    const from_   = sanitizeText(data.from, 100);
    const to_     = sanitizeText(data.to, 100);
    const note    = sanitizeText(data.note, 1000);

    if (!name || name.length < 2) {
      res.writeHead(400, { 'Content-Type': 'application/json', ...SECURITY_HEADERS });
      res.end(JSON.stringify({ error: 'Ad soyad gereklidir.' }));
      return;
    }
    if (!phone || !isValidPhone(phone)) {
      res.writeHead(400, { 'Content-Type': 'application/json', ...SECURITY_HEADERS });
      res.end(JSON.stringify({ error: 'Geçerli bir telefon numarası girin.' }));
      return;
    }
    if (email && !isValidEmail(email)) {
      res.writeHead(400, { 'Content-Type': 'application/json', ...SECURITY_HEADERS });
      res.end(JSON.stringify({ error: 'Geçerli bir e-posta adresi girin.' }));
      return;
    }

    // If SMTP is configured, send email
    if (transporter) {
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
        <p style="margin-top:16px;font-size:12px;color:#888">Bu e-posta primeexpresslojistik.com web sitesi iletişim formu aracılığıyla gönderildi.</p>
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
        res.writeHead(500, { 'Content-Type': 'application/json', ...SECURITY_HEADERS });
        res.end(JSON.stringify({ error: 'E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin.' }));
        return;
      }
    } else {
      // Log to console when SMTP not configured (dev fallback)
      console.log('[contact form]', { name, phone, email, service, from_, to_, note });
    }

    res.writeHead(200, { 'Content-Type': 'application/json', ...SECURITY_HEADERS });
    res.end(JSON.stringify({ ok: true, message: 'Talebiniz alındı. En kısa sürede sizinle iletişime geçeceğiz.' }));
  });
}

/* ───────────────────────────────────────
   Static file handler
─────────────────────────────────────── */
function serveStatic(req, res) {
  let urlPath = '/';
  try {
    urlPath = decodeURIComponent(req.url.split('?')[0]);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain', ...SECURITY_HEADERS });
    res.end('Bad Request');
    return;
  }

  // Default route
  if (urlPath === '/') urlPath = '/index.html';

  // Remove trailing slash and redirect
  if (urlPath.endsWith('/') && urlPath !== '/') {
    res.writeHead(301, { Location: urlPath.slice(0, -1), ...SECURITY_HEADERS });
    res.end();
    return;
  }

  // Path traversal guard
  const filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
    res.writeHead(403, { 'Content-Type': 'text/plain', ...SECURITY_HEADERS });
    res.end('Forbidden');
    return;
  }

  const ext      = path.extname(filePath).toLowerCase();
  const mimeType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Try .html extension
      fs.readFile(filePath + '.html', (err2, data2) => {
        if (err2) {
          const safeUrl = escapeHtml(urlPath);
          res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', ...SECURITY_HEADERS });
          res.end(`<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>404 — Sayfa Bulunamadı | Prime Express Lojistik</title>
  <meta name="robots" content="noindex">
  <style>
    body{font-family:'Segoe UI',system-ui,sans-serif;background:#f8fafc;color:#0f172a;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
    .box{text-align:center;padding:48px 32px;background:#fff;border-radius:20px;box-shadow:0 8px 40px rgba(0,0,0,.08);max-width:480px;width:100%}
    h1{font-size:72px;font-weight:900;color:#16a34a;margin:0 0 8px}
    h2{font-size:22px;font-weight:700;margin:0 0 12px}
    p{color:#64748b;margin:0 0 28px}
    a{display:inline-block;padding:12px 28px;background:#16a34a;color:#fff;border-radius:999px;font-weight:600;text-decoration:none}
    a:hover{background:#15803d}
  </style>
</head>
<body>
  <div class="box">
    <h1>404</h1>
    <h2>Sayfa Bulunamadı</h2>
    <p><code>${safeUrl}</code> adresi mevcut değil.</p>
    <a href="/">Ana Sayfaya Dön</a>
  </div>
</body>
</html>`);
        } else {
          const headers = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache, must-revalidate', ...SECURITY_HEADERS };
          res.writeHead(200, headers);
          res.end(data2);
        }
      });
      return;
    }

    const cacheCtl        = getCacheControl(ext);
    const acceptEncoding  = req.headers['accept-encoding'] || '';
    const compressible    = ['.html', '.css', '.js', '.json', '.svg', '.txt', '.xml'].includes(ext);
    const canGzip         = compressible && /gzip/.test(acceptEncoding);
    const canBrotli       = compressible && /br/.test(acceptEncoding);

    const headers = {
      'Content-Type':  mimeType,
      'Cache-Control': cacheCtl,
      'Vary':          'Accept-Encoding',
      ...SECURITY_HEADERS,
    };

    if (canBrotli) {
      headers['Content-Encoding'] = 'br';
      res.writeHead(200, headers);
      zlib.brotliCompress(data, (e, compressed) => res.end(e ? data : compressed));
    } else if (canGzip) {
      headers['Content-Encoding'] = 'gzip';
      res.writeHead(200, headers);
      zlib.gzip(data, (e, compressed) => res.end(e ? data : compressed));
    } else {
      res.writeHead(200, headers);
      res.end(data);
    }
  });
}

/* ───────────────────────────────────────
   Main request router
─────────────────────────────────────── */
const server = http.createServer((req, res) => {
  // /api/contact — form handler
  if (req.url === '/api/contact' || req.url.startsWith('/api/contact?')) {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.primeexpresslojistik.com');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
    handleContactForm(req, res);
    return;
  }

  // Static files
  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log('\x1b[32m%s\x1b[0m', `
  ╔══════════════════════════════════════════╗
  ║  Prime Express Lojistik — Production     ║
  ║  http://localhost:${PORT}                   ║
  ╚══════════════════════════════════════════╝
  `);
  console.log('  Durdurmak için: Ctrl + C\n');
  if (!transporter) {
    console.warn('  \x1b[33m⚠ SMTP yapılandırılmadı. Form gönderimi konsola yazılacak.\x1b[0m');
    console.warn('  .env dosyasına SMTP_HOST, SMTP_USER, SMTP_PASS ekleyin.\n');
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\x1b[31m  Port ${PORT} kullanımda:\x1b[0m PORT=3001 node server.js`);
  } else {
    console.error(err);
  }
  process.exit(1);
});
