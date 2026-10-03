/**
 * APEX PAINT PROTECTION - Interactive Application Logic
 * Inspiration: Datum Paint Protection (Scottsdale, AZ)
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileNav();
  initRulerTicks();
  initAnimatedCounters();
  initComparisonSlider();
  initServiceSheets();
  initQuoteModal();
  initHeroCanvas();
  initCookieConsent();
  initContactForm();
});

/* ==========================================================================
   1. SITE HEADER SCROLL EFFECTS
   ========================================================================== */
function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ==========================================================================
   2. MOBILE DRAWER NAVIGATION
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const closeBtn = document.getElementById('mobile-drawer-close');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  const quoteMobileBtn = document.querySelector('.btn-quote-mobile');

  if (!drawer || !toggleBtn) return;

  const openDrawer = () => {
    drawer.showModal();
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.close();
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  if (quoteMobileBtn) {
    quoteMobileBtn.addEventListener('click', () => {
      closeDrawer();
      openQuoteModal();
    });
  }

  drawer.addEventListener('cancel', () => {
    document.body.style.overflow = '';
    toggleBtn.setAttribute('aria-expanded', 'false');
  });
}

/* ==========================================================================
   3. ARCHITECTURAL GOLD RULER TICKS
   ========================================================================== */
function initRulerTicks() {
  const ticksContainer = document.getElementById('ruler-ticks');
  if (!ticksContainer) return;

  // Generate 41 ticks (0% to 100% every 2.5%)
  const totalTicks = 41;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < totalTicks; i++) {
    const tick = document.createElement('span');
    const percent = (i / (totalTicks - 1)) * 100;
    tick.style.left = `${percent}%`;
    tick.classList.add('ruler-tick');

    if (i % 10 === 0) {
      tick.classList.add('major'); // 0%, 25%, 50%, 75%, 100%
    } else if (i % 5 === 0) {
      tick.classList.add('mid');   // 12.5%, 37.5%, 62.5%, 87.5%
    } else {
      tick.classList.add('minor');
    }

    fragment.appendChild(tick);
  }

  ticksContainer.appendChild(fragment);
}

/* ==========================================================================
   4. ANIMATED STAT COUNTERS
   ========================================================================== */
function initAnimatedCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;

  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        statNumbers.forEach(el => animateValue(el));
      }
    });
  }, { threshold: 0.25 });

  const whySection = document.getElementById('why');
  if (whySection) observer.observe(whySection);

  function animateValue(el) {
    const target = parseFloat(el.getAttribute('data-target') || '0');
    const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    const duration = 1800;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = target * easeOut;

      el.textContent = current.toFixed(decimals);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toFixed(decimals);
      }
    }

    requestAnimationFrame(update);
  }
}

/* ==========================================================================
   5. INTERACTIVE BEFORE / AFTER SLIDER & TREATMENT TABS
   ========================================================================== */
