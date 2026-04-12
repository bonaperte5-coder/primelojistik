/**
 * Prime Express Lojistik — OG Image Generator
 * Çalıştır: node generate-og.js
 * Çıktı: assets/img/og-image.png (1200x630)
 */

const sharp = require('sharp');
const path  = require('path');
const fs    = require('fs');

const OUT = path.join(__dirname, 'assets', 'img', 'og-image.png');

// 1200×630 SVG tasarım
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1"/>
    </linearGradient>
    <linearGradient id="stripe" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#16a34a;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#22c55e;stop-opacity:1"/>
    </linearGradient>
  </defs>

  <!-- Arka plan -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Yeşil sol border çizgisi -->
  <rect x="0" y="0" width="8" height="630" fill="url(#stripe)"/>

  <!-- Sağ üst dekoratif daire -->
  <circle cx="1100" cy="-60" r="280" fill="#16a34a" opacity="0.07"/>
  <circle cx="1150" cy="700" r="200" fill="#16a34a" opacity="0.05"/>

  <!-- Sol alt dekoratif -->
  <circle cx="-40" cy="580" r="180" fill="#22c55e" opacity="0.04"/>

  <!-- Üst yeşil tag -->
  <rect x="80" y="72" width="260" height="36" rx="18" fill="rgba(22,163,74,0.15)" stroke="#16a34a" stroke-width="1.5"/>
  <text x="210" y="96" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="700" fill="#22c55e" letter-spacing="1.5">TÜRK&#304;YE GENEL&#304; LOJ&#304;ST&#304;K</text>

  <!-- Ana başlık -->
  <text x="80" y="198" font-family="'Segoe UI', Arial, sans-serif" font-size="72" font-weight="900" fill="white">Prime Express</text>
  <text x="80" y="280" font-family="'Segoe UI', Arial, sans-serif" font-size="72" font-weight="900" fill="#22c55e">Lojistik</text>

  <!-- Ayırıcı çizgi -->
  <rect x="80" y="308" width="80" height="4" rx="2" fill="#16a34a"/>

  <!-- Alt açıklama -->
  <text x="80" y="360" font-family="'Segoe UI', Arial, sans-serif" font-size="26" font-weight="400" fill="rgba(255,255,255,0.7)">T&#252;rkiye Geneli 81 &#304;l &amp; Uluslararas&#305; Ta&#351;&#305;mac&#305;l&#305;k</text>
  <text x="80" y="398" font-family="'Segoe UI', Arial, sans-serif" font-size="22" font-weight="400" fill="rgba(255,255,255,0.5)">15+ Y&#305;l Deneyim · CMR Sigortal&#305; · 7/24 Destek · &#304;zmir</text>

  <!-- İletişim badges -->
  <rect x="80" y="454" width="290" height="52" rx="12" fill="rgba(22,163,74,0.12)" stroke="rgba(34,197,94,0.3)" stroke-width="1.5"/>
  <text x="225" y="486" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="700" fill="white">+90 850 317 77 35</text>

  <rect x="390" y="454" width="320" height="52" rx="12" fill="rgba(22,163,74,0.12)" stroke="rgba(34,197,94,0.3)" stroke-width="1.5"/>
  <text x="550" y="486" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="18" font-weight="600" fill="rgba(255,255,255,0.8)">info@primeexpresslojistik.com</text>

  <!-- Alt bar -->
  <rect x="0" y="570" width="1200" height="60" fill="rgba(22,163,74,0.08)"/>
  <rect x="0" y="570" width="1200" height="1.5" fill="rgba(34,197,94,0.2)"/>

  <!-- Tır ikonu (sağ taraf) -->
  <!-- Kabin -->
  <rect x="820" y="380" width="120" height="80" rx="8" fill="rgba(22,163,74,0.15)" stroke="rgba(34,197,94,0.3)" stroke-width="2"/>
  <!-- Kargo bölümü -->
  <rect x="935" y="360" width="200" height="100" rx="6" fill="rgba(22,163,74,0.1)" stroke="rgba(34,197,94,0.25)" stroke-width="2"/>
  <!-- Ön cam -->
  <rect x="826" y="388" width="50" height="40" rx="4" fill="rgba(34,197,94,0.15)" stroke="rgba(34,197,94,0.3)" stroke-width="1.5"/>
  <!-- Egzoz borusu -->
  <rect x="860" y="360" width="10" height="25" rx="4" fill="rgba(34,197,94,0.3)"/>
  <!-- Tekerlekler -->
  <circle cx="870" cy="465" r="22" fill="#1e293b" stroke="rgba(34,197,94,0.4)" stroke-width="3"/>
  <circle cx="870" cy="465" r="10" fill="rgba(34,197,94,0.2)"/>
  <circle cx="980" cy="465" r="22" fill="#1e293b" stroke="rgba(34,197,94,0.4)" stroke-width="3"/>
  <circle cx="980" cy="465" r="10" fill="rgba(34,197,94,0.2)"/>
  <circle cx="1090" cy="465" r="22" fill="#1e293b" stroke="rgba(34,197,94,0.4)" stroke-width="3"/>
  <circle cx="1090" cy="465" r="10" fill="rgba(34,197,94,0.2)"/>
  <!-- Yol çizgisi -->
  <rect x="800" y="487" width="370" height="3" rx="1.5" fill="rgba(34,197,94,0.15)"/>

  <!-- Alt bar yazısı -->
  <text x="600" y="607" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="17" font-weight="500" fill="rgba(255,255,255,0.4)">www.primeexpresslojistik.com</text>

  <!-- PE logo badge (sağ üst) -->
  <rect x="1060" y="68" width="72" height="72" rx="16" fill="#16a34a"/>
  <text x="1096" y="118" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="28" font-weight="900" fill="white">PE</text>
</svg>`;

(async () => {
  try {
    await sharp(Buffer.from(svg))
      .png({ quality: 90, compressionLevel: 8 })
      .toFile(OUT);
    console.log('✓ og-image.png oluşturuldu:', OUT);
  } catch (err) {
    console.error('Hata:', err.message);
    process.exit(1);
  }
})();
