/* ===================================================
   فن الحدائق — script.js
   Gallery Filters | Hero Slider | Lightbox | Navbar | Scroll Animations
=================================================== */

'use strict';

/* ─── NAVBAR: scroll effect + hamburger ─────────────────────── */
(function initNavbar() {
  const navbar     = document.getElementById('navbar');
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  // Scroll → add .scrolled class
  function onScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  // Hamburger toggle
  function toggleMenu() {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', toggleMenu);

  // Close menu when a link is clicked
  mobileLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close menu on outside click
  document.addEventListener('click', function(e) {
    if (
      mobileMenu.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
})();


/* ─── HERO SLIDER ────────────────────────────────────────────── */
(function initHeroSlider() {
  const slides    = document.querySelectorAll('.hero-slide');
  const dots      = document.querySelectorAll('.dot');
  if (!slides.length) return;

  let current  = 0;
  let timer    = null;
  const DELAY  = 5000; // 5 seconds per slide

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function next() { goTo(current + 1); }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(next, DELAY);
  }

  // Dot clicks
  dots.forEach(function(dot) {
    dot.addEventListener('click', function() {
      goTo(parseInt(this.dataset.index, 10));
      startTimer(); // reset timer on manual click
    });
  });

  // Touch swipe support on hero
  const hero = document.querySelector('.hero');
  if (hero) {
    let touchStartX = 0;
    hero.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    hero.addEventListener('touchend', function(e) {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? next() : goTo(current - 1);
        startTimer();
      }
    }, { passive: true });
  }

  startTimer();
})();


/* ─── GALLERY FILTERS ────────────────────────────────────────── */
(function initFilters() {
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (!filterBtns.length) return;

  filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const filter = this.dataset.filter;

      // Update active button
      filterBtns.forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');

      // Show / hide items
      galleryItems.forEach(function(item) {
        if (filter === 'all' || item.dataset.category === filter) {
          item.classList.remove('hidden');
          // Small stagger animation
          item.style.animation = 'none';
          void item.offsetWidth; // reflow
          item.style.animation = 'fadeUp 0.35s ease forwards';
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
})();


/* ─── LIGHTBOX ───────────────────────────────────────────────── */
(function initLightbox() {
  const lightbox     = document.getElementById('lightbox');
  const lightboxImg  = document.getElementById('lightboxImg');
  const lightboxCap  = document.getElementById('lightboxCaption');
  const closeBtn     = document.getElementById('lightboxClose');
  const prevBtn      = document.getElementById('lightboxPrev');
  const nextBtn      = document.getElementById('lightboxNext');
  if (!lightbox) return;

  // Collect all visible gallery images
  function getVisibleImgs() {
    return Array.from(
      document.querySelectorAll('.gallery-item:not(.hidden) .gallery-img-wrap img')
    );
  }

  let currentIndex = 0;

  function openLightbox(img, allImgs) {
    currentIndex = allImgs.indexOf(img);
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCap.textContent = img.alt;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  function showByIndex(index) {
    const imgs = getVisibleImgs();
    if (!imgs.length) return;
    currentIndex = (index + imgs.length) % imgs.length;
    lightboxImg.src = imgs[currentIndex].src;
    lightboxImg.alt = imgs[currentIndex].alt;
    lightboxCap.textContent = imgs[currentIndex].alt;
  }

  // Attach click to zoom buttons
  document.addEventListener('click', function(e) {
    const zoomBtn = e.target.closest('.gallery-zoom');
    if (zoomBtn) {
      e.stopPropagation();
      const wrap = zoomBtn.closest('.gallery-img-wrap');
      const img  = wrap ? wrap.querySelector('img') : null;
      if (img) openLightbox(img, getVisibleImgs());
    }

    // Also open on image click
    const galleryImg = e.target.closest('.gallery-img-wrap img');
    if (galleryImg) {
      openLightbox(galleryImg, getVisibleImgs());
    }
  });

  closeBtn.addEventListener('click', closeLightbox);

  prevBtn.addEventListener('click', function() { showByIndex(currentIndex - 1); });
  nextBtn.addEventListener('click', function() { showByIndex(currentIndex + 1); });

  // Close on backdrop click
  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard support
  document.addEventListener('keydown', function(e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   showByIndex(currentIndex + 1);
    if (e.key === 'ArrowRight')  showByIndex(currentIndex - 1);
  });

  // Touch swipe inside lightbox
  let lbTouchX = 0;
  lightbox.addEventListener('touchstart', function(e) {
    lbTouchX = e.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', function(e) {
    const diff = lbTouchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? showByIndex(currentIndex + 1) : showByIndex(currentIndex - 1);
    }
  }, { passive: true });
})();


/* ─── SCROLL REVEAL ANIMATIONS ───────────────────────────────── */
(function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.service-card, .contact-card, .gallery-item, .stat-item, .why-list li, .cta-box'
  );

  if (!targets.length) return;

  // Add reveal class
  targets.forEach(function(el) {
    el.classList.add('reveal');
  });

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry, i) {
      if (entry.isIntersecting) {
        // Stagger effect
        setTimeout(function() {
          entry.target.classList.add('visible');
        }, i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(function(el) {
    observer.observe(el);
  });
})();


/* ─── SMOOTH SCROLL for anchor links ────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navH = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--nav-h'),
          10
        ) || 68;
        const top = target.getBoundingClientRect().top + window.scrollY - navH;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });
})();


/* ─── ACTIVE NAV LINK on scroll ─────────────────────────────── */
(function initActiveNav() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const navH = 80;

  function updateActive() {
    let current = '';
    sections.forEach(function(section) {
      if (window.scrollY >= section.offsetTop - navH - 40) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(function(link) {
      link.classList.remove('active-link');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active-link');
      }
    });
  }

  window.addEventListener('scroll', updateActive, { passive: true });
})();