function initComparisonSlider() {
  const slider = document.getElementById('comparison-slider');
  const handle = document.getElementById('slider-handle');
  const beforeLayer = document.getElementById('before-layer');
  const afterImg = document.getElementById('after-img');
  const beforeImg = document.getElementById('before-img');
  const captionEl = document.getElementById('comparison-caption-text');
  const tabs = document.querySelectorAll('.results-tabs .tab-btn');

  if (!slider || !handle) return;

  // Comparison Datasets (Authentic iPhone Detailing Photos on the Purple Lotus Emira)
  const treatments = {
    correction: {
      afterSrc: 'results-correction-after.jpg',
      beforeSrc: 'results-correction-before.jpg',
      caption: 'Severe wash swirls, buffer trails, and oxidized haze on the Lotus Emira leveled to a 100% mirror-gloss purple reflection under shop hex lighting.',
      alt: 'Purple Lotus Emira before and after multi-stage paint correction in detailing shop bay'
    },
    ceramic: {
      afterSrc: 'results-ceramic-after.jpg',
      beforeSrc: 'results-ceramic-before.jpg',
      caption: 'Sluggish, flat water pooling across untreated paint vs. ultra-slick 112° hydrophobic water beading on the Lotus Emira after 9H ceramic coating.',
      alt: 'Purple Lotus Emira hood showing sluggish water sheeting vs extreme hydrophobic ceramic beads'
    },
    fullbody: {
      afterSrc: 'results-ppf-after.jpg',
      beforeSrc: 'results-ppf-before.jpg',
      caption: 'Highway stone chips, grit abrasions, and road rash on the Lotus Emira front bumper completely restored and armored under 8.5 mil self-healing PPF.',
      alt: 'Purple Lotus Emira front bumper road rash damage before vs wrapped self-healing PPF after'
    }
  };

  let isDragging = false;
  let currentPos = 50;

  function updateSliderPosition(percent) {
    currentPos = Math.max(3, Math.min(97, percent));
    slider.style.setProperty('--slider-pos', `${currentPos}%`);
    handle.setAttribute('aria-valuenow', Math.round(currentPos));
  }

  function handlePointer(e) {
    const rect = slider.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const percent = ((clientX - rect.left) / rect.width) * 100;
    updateSliderPosition(percent);
  }

  // Pointer & Touch Events
  slider.addEventListener('pointerdown', (e) => {
    isDragging = true;
    try { slider.setPointerCapture(e.pointerId); } catch (_) {}
    handlePointer(e);
  });

  slider.addEventListener('pointermove', (e) => {
    if (isDragging) {
      handlePointer(e);
    }
  });

  const stopDrag = (e) => {
    if (isDragging) {
      isDragging = false;
      try {
        slider.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  slider.addEventListener('pointerup', stopDrag);
  slider.addEventListener('pointercancel', stopDrag);

  // Native touch fallback for iOS Safari
  slider.addEventListener('touchstart', (e) => {
    isDragging = true;
    handlePointer(e);
  }, { passive: true });

  slider.addEventListener('touchmove', (e) => {
    if (isDragging) {
      handlePointer(e);
    }
  }, { passive: true });

  slider.addEventListener('touchend', () => { isDragging = false; });

  // Keyboard accessibility
  handle.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      updateSliderPosition(currentPos - 5);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      updateSliderPosition(currentPos + 5);
    }
  });

  // Tab Treatment Switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const treatKey = tab.getAttribute('data-comparison');
      const data = treatments[treatKey];
      if (!data) return;

      // Smooth fade transition
      slider.style.opacity = '0.7';
      setTimeout(() => {
        afterImg.src = data.afterSrc;
        beforeImg.src = data.beforeSrc;
        captionEl.textContent = data.caption;
        slider.style.opacity = '1';
        updateSliderPosition(50);
      }, 150);
    });
  });
}

/* ==========================================================================
   6. SERVICE DETAIL SLIDE-OVER SHEET (DRAWER)
   ========================================================================== */
