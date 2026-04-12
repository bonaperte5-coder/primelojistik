/* ===========================
   PRIME EXPRESS LOJİSTİK
   main.js — Production v3
   =========================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ===========================
     PRELOADER
     =========================== */
  const preloader = document.getElementById('preloader');
  if (preloader) {
    const hidePreloader = () => preloader.classList.add('hidden');
    if (document.readyState === 'complete') {
      setTimeout(hidePreloader, 200);
    } else {
      window.addEventListener('load', () => setTimeout(hidePreloader, 200));
    }
  }

  /* ===========================
     SCROLL PROGRESS BAR
     =========================== */
  const scrollProgress = document.getElementById('scrollProgress');
  if (scrollProgress) {
    window.addEventListener('scroll', () => {
      const scrollTop  = window.scrollY;
      const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
      const progress   = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      scrollProgress.style.width = progress + '%';
    }, { passive: true });
  }

  /* ===========================
     HEADER SCROLL EFFECT
     =========================== */
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  /* ===========================
     MOBİL DRAWER MENÜ
     =========================== */
  const menuToggle = document.querySelector('.menu-toggle');
  const mobDrawer  = document.getElementById('mobDrawer');
  const mobClose   = document.getElementById('mobClose');
  const mobBackdrop = document.getElementById('mobBackdrop');

  function openDrawer() {
    if (!mobDrawer) return;
    mobDrawer.classList.add('open');
    menuToggle?.classList.add('open');
    menuToggle?.setAttribute('aria-expanded', 'true');
  }

  function closeDrawer() {
    if (!mobDrawer) return;
    mobDrawer.classList.remove('open');
    menuToggle?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    /* Alt menüyü de kapat */
    document.querySelectorAll('.mob-sub-menu.open').forEach(sub => sub.classList.remove('open'));
    document.querySelectorAll('.mob-has-sub[aria-expanded="true"]').forEach(btn => btn.setAttribute('aria-expanded', 'false'));
  }

  menuToggle?.addEventListener('click', () => {
    mobDrawer?.classList.contains('open') ? closeDrawer() : openDrawer();
  });
  mobClose?.addEventListener('click', closeDrawer);
  mobBackdrop?.addEventListener('click', closeDrawer);

  /* Hizmetlerimiz alt menü aç/kapat */
  document.querySelectorAll('.mob-has-sub').forEach(btn => {
    btn.addEventListener('click', () => {
      const sub    = btn.nextElementSibling;
      const isOpen = sub?.classList.contains('open');
      sub?.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* Drawer içi linklere tıklayınca kapat */
  document.querySelectorAll('.mob-sub-item, .mob-panel-footer a').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
  document.querySelectorAll('.mob-nav-item:not(.mob-has-sub)').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  /* ===========================
     SCROLL TO TOP
     =========================== */
  const scrollTopBtn = document.getElementById('scrollTop');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 450);
    }, { passive: true });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ===========================
     FAQ ACCORDION
     =========================== */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const answer = btn.nextElementSibling;
      const item   = btn.closest('.faq-item');
      const isOpen = btn.classList.contains('open');

      document.querySelectorAll('.faq-question').forEach(q => {
        q.classList.remove('open');
        q.setAttribute('aria-expanded', 'false');
        if (q.nextElementSibling) q.nextElementSibling.classList.remove('open');
        if (q.closest('.faq-item')) q.closest('.faq-item').classList.remove('open');
      });

      if (!isOpen) {
        btn.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        if (answer) answer.classList.add('open');
        if (item)   item.classList.add('open');
      }
    });
  });

  /* ===========================
     INTERSECTION OBSERVER: FADE-IN
     =========================== */
  const fadeEls = document.querySelectorAll('.fade-in');
  if (fadeEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(el => observer.observe(el));
  } else {
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  /* ===========================
     PROCESS STEPS — STAGGERED REVEAL
     =========================== */
  const processSteps = document.querySelectorAll('.process-step');
  if (processSteps.length && 'IntersectionObserver' in window) {
    const stepObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = Array.from(processSteps).indexOf(entry.target);
          setTimeout(() => entry.target.classList.add('step-visible'), idx * 130);
          stepObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

    processSteps.forEach(step => stepObserver.observe(step));
  }

  /* ===========================
     COUNTER ANIMATION (STATS)
     =========================== */
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if (statNumbers.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));
  }

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 2000;
    const start    = performance.now();

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(ease * target);
      el.innerHTML   = current.toLocaleString('tr-TR') + '<span class="stat-number-accent">' + suffix + '</span>';
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  /* ===========================
     ACTIVE NAV LINK
     =========================== */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('#') && href.includes(currentPage.replace('.html', ''))) {
      link.classList.add('active');
    }
  });

  /* ===========================
     SMOOTH SCROLL FOR ANCHORS
     =========================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetEl = document.querySelector(this.getAttribute('href'));
      if (targetEl) {
        e.preventDefault();
        const headerHeight = document.querySelector('.header')?.offsetHeight || 70;
        const top = targetEl.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ===========================
     HERO CARD TILT EFFECT
     =========================== */
  document.querySelectorAll('.hero-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x    = ((e.clientX - rect.left) / rect.width  - 0.5) * 8;
      const y    = ((e.clientY - rect.top)  / rect.height - 0.5) * 8;
      card.style.transform = `translateY(-4px) rotateX(${-y}deg) rotateY(${x}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  /* ===========================
     RIPPLE EFFECT ON BUTTONS
     =========================== */
  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      const rect   = this.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height);
      Object.assign(ripple.style, {
        position: 'absolute',
        width: size + 'px',
        height: size + 'px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.25)',
        top:  (e.clientY - rect.top  - size / 2) + 'px',
        left: (e.clientX - rect.left - size / 2) + 'px',
        transform: 'scale(0)',
        animation: 'ripple-anim 0.6s ease-out',
        pointerEvents: 'none',
      });
      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  if (!document.getElementById('ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = '@keyframes ripple-anim { to { transform:scale(4); opacity:0; } }';
    document.head.appendChild(style);
  }

  /* ===========================
     INPUT VALIDATION HELPERS
     =========================== */
  function sanitizeInput(str, maxLen) {
    return String(str || '')
      .replace(/[<>]/g, '')
      .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '')
      .trim()
      .slice(0, maxLen || 500);
  }

  function isValidPhone(phone) {
    return /^[\d\s\+\-\(\)]{7,20}$/.test(phone);
  }

  function isValidEmail(email) {
    return /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,}$/.test(email);
  }

  function showFormError(errorEl, msg) {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  }

  function clearFormError(errorEl) {
    if (!errorEl) return;
    errorEl.textContent = '';
    errorEl.style.display = 'none';
  }

  /* ===========================
     FORM SUBMISSION (shared logic)
     =========================== */
  async function submitForm(payload, btn, errorEl) {
    clearFormError(errorEl);

    // Client-side validation
    const name  = sanitizeInput(payload.name, 100);
    const phone = sanitizeInput(payload.phone, 30);
    const email = sanitizeInput(payload.email, 100);

    if (!name || name.length < 2) {
      showFormError(errorEl, 'Lütfen adınızı ve soyadınızı girin.');
      return false;
    }
    if (!phone || !isValidPhone(phone)) {
      showFormError(errorEl, 'Lütfen geçerli bir telefon numarası girin.');
      return false;
    }
    if (email && !isValidEmail(email)) {
      showFormError(errorEl, 'Lütfen geçerli bir e-posta adresi girin.');
      return false;
    }

    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span style="opacity:.7">Gönderiliyor...</span>';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    sanitizeInput(payload.name,    100),
          phone:   sanitizeInput(payload.phone,   30),
          email:   sanitizeInput(payload.email,   100),
          service: sanitizeInput(payload.service, 100),
          from:    sanitizeInput(payload.from,    100),
          to:      sanitizeInput(payload.to,      100),
          note:    sanitizeInput(payload.note,    1000),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showFormError(errorEl, data.error || 'Bir hata oluştu. Lütfen tekrar deneyin.');
        btn.disabled = false;
        btn.innerHTML = originalHTML;
        return false;
      }

      // Success
      btn.innerHTML = '✓ Talebiniz Alındı!';
      btn.style.background = 'linear-gradient(135deg, #15803d, #166534)';

      setTimeout(() => {
        btn.innerHTML  = originalHTML;
        btn.style.background = '';
        btn.disabled   = false;
      }, 4000);

      return true;

    } catch (err) {
      // Network error fallback — mailto
      showFormError(errorEl,
        'Bağlantı hatası. Lütfen +90 850 317 77 35 numaralı hattı arayın veya WhatsApp üzerinden yazın.');
      btn.disabled  = false;
      btn.innerHTML = originalHTML;
      return false;
    }
  }

  /* ===========================
     TEKLİF FORMU (index.html)
     =========================== */
  const quoteForm = document.getElementById('quote-form');
  if (quoteForm) {
    quoteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn     = quoteForm.querySelector('.form-submit');
      const errorEl = document.getElementById('quote-form-error');

      const ok = await submitForm({
        name:    quoteForm.querySelector('#ad-soyad')?.value,
        phone:   quoteForm.querySelector('#telefon')?.value,
        email:   quoteForm.querySelector('#email')?.value,
        service: quoteForm.querySelector('#hizmet')?.value,
        from:    quoteForm.querySelector('#kalkis')?.value,
        to:      quoteForm.querySelector('#varis')?.value,
        note:    quoteForm.querySelector('#not')?.value,
      }, btn, errorEl);

      if (ok) quoteForm.reset();
    });
  }

  /* ===========================
     İLETİŞİM FORMU (iletisim.html)
     =========================== */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn     = contactForm.querySelector('.form-submit');
      const errorEl = document.getElementById('contact-form-error');

      const ok = await submitForm({
        name:    contactForm.querySelector('#c-ad')?.value,
        phone:   contactForm.querySelector('#c-tel')?.value,
        email:   contactForm.querySelector('#c-email')?.value,
        service: contactForm.querySelector('#c-konu')?.value,
        note:    contactForm.querySelector('#c-mesaj')?.value,
      }, btn, errorEl);

      if (ok) contactForm.reset();
    });
  }

});