const serviceData = {
  ppf: {
    title: "Paint Protection Film (PPF)",
    eyebrow: "Ultra-Clear Thermoplastic Polyurethane",
    content: `
      <div class="sheet-feature-block">
        <h3 class="sheet-feature-title">Self-Healing Impact Barrier</h3>
        <p class="sheet-feature-text">
          Our 8.5 mil clear urethane film acts as a sacrificial armor against rock chips, gravel blast, bird droppings, acid rain, and Arizona desert sandstorm abrasion. Light surface scratches and swirls vanish when exposed to engine warmth or sunlight.
        </p>
      </div>

      <div class="sheet-feature-block">
        <h3 class="sheet-feature-title">Coverage Packages</h3>
        <table class="sheet-spec-table">
          <thead>
            <tr>
              <th>Package</th>
              <th>Coverage Area</th>
              <th>Protection Level</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Track Pack</strong></td>
              <td>Full Front Bumper, Full Hood, Fenders, Rocker Panels, Rear Arches, A-Pillars</td>
              <td>Track / Highway</td>
            </tr>
            <tr>
              <td><strong>Full Front</strong></td>
              <td>Front Bumper, Complete Hood, Front Fenders, Headlights & Mirrors</td>
              <td>Daily Commute</td>
            </tr>
            <tr>
              <td><strong>Full Body</strong></td>
              <td>Every Exterior Painted Panel, Edges Wrapped Around Backside of Panels</td>
              <td>Total Museum Grade</td>
            </tr>
            <tr>
              <td><strong>Stealth / Matte</strong></td>
              <td>Transforms Any Gloss Factory Paint to a Smooth Satin Finish</td>
              <td>Full Restyle + Armor</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="sheet-feature-block">
        <h3 class="sheet-feature-title">Installation Standards</h3>
        <ul class="badge-list" style="margin-top: 0.5rem;">
          <li class="pill-badge">Wrapped Edge Technology</li>
          <li class="pill-badge">Zero Disassembly Necessary</li>
          <li class="pill-badge">Computer Cut Digital Templates</li>
          <li class="pill-badge">10-Year Transferable Warranty</li>
        </ul>
      </div>
    `
  },
  wraps: {
    title: "Bespoke Color Vinyl Wraps",
    eyebrow: "Full Exterior Color Transformation",
    content: `
      <div class="sheet-feature-block">
        <h3 class="sheet-feature-title">Reversible Color Customization</h3>
        <p class="sheet-feature-text">
          Completely reinvent your car's appearance without altering original OEM paint. Choose from over 300+ distinctive cast vinyl colors from industry leaders 3M, Avery Dennison, and Inozetek.
        </p>
      </div>

      <div class="sheet-feature-block">
        <h3 class="sheet-feature-title">Available Finishes</h3>
        <table class="sheet-spec-table">
          <thead>
            <tr>
              <th>Finish</th>
              <th>Visual Characteristic</th>
              <th>Care Level</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Ultra Gloss / Super Gloss</strong></td>
              <td>Deep reflection indistinguishable from fresh factory clearcoat</td>
              <td>Standard Wash</td>
            </tr>
            <tr>
              <td><strong>Satin & Matte</strong></td>
              <td>Silky smooth non-reflective sheen accentuating body lines</td>
              <td>Matte Cleaner</td>
            </tr>
            <tr>
              <td><strong>Color Flow / Metallic Flake</strong></td>
              <td>Dynamic shift under sunlight with intense metallic sparkle</td>
              <td>Standard Wash</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="sheet-feature-block">
        <h3 class="sheet-feature-title">Preserves Resale Value</h3>
        <p class="sheet-feature-text">
          The factory paint remains untouched and UV-shielded underneath. When you decide to sell or change aesthetics, the wrap peels off cleanly without leaving adhesive residue.
        </p>
      </div>
    `
  },
  ceramic: {
    title: "9H Professional Ceramic Coating",
    eyebrow: "Nanotechnology Molecular Matrix",
    content: `
      <div class="sheet-feature-block">
        <h3 class="sheet-feature-title">Permanent Hydrophobic Glass Layer</h3>
        <p class="sheet-feature-text">
          A liquid polymer containing pure silicon dioxide (SiO2) that cures into an ultra-hard 9H crystalline shield bonded permanently to your vehicle's clearcoat, wheels, brake calipers, and glass.
        </p>
      </div>

      <div class="sheet-feature-block">
        <h3 class="sheet-feature-title">Key Performance Advantages</h3>
        <table class="sheet-spec-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>Specification</th>
              <th>Benefit</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Water Contact Angle</strong></td>
              <td>112° Hydrophobic Bead</td>
              <td>Water, dirt & grime roll off effortlessly</td>
            </tr>
            <tr>
              <td><strong>UV & Heat Shield</strong></td>
              <td>Up to 1,200°F Thermal Resistance</td>
              <td>Prevents desert sun oxidation & clearcoat fade</td>
            </tr>
            <tr>
              <td><strong>Chemical Resistance</strong></td>
              <td>pH 2 to pH 13</td>
              <td>Shields against bird droppings, bug acid, road salt</td>
            </tr>
            <tr>
              <td><strong>Longevity</strong></td>
              <td>5-Year Documented Warranty</td>
              <td>Reported to Carfax vehicle history</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="sheet-feature-block">
        <h3 class="sheet-feature-title">Multi-Stage Preparation</h3>
        <p class="sheet-feature-text">
          Every ceramic package includes multi-stage decontamination wash, clay bar purification, and precision machine paint correction to eliminate swirl marks before sealing the glass finish.
        </p>
      </div>
    `
  }
};

function initServiceSheets() {
  const sheet = document.getElementById('service-sheet');
  const sheetClose = document.getElementById('service-sheet-close');
  const sheetTitle = document.getElementById('service-sheet-title');
  const sheetEyebrow = document.getElementById('service-sheet-eyebrow');
  const sheetBody = document.getElementById('service-sheet-body');
  const sheetCtaBtn = document.getElementById('sheet-book-btn');
  const triggerBtns = document.querySelectorAll('[data-open-sheet]');

  if (!sheet || !sheetBody) return;

  const openSheet = (key) => {
    const data = serviceData[key];
    if (!data) return;

    sheetTitle.textContent = data.title;
    sheetEyebrow.textContent = data.eyebrow;
    sheetBody.innerHTML = data.content;

    sheet.showModal();
    document.body.style.overflow = 'hidden';
  };

  const closeSheet = () => {
    sheet.close();
    document.body.style.overflow = '';
  };

  triggerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const key = btn.getAttribute('data-open-sheet');
      openSheet(key);
    });
  });

  if (sheetClose) sheetClose.addEventListener('click', closeSheet);

  sheet.addEventListener('cancel', () => {
    document.body.style.overflow = '';
  });

  if (sheetCtaBtn) {
    sheetCtaBtn.addEventListener('click', () => {
      closeSheet();
      openQuoteModal();
    });
  }
}

/* ==========================================================================
   7. QUOTE & BOOKING ESTIMATOR MODAL
   ========================================================================== */
function openQuoteModal() {
  const modal = document.getElementById('quote-modal');
  if (modal) {
    modal.showModal();
    document.body.style.overflow = 'hidden';
  }
}

function initQuoteModal() {
  const modal = document.getElementById('quote-modal');
  const closeBtn = document.getElementById('quote-modal-close');
  const form = document.getElementById('quote-form');
  const triggerBtns = document.querySelectorAll('.btn-quote');
  const totalDisplay = document.getElementById('estimate-total-display');
  const serviceCheckboxes = document.querySelectorAll('input[name="services"]');
  const successState = document.getElementById('quote-success-state');
  const successCloseBtn = document.getElementById('quote-success-close');

  if (!modal || !form) return;

  const closeModal = () => {
    modal.close();
    document.body.style.overflow = '';
    // Reset state after close
    setTimeout(() => {
      form.classList.remove('hidden');
      if (successState) successState.classList.add('hidden');
    }, 300);
  };

  triggerBtns.forEach(btn => {
    btn.addEventListener('click', openQuoteModal);
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (successCloseBtn) successCloseBtn.addEventListener('click', closeModal);

  modal.addEventListener('cancel', () => {
    document.body.style.overflow = '';
  });

  // Calculate dynamic live estimate
  function calculateTotal() {
    let total = 0;
    serviceCheckboxes.forEach(cb => {
      if (cb.checked) {
        total += parseInt(cb.getAttribute('data-price') || '0', 10);
      }
    });

    if (totalDisplay) {
      totalDisplay.textContent = total > 0 ? `$${total.toLocaleString()}` : '$0';
    }
  }

  serviceCheckboxes.forEach(cb => {
    cb.addEventListener('change', calculateTotal);
  });
  calculateTotal();

  // Handle Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic Validation
    const name = document.getElementById('client-name').value.trim();
    const phone = document.getElementById('client-phone').value.trim();
    const email = document.getElementById('client-email').value.trim();

    if (!name || !phone || !email) {
      showToast('Please fill in all required contact fields.');
      return;
    }

    // Show simulated success screen
    form.classList.add('hidden');
    if (successState) successState.classList.remove('hidden');

    showToast('Quote request sent successfully!');
  });
}

/* ==========================================================================
   8. HERO CAR CANVAS SPARKLE & GLINT EFFECT
   ========================================================================== */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-glint-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;

  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });
  resizeCanvas();

  // Floating glint particles
  const particles = [];
  const particleCount = 14;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * (canvas.width || 800),
      y: Math.random() * (canvas.height || 500),
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.8 + 0.2,
      fadeSpeed: (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1)
    });
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.alpha += p.fadeSpeed;

      if (p.alpha > 0.9) {
        p.alpha = 0.9;
        p.fadeSpeed = -Math.abs(p.fadeSpeed);
      } else if (p.alpha < 0.1) {
        p.alpha = 0.1;
        p.fadeSpeed = Math.abs(p.fadeSpeed);
      }

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      // Draw diamond sparkle star
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = `rgba(201, 169, 110, ${p.alpha * 0.7})`;
      ctx.shadowColor = 'rgba(201, 169, 110, 0.8)';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Soft flare cross
      ctx.strokeStyle = `rgba(255, 255, 255, ${p.alpha * 0.5})`;
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.moveTo(-p.size * 3, 0);
      ctx.lineTo(p.size * 3, 0);
      ctx.moveTo(0, -p.size * 3);
      ctx.lineTo(0, p.size * 3);
      ctx.stroke();

      ctx.restore();
    });

    animationFrameId = requestAnimationFrame(render);
  }

  render();
}

/* ==========================================================================
   9. TOAST NOTIFICATIONS
   ========================================================================== */
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('active');

  setTimeout(() => {
    toast.classList.remove('active');
  }, 3500);
}

/* ==========================================================================
   10. COOKIE CONSENT BANNER (Google AdSense & GDPR/CCPA Compliance)
   ========================================================================== */
function initCookieConsent() {
  const banner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('cookie-accept-btn');
  const declineBtn = document.getElementById('cookie-decline-btn');

  if (!banner) return;

  const cookieChoice = localStorage.getItem('apex_cookie_consent');
  if (!cookieChoice) {
    setTimeout(() => {
      banner.classList.add('visible');
    }, 1200);
  }

  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('apex_cookie_consent', 'accepted');
      banner.classList.remove('visible');
    });
  }

  if (declineBtn) {
    declineBtn.addEventListener('click', () => {
      localStorage.setItem('apex_cookie_consent', 'declined');
      banner.classList.remove('visible');
    });
  }
}

/* ==========================================================================
   11. CONTACT PAGE FORM HANDLER
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-page-form');
  const successBox = document.getElementById('contact-success-box');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Transmitting...</span>';
    }

    setTimeout(() => {
      form.style.display = 'none';
      if (successBox) {
        successBox.classList.remove('hidden');
      }
      showToast('Inquiry sent successfully to our studio team!');
    }, 800);
  });
}
